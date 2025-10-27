"use server";

import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ActionState = { ok: boolean; message?: string; reset?: boolean };

const RequestSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  manufacturer: z.string().min(2, "Select a manufacturer"),
  purpose: z.string().min(2, "Select a purpose"),
  message: z.string().min(5, "Please add a short description"),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "ZIP must be 5 digits")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

function getLangFromReferer(referer: string | null): string {
  if (!referer) return "en";
  const m = referer.match(/^https?:\/\/[^/]+\/([^/]+)/i);
  return m?.[1]?.slice(0, 5) || "en";
}

export async function submitRequest(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    manufacturer: String(formData.get("manufacturer") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    message: String(formData.get("message") ?? ""),
    zip: formData.get("zip") ? String(formData.get("zip")) : undefined,
  };

  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Invalid input" };
  }

  // Rep tracking fields from hidden form inputs
  const repUserId = String(formData.get("submittedByUserId") ?? "");
  const repCode = String(formData.get("repCode") ?? "");
  const managerId = String(formData.get("managerId") ?? "");
  const repName = parsed.data.fullName;
  const repEmail = parsed.data.email;

  const h = headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    undefined;
  const userAgent = h.get("user-agent") || undefined;
  const referer = h.get("referer");
  const lang = getLangFromReferer(referer);

  let logId: string | undefined;

  try {
    // 1) Create log (PENDING) — matches existing schema with manufacturer/purpose/rep fields
    const log = await prisma.requestLog.create({
      data: {
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        zip: parsed.data.zip,
        manufacturer: parsed.data.manufacturer,
        purpose: parsed.data.purpose,
        message: parsed.data.message,
        lang,
        ip,
        userAgent,
        status: "PENDING",

        submittedByUserId: repUserId || null,
        submittedByName: repName,
        submittedByEmail: repEmail,
        repCode: repCode || null,
        managerId: managerId || null,
        managerNotified: false,
      },
      select: { id: true },
    });
    logId = log.id;

    // 2) Send email to customer
    await resend.emails.send({
      from: `MJ SalesDash <${process.env.RESEND_FROM_EMAIL}>`,
      to: [parsed.data.email],
      reply_to: `request+${logId}@mjsalesdash.com`, // thread replies map to this log
      subject: `[${parsed.data.manufacturer}] ${parsed.data.purpose}`,
      text: [
        `Hi ${parsed.data.fullName},`,
        "",
        `We received your request (${parsed.data.purpose}) for ${parsed.data.manufacturer}.`,
        parsed.data.zip ? `ZIP: ${parsed.data.zip}` : "",
        "",
        `Message: ${parsed.data.message}`,
        "",
        "— MJ Cargo SalesDash",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    // 3) Mark as SENT
    await prisma.requestLog.update({
      where: { id: logId },
      data: { status: "SENT" },
    });

    return { ok: true, message: "Request logged and emailed.", reset: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process your request";

    try {
      if (logId) {
        await prisma.requestLog.update({
          where: { id: logId },
          data: { status: "FAILED", error: msg },
        });
      } else {
        await prisma.requestLog.create({
          data: {
            email: parsed.success ? parsed.data.email : "",
            fullName: parsed.success ? parsed.data.fullName : "",
            zip: parsed.success ? parsed.data.zip : undefined,
            manufacturer: parsed.success ? parsed.data.manufacturer : "unknown",
            purpose: parsed.success ? parsed.data.purpose : "unknown",
            message: parsed.success ? parsed.data.message : "",
            lang,
            ip,
            userAgent,
            status: "FAILED",
            error: msg,
            submittedByUserId: repUserId || null,
            submittedByName: repName,
            submittedByEmail: repEmail,
            repCode: repCode || null,
            managerId: managerId || null,
            managerNotified: false,
          },
        });
      }
    } catch {}

    return { ok: false, message: msg };
  }
}
