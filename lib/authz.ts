import { auth } from "@/lib/auth";

export async function requireRole(roles: string[] = ["USER"]) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  if (roles.length && !roles.includes((session.user as any).role ?? "USER")) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
