/**
 * Owner Delivery Log Page (Server Component)
 * Protected route for owners/managers to log and view delivered trailers
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listDeliveryRecords } from "@/lib/analytics/deliveries";
import { OwnerDeliveryPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Delivery Log | SalesDash",
  description: "Log and track delivered trailers",
};

export type DeliveryRecordDTO = {
  id: string;
  customerName: string;
  trailerIdentifier: string;
  deliveryDate: string; // ISO string
  commissionAmount: number;
  profitAmount: number;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: string; // ISO string
};

export default async function DeliveriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  // Get current user with profile to check role
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!currentUser || !currentUser.profile) {
    redirect("/en/login");
  }

  // Check if user has owner/director/manager role
  const allowedRoles = ["owner", "director", "manager"];
  if (!allowedRoles.includes(currentUser.profile.role)) {
    redirect("/en/dashboard");
  }

  // Fetch initial delivery records
  const records = await listDeliveryRecords({ limit: 50 });

  // Convert to DTO (serialize Decimal and Date)
  const initialRecords: DeliveryRecordDTO[] = records.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    trailerIdentifier: r.trailerIdentifier,
    deliveryDate: r.deliveryDate.toISOString(),
    commissionAmount: Number(r.commissionAmount),
    profitAmount: Number(r.profitAmount),
    createdByName: r.createdByUser?.name ?? null,
    createdByEmail: r.createdByUser?.email ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return <OwnerDeliveryPageClient initialRecords={initialRecords} />;
}
