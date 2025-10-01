// lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";

import { user } from "@/app/api/user/data"; // your local demo users

export const authOptions: NextAuthOptions = {
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
        const email = credentials?.email ?? "";
        const password = credentials?.password ?? "";

        const found = user.find((u) => u.email === email);
        if (!found) return null;

        const valid = password === found.password;
        return valid ? (found as any) : null;
      },
    }),
  ],

  callbacks: {
    // hard-block the template/demo account
    async signIn({ user }) {
      const email = (user?.email || "").toLowerCase();
      if (email === "dashtail@codeshaper.net") return false;
      return true;
    },

    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        // allow same-origin internal paths
        if (u.origin === baseUrl) return u.href;
      } catch {}
      // default after login
      return `${baseUrl}/en/dashboard`;
    },

    async jwt({ token, account }) {
      if (token.member) return token;

      const allowlistEnabled = process.env.ACCESS_ALLOWLIST_ENABLED === "true";
      if (allowlistEnabled) {
        const email = (String(token.email || account?.email || "")).toLowerCase();
        const allowed = (process.env.ACCESS_ALLOWLIST || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (!allowed.some((a) => email.endsWith(a))) {
          token.member = false;
          return token;
        }
      }

      const c = cookies().get("join_ok"); // set by /api/join/complete
      if (c?.value === "1") {
        token.member = true;
        cookies().set("join_ok", "", { path: "/", maxAge: 0 });
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).member = !!token.member;
      return session;
    },
  },

  pages: {
    signIn: "/en/auth/login",
  },

  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV !== "production",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

