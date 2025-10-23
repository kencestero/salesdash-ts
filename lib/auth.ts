import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { generateUniqueSalespersonCode } from "./salespersonCode";
import bcrypt from "bcryptjs";

export const authOptions = {
  // Note: No adapter needed - we're using JWT sessions and handling user creation in signIn callback
  session: {
    strategy: "jwt" as const, // JWT for credentials support
    maxAge: 24 * 60 * 60, // 24 hours - session expires after 1 day
    updateAge: 15 * 60, // 15 minutes - update session every 15 min
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

        // ✅ RE-ENABLED: Email verification check
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
    // 🔒 OAUTH DISABLED FOR SECURITY - Email-only signup for now
    // Uncomment when ready to re-enable:
    // GoogleProvider({
    //   clientId: process.env.AUTH_GOOGLE_ID as string,
    //   clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    // }),
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

        // EXISTING USER - Just let them in
        if (existingUser) {
          if (account?.provider && !existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
          console.log("✅ Existing user - login allowed");
          return true;
        }

        // NEW USER - Check join code
        const { cookies } = await import("next/headers");
        const joinCodeValid = cookies().get("join_ok")?.value;
        const joinRole = cookies().get("join_role")?.value || "salesperson";

        // NEW USER WITHOUT JOIN CODE - Block signup
        if (!joinCodeValid) {
          console.log("❌ New user without join code - blocking signup");
          // Block OAuth - redirect to join page
          return false; // ✅ PROPER FIX - Block unauthorized signups
        }

    // NEW USER WITH VALID JOIN CODE
    const firstName = cookies().get("signup_firstName")?.value;
    const lastName = cookies().get("signup_lastName")?.value;
    const phone = cookies().get("signup_phone")?.value;
    const zipcode = cookies().get("signup_zipcode")?.value;
    const managerId = cookies().get("signup_managerId")?.value;
    const status = cookies().get("signup_status")?.value || "employee";

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

    cookies().delete("join_ok");
    cookies().delete("join_role");
    cookies().delete("signup_firstName");
    cookies().delete("signup_lastName");
    cookies().delete("signup_phone");
    cookies().delete("signup_zipcode");
    cookies().delete("signup_managerId");
    cookies().delete("signup_status");

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
