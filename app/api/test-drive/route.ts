/**
 * Google Drive Connection Test Endpoint
 *
 * Tests:
 * 1. Service account authentication
 * 2. Access to the target folder
 * 3. Ability to list files (read permission)
 * 4. Detailed error reporting
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function GET() {
  const results: {
    step: string;
    status: "success" | "error";
    message: string;
    details?: unknown;
  }[] = [];

  // Step 1: Check environment variables
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();
  const folderId = process.env.GOOGLE_DRIVE_CONTRACTOR_FOLDER_ID?.trim();

  if (!serviceAccountEmail) {
    results.push({
      step: "env_check",
      status: "error",
      message: "GOOGLE_SERVICE_ACCOUNT_EMAIL is not set",
    });
  } else {
    results.push({
      step: "env_check_email",
      status: "success",
      message: `Service account email: ${serviceAccountEmail}`,
    });
  }

  if (!privateKey) {
    results.push({
      step: "env_check",
      status: "error",
      message: "GOOGLE_PRIVATE_KEY is not set",
    });
  } else {
    // Check if key starts correctly
    const parsedKey = privateKey.replace(/\\n/g, "\n");
    const startsCorrectly = parsedKey.startsWith("-----BEGIN PRIVATE KEY-----");
    const endsCorrectly = parsedKey.trim().endsWith("-----END PRIVATE KEY-----");

    results.push({
      step: "env_check_key",
      status: startsCorrectly && endsCorrectly ? "success" : "error",
      message: startsCorrectly && endsCorrectly
        ? "Private key format looks correct"
        : `Private key format issue - starts: ${startsCorrectly}, ends: ${endsCorrectly}`,
      details: {
        keyLength: privateKey.length,
        parsedKeyLength: parsedKey.length,
        hasNewlines: privateKey.includes("\\n"),
        startsCorrectly,
        endsCorrectly,
      },
    });
  }

  if (!folderId) {
    results.push({
      step: "env_check",
      status: "error",
      message: "GOOGLE_DRIVE_CONTRACTOR_FOLDER_ID is not set",
    });
  } else {
    results.push({
      step: "env_check_folder",
      status: "success",
      message: `Folder ID: ${folderId}`,
    });
  }

  // If env vars missing, return early
  if (!serviceAccountEmail || !privateKey || !folderId) {
    return NextResponse.json({
      success: false,
      error: "Missing environment variables",
      results,
    });
  }

  // Step 2: Try to authenticate
  try {
    const parsedKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: parsedKey,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    // Try to get access token (this validates the credentials)
    const tokenResponse = await auth.getAccessToken();

    results.push({
      step: "auth",
      status: tokenResponse.token ? "success" : "error",
      message: tokenResponse.token
        ? "Successfully authenticated with Google"
        : "Failed to get access token",
      details: {
        hasToken: !!tokenResponse.token,
        tokenType: tokenResponse.res?.data?.token_type,
      },
    });

    if (!tokenResponse.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication failed",
        results,
      });
    }

    // Step 3: Try to access the folder (or Shared Drive)
    const drive = google.drive({ version: "v3", auth });

    // First try as a Shared Drive
    let isSharedDrive = false;
    try {
      const driveResponse = await drive.drives.get({
        driveId: folderId,
        fields: "id, name",
      });

      results.push({
        step: "folder_access",
        status: "success",
        message: `Successfully accessed Shared Drive: ${driveResponse.data.name}`,
        details: {
          id: driveResponse.data.id,
          name: driveResponse.data.name,
          type: "shared_drive",
        },
      });
      isSharedDrive = true;
    } catch {
      // Not a Shared Drive root, try as regular folder
      try {
        const folderResponse = await drive.files.get({
          fileId: folderId,
          fields: "id, name, mimeType, owners, permissions",
          supportsAllDrives: true,
        });

        results.push({
          step: "folder_access",
          status: "success",
          message: `Successfully accessed folder: ${folderResponse.data.name}`,
          details: {
            id: folderResponse.data.id,
            name: folderResponse.data.name,
            mimeType: folderResponse.data.mimeType,
            type: "folder",
          },
        });
      } catch (folderError: unknown) {
        const err = folderError as { code?: number; message?: string; errors?: Array<{ message: string; reason: string }> };
        results.push({
          step: "folder_access",
          status: "error",
          message: `Failed to access folder: ${err.message}`,
          details: {
            code: err.code,
            errors: err.errors,
            folderId,
          },
        });

        return NextResponse.json({
          success: false,
          error: `Cannot access folder (code ${err.code}): ${err.message}`,
          results,
          suggestion: err.code === 404
            ? "The folder ID may be wrong, or the service account doesn't have access. Share the folder with the service account email."
            : err.code === 403
            ? "The service account doesn't have permission. Make sure it has Editor access to the folder."
            : "Check the error details above.",
        });
      }
    }

    // Step 4: Try to list files in the folder
    try {
      const listResponse = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "files(id, name, mimeType, createdTime)",
        pageSize: 5,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      results.push({
        step: "list_files",
        status: "success",
        message: `Found ${listResponse.data.files?.length || 0} files in folder`,
        details: {
          fileCount: listResponse.data.files?.length || 0,
          files: listResponse.data.files?.map(f => ({ name: f.name, id: f.id })),
        },
      });
    } catch (listError: unknown) {
      const err = listError as { code?: number; message?: string };
      results.push({
        step: "list_files",
        status: "error",
        message: `Failed to list files: ${err.message}`,
        details: { code: err.code },
      });
    }

    // Step 5: Try a test upload (small text file)
    try {
      const testContent = `Test file created at ${new Date().toISOString()}`;
      const stream = Readable.from(Buffer.from(testContent));

      const uploadResponse = await drive.files.create({
        requestBody: {
          name: `_TEST_DELETE_ME_${Date.now()}.txt`,
          parents: [folderId],
        },
        media: {
          mimeType: "text/plain",
          body: stream,
        },
        fields: "id, name, webViewLink",
        supportsAllDrives: true,
      });

      results.push({
        step: "test_upload",
        status: "success",
        message: `Successfully uploaded test file: ${uploadResponse.data.name}`,
        details: {
          fileId: uploadResponse.data.id,
          webViewLink: uploadResponse.data.webViewLink,
        },
      });

      // Clean up - delete the test file
      if (uploadResponse.data.id) {
        try {
          await drive.files.delete({ fileId: uploadResponse.data.id });
          results.push({
            step: "cleanup",
            status: "success",
            message: "Test file deleted successfully",
          });
        } catch {
          results.push({
            step: "cleanup",
            status: "error",
            message: "Failed to delete test file (not critical)",
          });
        }
      }
    } catch (uploadError: unknown) {
      const err = uploadError as { code?: number; message?: string; errors?: Array<{ message: string; reason: string }> };
      results.push({
        step: "test_upload",
        status: "error",
        message: `Failed to upload test file: ${err.message}`,
        details: {
          code: err.code,
          errors: err.errors,
          fullError: JSON.stringify(uploadError, null, 2),
        },
      });

      return NextResponse.json({
        success: false,
        error: `Upload test failed (code ${err.code}): ${err.message}`,
        results,
        suggestion: err.code === 403
          ? "The service account can read but not write. Make sure it has EDITOR access, not just Viewer."
          : "Check the error details above.",
      });
    }

    // All tests passed
    return NextResponse.json({
      success: true,
      message: "All Google Drive tests passed!",
      results,
    });

  } catch (authError: unknown) {
    const err = authError as { message?: string; code?: string };
    results.push({
      step: "auth",
      status: "error",
      message: `Authentication error: ${err.message}`,
      details: {
        code: err.code,
        fullError: JSON.stringify(authError, null, 2),
      },
    });

    return NextResponse.json({
      success: false,
      error: `Authentication failed: ${err.message}`,
      results,
    });
  }
}
