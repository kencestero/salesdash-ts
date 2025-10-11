/**
 * Trailer Color and Specification Utilities
 * Based on Diamond Cargo's model code format
 */

export type SkinMaterial = "Polycore" | "Aluminum";

export interface ColorInfo {
  code: string;
  name: string;
  isPremium: boolean;
  isTwoTone: boolean;
}

export interface TrailerSpecs {
  width: number; // feet
  length: number; // feet
  axleType: "Single" | "Tandem";
  axleWeight?: number; // lbs per axle
  color: ColorInfo;
  skinThickness: ".080" | ".030";
  skinMaterial: SkinMaterial;
  features: string[];
  interiorHeight?: number; // feet
}

/**
 * Color code mapping
 */
export const COLOR_MAP: Record<string, { name: string; isPremium: boolean }> = {
  W: { name: "White", isPremium: false },
  B: { name: "Black", isPremium: true },
  R: { name: "Red", isPremium: false },
  SF: { name: "Silver Frost", isPremium: false },
  CG: { name: "Charcoal Gray", isPremium: true },
  EB: { name: "Emerald Black", isPremium: true },
  ELG: { name: "Electric Lime Green", isPremium: true },
  Y: { name: "Yellow", isPremium: false },
  AB: { name: "Abyss Blue", isPremium: true },
  BW: { name: "Black/White", isPremium: true },
  IB: { name: "Indigo Blue", isPremium: true },
  "ORG/B": { name: "Orange/Black", isPremium: true },
  EG: { name: "Emerald Green", isPremium: true },
};

/**
 * Feature code mapping
 */
export const FEATURE_MAP: Record<string, string> = {
  R: "Ramp Door",
  DD: "Double Doors",
  VN: "V-Nose",
  SVN: "Slant V-Nose",
  SRW: "Screwless Exterior",
  FF: "Flat Front",
  TTT: "Triple Tube Tongue",
};

/**
 * Parse color code from model string
 * Example: "7X16TA2 B.080 R VN 7'" → { code: "B", name: "Black", ... }
 */
export function parseColor(modelCode: string): ColorInfo {
  // Match pattern: [COLOR_CODE].[080|030]
  const colorMatch = modelCode.match(/\s([A-Z/]+)\.0[38]0/);

  if (!colorMatch) {
    return {
      code: "W",
      name: "White",
      isPremium: false,
      isTwoTone: false,
    };
  }

  const code = colorMatch[1];
  const colorInfo = COLOR_MAP[code] || { name: "Unknown", isPremium: false };
  const isTwoTone = code.includes("/");

  return {
    code,
    name: colorInfo.name,
    isPremium: colorInfo.isPremium,
    isTwoTone,
  };
}

/**
 * Parse skin material from model code
 */
export function parseSkinMaterial(
  modelCode: string
): { thickness: ".080" | ".030"; material: SkinMaterial } {
  const hasPolycore = modelCode.includes(".080");

  return {
    thickness: hasPolycore ? ".080" : ".030",
    material: hasPolycore ? "Polycore" : "Aluminum",
  };
}

/**
 * Parse trailer dimensions
 * Example: "7X16TA2" → { width: 7, length: 16 }
 */
export function parseDimensions(modelCode: string): {
  width: number;
  length: number;
} {
  const dimMatch = modelCode.match(/(\d+)X(\d+)/i);

  if (!dimMatch) {
    return { width: 0, length: 0 };
  }

  return {
    width: parseInt(dimMatch[1]),
    length: parseInt(dimMatch[2]),
  };
}

/**
 * Parse axle configuration
 * Example: "TA2" → { type: "Tandem", weight: 3500 }
 */
export function parseAxle(modelCode: string): {
  type: "Single" | "Tandem";
  weight?: number;
} {
  if (modelCode.includes("TA")) {
    // Check for TA2 (2 x 3500 lb axles)
    if (modelCode.includes("TA2")) {
      return { type: "Tandem", weight: 3500 };
    }
    return { type: "Tandem" };
  }

  if (modelCode.includes("SA")) {
    return { type: "Single" };
  }

  return { type: "Single" };
}

/**
 * Parse interior height
 * Example: "7'" → 7
 */
export function parseHeight(modelCode: string): number | undefined {
  const heightMatch = modelCode.match(/(\d+)'/);
  return heightMatch ? parseInt(heightMatch[1]) : undefined;
}

/**
 * Parse all features from model code
 * Example: "R VN DD" → ["Ramp Door", "V-Nose", "Double Doors"]
 */
export function parseFeatures(modelCode: string): string[] {
  const features: string[] = [];
  const tokens = modelCode.split(/\s+/);

  for (const token of tokens) {
    if (FEATURE_MAP[token]) {
      features.push(FEATURE_MAP[token]);
    }
  }

  return features;
}

/**
 * Parse full trailer specification from model code
 * Example: "7X16TA2 B.080 R VN 7'" → complete TrailerSpecs object
 */
export function parseTrailerModel(modelCode: string): TrailerSpecs {
  const dims = parseDimensions(modelCode);
  const axle = parseAxle(modelCode);
  const color = parseColor(modelCode);
  const skin = parseSkinMaterial(modelCode);
  const features = parseFeatures(modelCode);
  const height = parseHeight(modelCode);

  return {
    width: dims.width,
    length: dims.length,
    axleType: axle.type,
    axleWeight: axle.weight,
    color,
    skinThickness: skin.thickness,
    skinMaterial: skin.material,
    features,
    interiorHeight: height,
  };
}

/**
 * Format trailer specs into human-readable string
 * Example: "7×16 Tandem Axle • Black Polycore • Ramp Door • V-Nose • 7' Interior"
 */
export function formatTrailerSpecs(specs: TrailerSpecs): string {
  const parts: string[] = [];

  // Dimensions
  parts.push(`${specs.width}×${specs.length}`);

  // Axle
  parts.push(specs.axleType === "Tandem" ? "TA" : "SA");

  // Color
  parts.push(specs.color.name);

  // Material (if Polycore, mention it)
  if (specs.skinMaterial === "Polycore") {
    parts.push("Polycore");
  }

  // Features
  if (specs.features.length > 0) {
    parts.push(specs.features.join(" • "));
  }

  // Height
  if (specs.interiorHeight) {
    parts.push(`${specs.interiorHeight}' Interior`);
  }

  return parts.join(" • ");
}

/**
 * Get color hex code for visual representation
 * Returns CSS color value
 */
export function getColorHex(colorCode: string): string {
  const hexMap: Record<string, string> = {
    W: "#FFFFFF",
    B: "#000000",
    R: "#DC2626",
    SF: "#C0C0C0",
    CG: "#4B5563",
    EB: "#064E3B",
    ELG: "#84CC16",
    Y: "#FCD34D",
    AB: "#1E3A8A",
    BW: "linear-gradient(90deg, #000000 50%, #FFFFFF 50%)",
    IB: "#4338CA",
    "ORG/B": "linear-gradient(90deg, #F97316 50%, #000000 50%)",
    EG: "#059669",
  };

  return hexMap[colorCode] || "#FFFFFF";
}

/**
 * Calculate days since trailer was added
 */
export function calculateDaysOld(createdAt: Date): number {
  const now = Date.now();
  const created = createdAt.getTime();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

/**
 * Check if trailer is a "hot unit" (2 days old or less)
 */
export function isHotUnit(createdAt: Date): boolean {
  return calculateDaysOld(createdAt) <= 2;
}
