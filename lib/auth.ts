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

      // Create or update UserProfile with role from join code
      if (user?.id) {
        const { cookies } = await import("next/headers");
        const joinRole = cookies().get("join_role")?.value || "salesperson";

        // Check if profile exists
        const existing = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });

        if (!existing) {
          // Create new profile with role from join code
          await prisma.userProfile.create({
            data: {
              userId: user.id,
              role: joinRole as "owner" | "manager" | "salesperson",
              member: true,
            },
          });
          console.log(`✅ Created UserProfile with role: ${joinRole}`);
        } else if (!existing.member) {
          // Update existing profile to mark as member
          await prisma.userProfile.update({
            where: { userId: user.id },
            data: { member: true },
          });
          console.log(`✅ Updated UserProfile - marked as member`);
        }

        // Clear the join cookies
        cookies().delete("join_ok");
        cookies().delete("join_role");
      }

      return true;
    },
    async session({ session, user }: any) {
      // Attach user ID from database to session (database strategy)
      if (session?.user) {
        session.user.id = user.id;

        // Also attach role to session
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });
        if (userProfile) {
          session.user.role = userProfile.role;
        }
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};
