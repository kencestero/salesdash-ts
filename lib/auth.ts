import Credentials from "next-auth/providers/credentials";
import { User as UserType, user } from "@/app/api/user/data";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { cookies } from "next/headers";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string,
          password: string,
        };
          
        const foundUser = user.find((u) => u.email === email)

        if (!foundUser) {
          return null;
        }

        const valid = password === foundUser.password  

        if (!valid) {
          return null;
        }

        if (foundUser) {
          return foundUser as any
        }
        return null;
      }
    }),
  ],
  
  callbacks: {
    async jwt({ token, account }: any) {
      // persist existing claim
      if (token.member) return token;

      // fresh Google login path:
      const c = cookies().get("join_ok");
      const allowlistEnabled = process.env.ACCESS_ALLOWLIST_ENABLED === "true";

      // Optionally, email allowlist:
      if (allowlistEnabled) {
        const email = (token.email || account?.email || "").toLowerCase();
        const allowed = (process.env.ACCESS_ALLOWLIST || "")
          .split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);
        if (!allowed.some((a: string) => email.endsWith(a))) {
          token.member = false; // blocked
          return token;
        }
      }

      if (c?.value === "1") {
        token.member = true; // one-time grant via join code
        // clear cookie after consumption
        cookies().set("join_ok", "", { path: "/", maxAge: 0 });
      }
      return token;
    },
    
    async session({ session, token }: any) {
      (session as any).member = !!token.member;
      return session;
    },
  },
  
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV !== "production",
};
