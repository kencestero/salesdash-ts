// lib/auth-mw.ts
import NextAuth from "next-auth";

// IMPORTANT: no providers here — this runs in Edge (middleware)
export const { auth } = NextAuth({
  providers: [],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    // keep the member flag if it exists on the token
    async session({ session, token }) {
      (session as any).member = !!(token as any)?.member;
      return session;
    },
  },
});