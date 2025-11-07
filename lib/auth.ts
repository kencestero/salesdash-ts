import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { generateUniqueSalespersonCode } from "./salespersonCode";
import bcrypt from "bcryptjs";
import { verifyPasskeyJWT } from "./passkey-jwt";

export const authOptions = {
  // Note: No adapter needed - we're using JWT sessions and handling user creation in signIn callback
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
    async signIn({ user }: any) {
      // For credentials provider, authorize() already validated everything
      // Just allow the sign-in
      console.log("✅ Sign-in allowed for:", user.email);
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
