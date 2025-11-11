export const ALIASES: Record<string,string> = {
  "timestamp": "createdAt",
  "rep full name": "salesRepName",
  "salesrep": "salesRepName",
  "sales rep": "salesRepName",
  "customer names": "fullName",
  "customer name": "fullName",
  "first name": "firstName",
  "last name": "lastName",
  "customer phone number": "phone",
  "phone": "phone",
  "email": "email",
  "trailer size": "trailerSize",
  "assigned manager": "assignedToName",
  "stock number (if in stock) or factory order": "stockNumber",
  "applied": "applied",
  "date of submission": "dateApplied",
  "cash/finance/rent to own": "financingType",
  "manager notes": "managerNotes",
  "rep notes": "repNotes",
  "zip": "zipcode",
  "state": "state",
  "address": "street",
};

export function normalize(h:string){ return h?.trim().toLowerCase(); }

export function headerIndexMap(headerRow: string[]) {
  const map: Record<string, number> = {};
  headerRow.forEach((h, i) => {
    const key = ALIASES[normalize(h)] ?? "";
    if (key) map[key] = i;
  });
  return map;
}

export function splitFullName(full?: string){
  if (!full) return { firstName: "", lastName: "" };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const lastName = parts.pop()!;
  return { firstName: parts.join(" "), lastName };
}

export function isLikelyPhone(v?: string){
  if (!v) return false;
  return /\d{3}[\s\-.]?\d{3}[\s\-.]?\d{4}/.test(v);
}
