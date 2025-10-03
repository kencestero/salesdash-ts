import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("=== SignIn Callback ===");
      console.log("User:", user.email);
      console.log("Account:", account?.provider);
      console.log("Profile:", profile?.email);

      // Check if email restriction is enabled
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || [];

      if (allowedEmails.length > 0) {
        const userEmail = user.email || profile?.email;
        if (!allowedEmails.includes(userEmail)) {
          console.log("❌ Access denied - email not in allowed list:", userEmail);
          return false;
        }
        console.log("✅ Access granted - email in allowed list:", userEmail);
      }

      return true;
    },
    async jwt({ token, user }: any) {
      // Persist user ID to JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Attach user ID from JWT to session
      if (session?.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};
