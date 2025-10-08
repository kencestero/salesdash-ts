import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { generateUniqueSalespersonCode } from "./salespersonCode";

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
          try {
            // Get signup data from cookies (set before OAuth redirect)
            const firstName = cookies().get("signup_firstName")?.value;
            const lastName = cookies().get("signup_lastName")?.value;
            const phone = cookies().get("signup_phone")?.value;
            const zipcode = cookies().get("signup_zipcode")?.value;

            // Generate unique salesperson code based on role
            const salespersonCode = await generateUniqueSalespersonCode(
              joinRole,
              prisma
            );

            // Create new profile with role from join code AND signup data
            await prisma.userProfile.create({
              data: {
                userId: user.id,
                firstName: firstName ? decodeURIComponent(firstName) : undefined,
                lastName: lastName ? decodeURIComponent(lastName) : undefined,
                phone: phone ? decodeURIComponent(phone) : undefined,
                zipcode: zipcode ? decodeURIComponent(zipcode) : undefined,
                salespersonCode,
                role: joinRole as "owner" | "manager" | "salesperson",
                member: true,
              },
            });

            // Clear signup cookies
            cookies().delete("signup_firstName");
            cookies().delete("signup_lastName");
            cookies().delete("signup_phone");
            cookies().delete("signup_zipcode");

            console.log(
              `✅ Created UserProfile with role: ${joinRole}, code: ${salespersonCode}`
            );
          } catch (error) {
            console.error("❌ Failed to create UserProfile during OAuth:", error);
            // Allow sign-in to proceed even if profile creation fails
            // User can complete profile setup later
          }
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
      // Database strategy: use user.id from database session
      if (session?.user && user?.id) {
        session.user.id = user.id;

        // Fetch user profile to attach role
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
