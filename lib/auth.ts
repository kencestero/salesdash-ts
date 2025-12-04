import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { generateUniqueSalespersonCode } from "./salespersonCode";
import bcrypt from "bcryptjs";
import { verifyPasskeyJWT } from "./passkey-jwt";
import { rateLimit } from "./ratelimit";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const, // JWT for credentials support
    maxAge: 24 * 60 * 60, // 24 hours - session expires after 1 day
    updateAge: 15 * 60, // 15 minutes - update session every 15 min
  },
  providers: [
    // Google OAuth (hidden in UI via NEXT_PUBLIC_GOOGLE_ENABLED env var)
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

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

        // Rate limiting: max 10 login attempts per email per minute
        if (!rateLimit(`login:${credentials.email}`, 10, 60_000)) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
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

        // ✅ Email verification check
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in. Check your inbox!");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    // Passkey provider (WebAuthn)
    CredentialsProvider({
      id: 'passkey',
      name: 'Passkey',
      credentials: { token: { label: 'token', type: 'text' } },
      async authorize(creds) {
        const token = creds?.token;
        if (!token) return null;

        const userId = await verifyPasskeyJWT(token);
        if (!userId) return null;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true }
        });

        return user ? {
          id: user.id,
          email: user.email || '',
          name: user.name
        } as any : null;
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("=== SignIn Callback ===");
      console.log("User:", user.email);
      console.log("Account:", account?.provider);

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { profile: true },
        });

        // EXISTING USER - Check if UserProfile exists
        if (existingUser) {
          // Create UserProfile if missing (OAuth users who signed up before profile creation)
          if (!existingUser.profile) {
            // Parse name into firstName/lastName
            const nameParts = (user.name ?? "").split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            await prisma.userProfile.create({
              data: {
                userId: existingUser.id,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                role: "salesperson",
                member: true,
                needsJoinCode: false,
                salespersonCode: await generateUniqueSalespersonCode("salesperson", prisma),
                repCode: "REP000000", // Default for OAuth users without join code
              },
            });
            console.log("✅ Created missing UserProfile for existing user");
          }

          if (account?.provider && !existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
          console.log("✅ Existing user - login allowed");
          return true;
        }

        // NEW USER - Check join code (dynamic import for Next.js 15 compatibility)
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const joinCodeValid = cookieStore.get("join_ok")?.value;
        const joinRole = cookieStore.get("join_role")?.value || "salesperson";

        // NEW USER WITHOUT JOIN CODE - Block signup
        if (!joinCodeValid) {
          console.log("❌ New user without join code - blocking signup");
          // Block OAuth - redirect to join page
          return false; // ✅ PROPER FIX - Block unauthorized signups
        }

    // NEW USER WITH VALID JOIN CODE
    const firstName = cookieStore.get("signup_firstName")?.value;
    const lastName = cookieStore.get("signup_lastName")?.value;
    const phone = cookieStore.get("signup_phone")?.value;
    const zipcode = cookieStore.get("signup_zipcode")?.value;
    const managerId = cookieStore.get("signup_managerId")?.value;
    const status = cookieStore.get("signup_status")?.value || "employee";

    // Generate rep code
    let repCode: string;
    if (status === "freelancer") {
      repCode = "REP000000";
    } else {
      let isUnique = false;
      repCode = "";
      while (!isUnique) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        repCode = `REP${randomDigits}`;
        const existing = await prisma.userProfile.findUnique({ where: { repCode } });
        if (!existing) isUnique = true;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: account?.provider ? new Date() : null,
      }
    });

    await prisma.userProfile.create({
      data: {
        userId: newUser.id,
        firstName: firstName ? decodeURIComponent(firstName) : undefined,
        lastName: lastName ? decodeURIComponent(lastName) : undefined,
        phone: phone ? decodeURIComponent(phone) : undefined,
        zipcode: zipcode ? decodeURIComponent(zipcode) : undefined,
        salespersonCode: await generateUniqueSalespersonCode(joinRole, prisma),
        repCode: repCode,
        managerId: managerId ? decodeURIComponent(managerId) : null,
        status: status,
        role: joinRole as "owner" | "manager" | "salesperson",
        member: true,
        needsJoinCode: false,
      },
    });

    cookieStore.delete("join_ok");
    cookieStore.delete("join_role");
    cookieStore.delete("signup_firstName");
    cookieStore.delete("signup_lastName");
    cookieStore.delete("signup_phone");
    cookieStore.delete("signup_zipcode");
    cookieStore.delete("signup_managerId");
    cookieStore.delete("signup_status");

    console.log("✅ User created successfully");
    return true;

  } catch (error) {
    console.error("❌ SignIn callback error:", error);
    return true; // ✅ Even on error, return true to avoid loop
  }
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

// Helper to get session in server components
export async function auth() {
  return await getServerSession(authOptions);
}
