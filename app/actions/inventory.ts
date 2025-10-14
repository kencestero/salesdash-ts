"use server";

import { prisma } from "@/lib/generated/prisma";

export type TrailerByVIN = {
  vin: string;
  stockNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  salePrice: number;
  category: string;
  length: number;
  width: number;
  height: number | null;
  status: string;
};

/**
 * Get trailer details by VIN
 * Used for VIN auto-fill in quote builder
 */
export async function getTrailerByVIN(vin: string): Promise<TrailerByVIN | null> {
  if (!vin || vin.trim().length === 0) {
    return null;
  }

  const cleanVin = vin.trim().toUpperCase();

  try {
    const trailer = await prisma.trailer.findUnique({
      where: { vin: cleanVin },
      select: {
        vin: true,
        stockNumber: true,
        manufacturer: true,
        model: true,
        year: true,
        salePrice: true,
        category: true,
        length: true,
        width: true,
        height: true,
        status: true,
      },
    });

    return trailer;
  } catch (error) {
    console.error("[getTrailerByVIN] Error:", error);
    return null;
  }
}

/**
 * Get available trailers (for dropdown selects)
 */
export async function getAvailableTrailers() {
  try {
    const trailers = await prisma.trailer.findMany({
      where: {
        status: {
          in: ["available", "pending"],
        },
      },
      select: {
        id: true,
        vin: true,
        stockNumber: true,
        manufacturer: true,
        model: true,
        year: true,
        salePrice: true,
        category: true,
        status: true,
      },
      orderBy: [
        { manufacturer: "asc" },
        { year: "desc" },
      ],
    });

    return trailers;
  } catch (error) {
    console.error("[getAvailableTrailers] Error:", error);
    return [];
  }
}

/**
 * Validate if a price is within allowed range (+100% / -30% of listed price)
 * Per PROJECT.md pricing guardrail rules
 */
export function validatePriceRange(
  sellingPrice: number,
  listedPrice: number
): {
  valid: boolean;
  min: number;
  max: number;
  message?: string;
} {
  const min = listedPrice * 0.7;  // -30%
  const max = listedPrice * 2.0;  // +100%

  const valid = sellingPrice >= min && sellingPrice <= max;

  return {
    valid,
    min,
    max,
    message: valid
      ? undefined
      : `Price must be between $${min.toFixed(2)} and $${max.toFixed(2)} (±30% to +100% of listed price $${listedPrice.toFixed(2)})`,
  };
}
