/**
 * Generate a unique salesperson code based on role
 *
 * Role-based prefixes:
 * - Salesperson: REP (e.g., REP12345)
 * - Manager: SMR (e.g., SMR12345)
 * - Owner: VIP (e.g., VIP12345)
 */

export function generateSalespersonCode(role: string): string {
  let prefix: string;

  switch (role.toLowerCase()) {
    case "owner":
      prefix = "VIP";
      break;
    case "manager":
      prefix = "SMR";
      break;
    case "salesperson":
    default:
      prefix = "REP";
      break;
  }

  // Generate random 5-digit number
  const randomNum = Math.floor(10000 + Math.random() * 90000);

  return `${prefix}${randomNum}`;
}

/**
 * Check if a salesperson code is unique in the database
 */
export async function isCodeUnique(code: string, prisma: any): Promise<boolean> {
  const existing = await prisma.userProfile.findUnique({
    where: { salespersonCode: code },
  });

  return !existing;
}

/**
 * Generate a unique salesperson code (retry if collision)
 */
export async function generateUniqueSalespersonCode(
  role: string,
  prisma: any
): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateSalespersonCode(role);
    attempts++;

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique salesperson code");
    }
  } while (!(await isCodeUnique(code, prisma)));

  return code;
}
