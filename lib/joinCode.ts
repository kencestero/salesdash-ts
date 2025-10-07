import crypto from "crypto";

export type UserRole = "owner" | "manager" | "salesperson";

function getTodayStamp() {
  // America/New_York midnight-based date
  const now = new Date();
  const ny = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now)
    .reduce((a, p) => {
      if (p.type !== "literal") (a as any)[p.type] = p.value;
      return a;
    }, {} as any);

  return `${ny.year}-${ny.month}-${ny.day}`; // e.g. 2025-10-07
}

export function todayCode() {
  // Backwards compatible - defaults to salesperson
  return todayCodeForRole("salesperson");
}

export function todayCodeForRole(role: UserRole): string {
  const stamp = getTodayStamp();
  const secret = process.env.AUTH_SECRET || "dev";

  // Different salt for each role to generate different codes
  const salt = `${stamp}-${role}`;
  const h = crypto.createHmac("sha256", secret).update(salt).digest("hex");

  return h.slice(0, 6).toUpperCase(); // 6-char daily code
}

export function getAllTodayCodes() {
  return {
    salesperson: todayCodeForRole("salesperson"),
    manager: todayCodeForRole("manager"),
    owner: todayCodeForRole("owner"),
  };
}

export function validateCodeAndGetRole(code: string): UserRole | null {
  const codes = getAllTodayCodes();
  const upperCode = code.toUpperCase();

  if (upperCode === codes.owner) return "owner";
  if (upperCode === codes.manager) return "manager";
  if (upperCode === codes.salesperson) return "salesperson";

  return null; // Invalid code
}