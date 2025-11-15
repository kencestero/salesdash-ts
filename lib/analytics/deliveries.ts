// lib/analytics/deliveries.ts

import { prisma } from "@/lib/prisma";

export type CreateDeliveryRecordInput = {
  customerName: string;
  trailerIdentifier: string; // VIN / stock / unit number
  deliveryDate: Date | string;
  commissionAmount: number;
  profitAmount: number;
  createdByUserId?: string | null;
};

export type ListDeliveryRecordsFilters = {
  userId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
};

function normalizeDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  // Accept "YYYY-MM-DD" or ISO strings
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return d;
}

export async function createDeliveryRecord(
  input: CreateDeliveryRecordInput
) {
  const {
    customerName,
    trailerIdentifier,
    deliveryDate,
    commissionAmount,
    profitAmount,
    createdByUserId,
  } = input;

  if (!customerName?.trim()) {
    throw new Error("customerName is required");
  }
  if (!trailerIdentifier?.trim()) {
    throw new Error("trailerIdentifier is required");
  }

  const deliveryDateObj = normalizeDate(deliveryDate);

  // Basic numeric validation
  if (typeof commissionAmount !== "number" || Number.isNaN(commissionAmount)) {
    throw new Error("commissionAmount must be a valid number");
  }
  if (typeof profitAmount !== "number" || Number.isNaN(profitAmount)) {
    throw new Error("profitAmount must be a valid number");
  }

  const record = await prisma.deliveryRecord.create({
    data: {
      customerName: customerName.trim(),
      trailerIdentifier: trailerIdentifier.trim(),
      deliveryDate: deliveryDateObj,
      commissionAmount,
      profitAmount,
      createdByUserId: createdByUserId ?? null,
    },
    include: {
      createdByUser: true,
    },
  });

  return record;
}

export async function listDeliveryRecords(
  filters: ListDeliveryRecordsFilters = {}
) {
  const {
    userId,
    startDate,
    endDate,
    limit = 50,
  } = filters;

  const where: any = {};

  if (userId) {
    where.createdByUserId = userId;
  }

  if (startDate || endDate) {
    where.deliveryDate = {};
    if (startDate) {
      where.deliveryDate.gte = normalizeDate(startDate);
    }
    if (endDate) {
      // endDate is treated as inclusive end-of-day if it's a YYYY-MM-DD string
      const end = normalizeDate(endDate);
      where.deliveryDate.lte = end;
    }
  }

  const safeLimit = Math.min(Math.max(limit || 50, 1), 200);

  const records = await prisma.deliveryRecord.findMany({
    where,
    orderBy: { deliveryDate: "desc" },
    take: safeLimit,
    include: {
      createdByUser: true,
    },
  });

  return records;
}

export type DeliverySummary = {
  totalDeliveries: number;
  totalCommission: number;
  totalProfit: number;
};

export async function getDeliverySummaryLast30Days(): Promise<DeliverySummary> {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 30);

  const records = await prisma.deliveryRecord.findMany({
    where: {
      deliveryDate: {
        gte: start,
        lte: now,
      },
    },
    select: {
      commissionAmount: true,
      profitAmount: true,
    },
  });

  let totalDeliveries = records.length;
  let totalCommission = 0;
  let totalProfit = 0;

  for (const r of records) {
    totalCommission += Number(r.commissionAmount);
    totalProfit += Number(r.profitAmount);
  }

  return {
    totalDeliveries,
    totalCommission,
    totalProfit,
  };
}
