import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database" as const,
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

      // NO EMAIL RESTRICTIONS - Join code is the only gatekeeper!
      // If they got here, they already validated the daily join code.
      console.log("✅ Access granted - join code already validated");

      return true;
    },
    async session({ session, user }: any) {
      // Attach user ID from database to session (database strategy)
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};
