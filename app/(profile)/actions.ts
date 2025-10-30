"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  phone?: string;
  zipcode?: string;
  city?: string;
  about?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export async function updateProfile(data: ProfileData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  // Get user with profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update profile
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      preferredName: data.preferredName,
      phone: data.phone,
      zipcode: data.zipcode,
      city: data.city,
      about: data.about,
      ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      ...(data.coverUrl && { coverUrl: data.coverUrl }),
    },
  });

  revalidatePath("/profile");

  return { success: true, profile: updatedProfile };
}

export async function getProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    throw new Error("Profile not found");
  }

  return {
    email: user.email,
    ...user.profile,
  };
}
