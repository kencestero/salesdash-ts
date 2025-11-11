import crypto from "crypto";

export type SheetRow = {
  name?: string;
  email?: string;
  phone?: string;
  zip?: string;
  city?: string;
  state?: string;
  note?: string;
};

export function normalizePhone(v?: string) {
  if (!v) return undefined;
  const d = v.replace(/\D/g, "");
  return d ? d : undefined;
}

export function rowToLead(row: Record<string, string>): SheetRow {
  // Map common column headers → adjust if headers differ
  const name = row["Name"] ?? row["Customer Name"] ?? row["Full Name"] ?? row["name"] ?? row["Customer Names"] ?? row["Customer First Name"] ?? "";
  const email = row["Email"] ?? row["email"] ?? row["E-mail"] ?? "";
  const phone = row["Phone"] ?? row["Phone Number"] ?? row["phone"] ?? row["Customer Phone Number"] ?? "";
  const zip = row["ZIP"] ?? row["Zip"] ?? row["Zip Code"] ?? row["zip"] ?? "";
  const city = row["City"] ?? row["city"] ?? "";
  const state = row["State"] ?? row["state"] ?? "";
  const note = row["Notes"] ?? row["Note"] ?? row["notes"] ?? row["Manager Notes"] ?? row["Rep Notes"] ?? "";

  const clean: SheetRow = {
    name: name?.trim() || undefined,
    email: email?.trim() || undefined,
    phone: normalizePhone(phone),
    zip: zip?.trim() || undefined,
    city: city?.trim() || undefined,
    state: state?.trim() || undefined,
    note: note?.trim() || undefined,
  };
  return clean;
}

export function hashLead(l: SheetRow) {
  const base = `${l.name ?? ""}|${(l.email ?? "").toLowerCase()}|${l.phone ?? ""}|${l.zip ?? ""}|${l.city ?? ""}|${l.state ?? ""}`;
  return crypto.createHash("sha256").update(base).digest("hex");
}
