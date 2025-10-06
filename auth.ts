// auth.ts (NextAuth v5)
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// If you have Prisma, add its adapter here; otherwise omit for now
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // adapter: PrismaAdapter(prisma), // <-- add later when ready
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
});
