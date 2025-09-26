import crypto from "crypto";

function dailyKeyUTC(dOffset = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dOffset);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // YYYY-MM-DD
}

export function makeCode(secret: string, dOffset = 0) {
  const key = Buffer.from(secret, "hex");
  const msg = dailyKeyUTC(dOffset);
  const hmac = crypto.createHmac("sha1", key).update(msg).digest();
  const code = (hmac.readUInt32BE(hmac.length - 4) % 1_000_000)
    .toString()
    .padStart(6, "0");
  return code;
}

export function verifyCode(secret: string, input: string) {
  const c = input.replace(/\D/g, "");
  return c === makeCode(secret, 0) || c === makeCode(secret, -1);
}