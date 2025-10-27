"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function updateUserName(name: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "Not authenticated" };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to update user name:", err);
    return { error: "Failed to update user" };
  }
}
