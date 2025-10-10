import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { generateUniqueSalespersonCode } from "./salespersonCode";
import bcrypt from "bcryptjs";

export const authOptions = {
  // Note: No adapter needed - we're using JWT sessions and handling user creation in signIn callback
  session: {
    strategy: "jwt" as const, // JWT for credentials support
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
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

      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { profile: true },
      });

      // If existing user, check if email is verified
      if (existingUser) {
        // For OAuth users, if they're signing in again and email wasn't verified, verify it now
        if (account?.provider && !existingUser.emailVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() },
          });

          // Mark as member if not already
          if (existingUser.profile && !existingUser.profile.member) {
            await prisma.userProfile.update({
              where: { userId: existingUser.id },
              data: { member: true },
            });
          }
          console.log("✅ Verified OAuth user email");
        }

        // Block access if email not verified for credentials login
        if (!account?.provider && !existingUser.emailVerified) {
          console.log("❌ Email not verified - blocking login");
          return `/en/auth/verify-email?email=${encodeURIComponent(user.email)}&error=not_verified`;
        }

        console.log("✅ Existing user - login allowed");
        return true;
      }

      // New user: Check for join code validation
      const { cookies } = await import("next/headers");
      const joinCodeValid = cookies().get("join_ok")?.value;

      if (!joinCodeValid) {
        console.log("❌ New user without join code - blocking signup");
        // Redirect to join page by returning a URL string
        return `/en/auth/join?error=join_code_required`;
      }

      console.log("✅ New user with valid join code - allowing signup");

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
                member: false, // Not a member until email verified
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

        // For new OAuth signups, create verification token and redirect to verification page
        if (account?.provider) {
          console.log("🔄 Creating verification token for new OAuth user");

          // Generate verification token
          const verificationToken = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
          const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await prisma.verificationToken.create({
            data: {
              identifier: user.email,
              token: verificationToken,
              expires: tokenExpiry,
            },
          });

          const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`;
          console.log("📧 Verification URL:", verificationUrl);

          console.log("🔄 Redirecting new OAuth user to verification page");
          return `/en/auth/verify-email?email=${encodeURIComponent(user.email)}`;
        }
      }

      return true;
    },
    async jwt({ token, user }: any) {
      // Add user ID to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      // JWT strategy: use token data
      if (session?.user && token?.id) {
        session.user.id = token.id;

        // Fetch user profile to attach role
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: token.id },
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
