import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const gmail = google.gmail("v1");

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

/**
 * GET /api/cron/import-email-inventory
 *
 * Daily cron job that:
 * 1. Checks Gmail for emails with inventory attachments (PDF/Excel)
 * 2. Downloads attachments from approved senders
 * 3. Sends to AI import endpoint for processing
 * 4. Returns summary of imports
 *
 * Configured in vercel.json to run daily at midnight
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📧 Starting email inventory import...");

    // 2. Authenticate with Gmail API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    // 3. Search for emails with inventory attachments from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timestamp = Math.floor(yesterday.getTime() / 1000);

    // Get list of approved email senders from env (comma-separated)
    const approvedSenders = process.env.INVENTORY_EMAIL_SENDERS?.split(',').map(s => s.trim()) || [];

    // Build search query
    // If specific senders are configured, search only those
    // Otherwise search all emails with attachments
    let query = `has:attachment after:${timestamp}`;
    if (approvedSenders.length > 0) {
      const fromQuery = approvedSenders.map(sender => `from:${sender}`).join(' OR ');
      query = `(${fromQuery}) has:attachment after:${timestamp}`;
    }

    console.log(`📧 Searching Gmail with query: ${query}`);

    const response = await gmail.users.messages.list({
      auth: oauth2Client,
      userId: "me",
      q: query,
    });

    const messages = response.data.messages || [];
    console.log(`📧 Found ${messages.length} emails with attachments`);

    if (messages.length === 0) {
      return NextResponse.json({
        message: "No new inventory emails found",
        processed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Process each email
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const message of messages) {
      try {
        const messageData = await gmail.users.messages.get({
          auth: oauth2Client,
          userId: "me",
          id: message.id!,
        });

        const parts = messageData.data.payload?.parts || [];
        const headers = messageData.data.payload?.headers || [];

        // Get sender email for logging
        const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
        const senderEmail = fromHeader?.value || 'unknown';

        console.log(`📧 Processing email from: ${senderEmail}`);

        // Find PDF or Excel attachments
        for (const part of parts) {
          if (
            part.filename &&
            (part.filename.endsWith(".pdf") ||
              part.filename.endsWith(".xlsx") ||
              part.filename.endsWith(".xls") ||
              part.filename.endsWith(".csv"))
          ) {
            console.log(`📎 Processing attachment: ${part.filename}`);

            try {
              // Download attachment
              const attachment = await gmail.users.messages.attachments.get({
                auth: oauth2Client,
                userId: "me",
                messageId: message.id!,
                id: part.body!.attachmentId!,
              });

              const buffer = Buffer.from(attachment.data.data!, "base64");

              // Send to AI import endpoint
              const formData = new FormData();
              const blob = new Blob([buffer], {
                type: part.mimeType || 'application/octet-stream'
              });
              formData.append("file", blob, part.filename);

              // Call internal import API with system authentication
              const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
              const importResponse = await fetch(
                `${baseUrl}/api/inventory/upload`,
                {
                  method: "POST",
                  body: formData,
                  headers: {
                    // Use cron secret for system authentication
                    "X-System-Import": process.env.CRON_SECRET || '',
                  },
                }
              );

              const importResult = await importResponse.json();

              if (importResponse.ok) {
                successCount++;
                results.push({
                  filename: part.filename,
                  emailId: message.id,
                  sender: senderEmail,
                  status: "success",
                  summary: importResult.summary,
                });
                console.log(`✅ Imported ${part.filename}:`, importResult.summary);
              } else {
                errorCount++;
                results.push({
                  filename: part.filename,
                  emailId: message.id,
                  sender: senderEmail,
                  status: "failed",
                  error: importResult.error || "Unknown error",
                });
                console.error(`❌ Failed to import ${part.filename}:`, importResult.error);
              }
            } catch (attachmentError: any) {
              errorCount++;
              console.error(`❌ Error processing attachment ${part.filename}:`, attachmentError);
              results.push({
                filename: part.filename,
                emailId: message.id,
                sender: senderEmail,
                status: "failed",
                error: attachmentError.message,
              });
            }
          }
        }
      } catch (messageError: any) {
        errorCount++;
        console.error(`❌ Error processing email ${message.id}:`, messageError);
        results.push({
          emailId: message.id,
          status: "failed",
          error: messageError.message,
        });
      }
    }

    // 5. Return summary
    const summary = {
      message: "Email inventory import complete",
      timestamp: new Date().toISOString(),
      totalEmails: messages.length,
      totalProcessed: results.length,
      successful: successCount,
      failed: errorCount,
      results,
    };

    console.log(`✅ Email import complete:`, {
      totalEmails: messages.length,
      successful: successCount,
      failed: errorCount,
    });

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("❌ Email import error:", error);
    return NextResponse.json(
      {
        error: "Failed to import from email",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
