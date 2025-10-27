"use server";

export async function submitRequest(formData: FormData) {
  try {
    const manufacturer = String(formData.get("manufacturer") || "");
    const purpose      = String(formData.get("purpose") || "");
    const vinOrOrder   = String(formData.get("vinOrOrder") || "");
    const message      = String(formData.get("message") || "");

    // Stubbed user for now
    const repName = "Test Rep";
    const repEmployeeId = "000";
    const managerEmail = "manager@mjcargo.com";

    const toMap: Record<string, string> = {
      "Diamond Cargo": "lee@diamondcargomfg.com",
      "Quality Cargo": "elvira@qualitytrailerusa.com",
      "Cargo Craft":   "spurvis50cargocraftga@gmail.com",
      "Panther":       "iliana@panthercargollc.com",
      "Diamond":       "lee@diamondcargomfg.com",
      "Quality":       "elvira@qualitytrailerusa.com",
      "Panther Trailers": "iliana@panthercargollc.com",
    };
    const to = toMap[manufacturer] ?? managerEmail;

    console.log("REQUEST", {
      repName, repEmployeeId, managerEmail, manufacturer, purpose, vinOrOrder, message, to
    });

    // Optional email via Resend (only if key is set)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "MJ Cargo <noreply@mjsalesdash.com>",
          to, cc: managerEmail,
          subject: `Request: ${purpose} - ${manufacturer}`,
          text: `Rep: ${repName}\nEmployee#: ${repEmployeeId}\nVIN/Order: ${vinOrOrder}\n\nMessage:\n${message}`
        });
        console.log("EMAIL_SENT", { to });
      } catch (e) {
        console.error("EMAIL_FAILED", e);
      }
    } else {
      console.log("EMAIL_SKIPPED: missing RESEND_API_KEY");
    }

    // Always return something to avoid 500
    return { ok: true };
  } catch (err) {
    console.error("REQUEST_ACTION_ERROR", err);
    return { ok: false };
  }
}
