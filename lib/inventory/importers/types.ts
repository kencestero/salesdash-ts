export type RawRow = Record<string, string | number | null | undefined>;

export type NormalizedTrailer = {
  vin: string;            // required
  stockNumber?: string;
  manufacturer: "Diamond Cargo" | "Quality Cargo" | "Panther Trailers";
  size?: string;          // e.g. "7x16"
  axle?: "SA"|"TA"|"TA3"|"TA4"|null;
  lengthFeet?: number;    // 20, 24, etc.
  widthFeet?: number;     // 6, 7, 8.5
  model?: string;
  price?: number | null;
  status?: "available" | "sold" | "pending" | "unknown";
  notes?: string | null;
};
