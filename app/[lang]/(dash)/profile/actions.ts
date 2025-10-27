"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface ProfileUpdateData {
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  zipCode?: string;
  about?: string;
}

export async function updateUserProfile(data: ProfileUpdateData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Update User name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });

    // Update UserProfile with additional fields
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        preferredName: data.preferredName || null,
        zipCode: data.zipCode || null,
        about: data.about || null,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to update user profile:", err);
    return { error: "Failed to update user" };
  }
}

// Keep the old function for backwards compatibility
export async function updateUserName(name: string) {
  return updateUserProfile({
    name,
    firstName: name.split(" ")[0] || "",
    lastName: name.split(" ").pop() || ""
  });
}
