import { headerIndexMap, splitFullName, isLikelyPhone } from "./headerMap";

export function rowToLead(row: string[], idx: Record<string,number>) {
  const g = (k:string)=> idx[k] != null ? (row[idx[k]] ?? "").toString().trim() : "";

  let firstName = g("firstName");
  let lastName  = g("lastName");
  if (!firstName && !lastName) {
    const { firstName:f, lastName:l } = splitFullName(g("fullName"));
    firstName = f; lastName = l;
  }

  let phone = g("phone");
  if (phone && /[A-Za-z]/.test(phone) && !isLikelyPhone(phone)) phone = "";

  const lead = {
    createdAt: g("createdAt") || new Date().toISOString(),
    salesRepName: g("salesRepName"),
    firstName, lastName,
    phone, email: g("email"),
    trailerSize: g("trailerSize"),
    assignedToName: g("assignedToName"),
    stockNumber: g("stockNumber"),
    applied: g("applied"),
    dateApplied: g("dateApplied"),
    financingType: g("financingType"),
    managerNotes: g("managerNotes"),
    repNotes: g("repNotes"),
    zipcode: g("zipcode"),
    state: g("state"),
    street: g("street"),
  };

  const hasContact = !!(lead.phone || lead.email);
  return {
    lead,
    status: hasContact ? "New" : "Needs Attention – No Contact",
    makeTask: !hasContact,
  };
}

export function parseSheet(rows: string[][]){
  const [header, ...body] = rows;
  const idx = headerIndexMap(header);
  return body.map(r => rowToLead(r, idx));
}
