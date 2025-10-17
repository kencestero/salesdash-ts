import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "./generated/prisma";
import bcrypt from "bcryptjs";

export function CustomPrismaAdapter(prisma: PrismaClient) {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    async createUser(user: any) {
      console.log("=== Custom CreateUser ===");
      console.log("Creating user:", user.email);

      // Generate random password for OAuth users (they won't use it, but it's a backup)
      const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create user with emailVerified = null (requires verification)
      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          password: hashedPassword, // Store random password
          emailVerified: null, // NOT verified yet - they need to verify
        },
      });

      console.log("✅ Created user with NULL emailVerified:", newUser.id);

      // Generate and store verification token
      const verificationToken = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.create({
        data: {
          identifier: newUser.email,
          token: verificationToken,
          expires: tokenExpiry,
        },
      });

      console.log("✅ Created verification token");

      // Log verification URL (in production, send email here)
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`;
      console.log("📧 Verification URL:", verificationUrl);

      // TODO: Send actual verification email here
      // await sendVerificationEmail(newUser.email, verificationUrl);

      return newUser;
    },
  };
}
