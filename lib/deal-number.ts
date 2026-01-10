import { prisma } from "@/lib/prisma";

/**
 * Generate a sequential deal number in format DEAL-00001
 * Uses atomic increment to prevent duplicates under concurrent access
 */
export async function generateDealNumber(): Promise<string> {
  // Use atomic upsert + increment to prevent race conditions
  const counter = await prisma.dealCounter.upsert({
    where: { id: "deal_counter" },
    update: { lastNumber: { increment: 1 } },
    create: { id: "deal_counter", lastNumber: 1 },
  });

  // Format: DEAL-00001 (5 digits, zero-padded)
  return `DEAL-${counter.lastNumber.toString().padStart(5, "0")}`;
}

/**
 * Preview the next deal number without incrementing
 * Used for displaying in UI before actual creation
 */
export async function getNextDealNumberPreview(): Promise<string> {
  const counter = await prisma.dealCounter.findUnique({
    where: { id: "deal_counter" },
  });

  const nextNumber = (counter?.lastNumber ?? 0) + 1;
  return `DEAL-${nextNumber.toString().padStart(5, "0")}`;
}

/**
 * Extract color from trailer features array
 * Diamond Cargo uses color names in features like "Black", "White", etc.
 */
export function extractColorFromFeatures(features: string[]): string | null {
  const commonColors = [
    "Black",
    "White",
    "Silver",
    "Charcoal",
    "Red",
    "Blue",
    "Green",
    "Orange",
    "Yellow",
    "Gray",
    "Brown",
    "Beige",
    "Tan",
    "Bronze",
  ];

  for (const feature of features) {
    const featureLower = feature.toLowerCase();
    for (const color of commonColors) {
      if (featureLower.includes(color.toLowerCase())) {
        return color;
      }
    }
    // Check for "Polycore" color variations
    if (featureLower.includes("polycore")) {
      const match = feature.match(/(\w+)\s*polycore/i);
      if (match) return match[1];
    }
  }

  return null;
}

/**
 * Format trailer size from length and width
 */
export function formatTrailerSize(
  length: number | null,
  width: number | null
): string {
  if (!length || !width) return "N/A";
  return `${width}' x ${length}'`;
}
