/**
 * RTO Fee Map - ZIP/State Based Up-Front Charges
 *
 * C3 Leasing Rules:
 * - Up-Front Charges (UF) = First Month + Security Deposit + State/County Fees
 * - These charges CANNOT be rolled into monthly payment (against policy)
 * - UF must be shown separately and clearly
 *
 * Structure:
 * - securityDepositRate: Multiplier for security deposit (e.g., 1.0 = 100% of first month)
 * - stateFee: Fixed state/county filing fee
 * - countyFee: Additional county fee (if applicable)
 * - rtoAllowed: Whether RTO is legal in this state
 */

export type RTOFeeConfig = {
  stateName: string;
  securityDepositRate: number; // Multiplier (e.g., 1.0 = 100% of first month rent)
  stateFee: number;             // Fixed state filing fee (USD)
  countyFee?: number;           // Optional additional county fee (USD)
  rtoAllowed: boolean;          // Whether RTO is legal in this state
  notes?: string;               // Optional notes about state-specific rules
};

/**
 * RTO Fee Map by State Code
 *
 * Default baseline: 100% security deposit + $35 state fee
 *
 * States can be looked up by ZIP code (first 3 digits) or state abbreviation
 */
export const RTO_FEE_MAP: Record<string, RTOFeeConfig> = {
  // DEFAULT (used if state not found)
  default: {
    stateName: "Default",
    securityDepositRate: 1.0,  // 100% of first month
    stateFee: 35,               // $35 filing fee
    rtoAllowed: true,
  },

  // ========== SOUTHEAST REGION (Priority) ==========

  // Georgia
  GA: {
    stateName: "Georgia",
    securityDepositRate: 1.0,  // 100% of first month
    stateFee: 25,               // $25 state fee
    rtoAllowed: true,
    notes: "GA has lower state fees than average"
  },

  // Florida
  FL: {
    stateName: "Florida",
    securityDepositRate: 0.75, // 75% of first month (lower than GA)
    stateFee: 45,               // $45 state fee
    rtoAllowed: true,
    notes: "FL has lower security deposit but higher state fee"
  },

  // Alabama
  AL: {
    stateName: "Alabama",
    securityDepositRate: 1.0,
    stateFee: 30,
    rtoAllowed: true,
  },

  // South Carolina
  SC: {
    stateName: "South Carolina",
    securityDepositRate: 1.0,
    stateFee: 35,
    rtoAllowed: true,
  },

  // North Carolina
  NC: {
    stateName: "North Carolina",
    securityDepositRate: 1.0,
    stateFee: 40,
    rtoAllowed: true,
  },

  // Tennessee
  TN: {
    stateName: "Tennessee",
    securityDepositRate: 1.0,
    stateFee: 35,
    rtoAllowed: true,
  },

  // Mississippi
  MS: {
    stateName: "Mississippi",
    securityDepositRate: 1.0,
    stateFee: 30,
    rtoAllowed: true,
  },

  // Louisiana
  LA: {
    stateName: "Louisiana",
    securityDepositRate: 1.0,
    stateFee: 35,
    rtoAllowed: true,
  },

  // ========== SPECIAL CASES ==========

  // New Jersey - RTO NOT ALLOWED
  NJ: {
    stateName: "New Jersey",
    securityDepositRate: 0,
    stateFee: 0,
    rtoAllowed: false,
    notes: "RTO is not permitted in New Jersey (state law)"
  },

  // ========== OTHER STATES (Can expand later) ==========

  // Texas
  TX: {
    stateName: "Texas",
    securityDepositRate: 1.0,
    stateFee: 40,
    rtoAllowed: true,
  },

  // Virginia
  VA: {
    stateName: "Virginia",
    securityDepositRate: 1.0,
    stateFee: 35,
    rtoAllowed: true,
  },

  // Maryland
  MD: {
    stateName: "Maryland",
    securityDepositRate: 1.0,
    stateFee: 45,
    rtoAllowed: true,
  },

  // Pennsylvania
  PA: {
    stateName: "Pennsylvania",
    securityDepositRate: 1.0,
    stateFee: 40,
    rtoAllowed: true,
  },

  // New York
  NY: {
    stateName: "New York",
    securityDepositRate: 1.0,
    stateFee: 50,
    rtoAllowed: true,
    notes: "NY has higher filing fees"
  },

  // California
  CA: {
    stateName: "California",
    securityDepositRate: 1.0,
    stateFee: 55,
    rtoAllowed: true,
    notes: "CA has highest filing fees"
  },
};

/**
 * Get RTO fee config by state abbreviation
 */
export function getRTOFeesByState(stateCode: string): RTOFeeConfig {
  const config = RTO_FEE_MAP[stateCode.toUpperCase()];
  return config || RTO_FEE_MAP.default;
}

/**
 * Get state code from ZIP code (simplified - first 3 digits)
 *
 * NOTE: This is a simplified lookup. For production, use a proper ZIP->State API.
 * For now, we use common ZIP code prefixes for Southeast states.
 */
export function getStateFromZIP(zipCode: string): string {
  // Handle empty/missing ZIP code
  if (!zipCode || zipCode.trim() === "") {
    return "default";
  }

  const zip3 = zipCode.substring(0, 3);

  // ZIP code ranges (first 3 digits) by state
  // Source: USPS ZIP code allocation
  const zipToState: Record<string, string> = {
    // Georgia (300-319)
    "300": "GA", "301": "GA", "302": "GA", "303": "GA", "304": "GA",
    "305": "GA", "306": "GA", "307": "GA", "308": "GA", "309": "GA",
    "310": "GA", "311": "GA", "312": "GA", "313": "GA", "314": "GA",
    "315": "GA", "316": "GA", "317": "GA", "318": "GA", "319": "GA",

    // Florida (320-349)
    "320": "FL", "321": "FL", "322": "FL", "323": "FL", "324": "FL",
    "325": "FL", "326": "FL", "327": "FL", "328": "FL", "329": "FL",
    "330": "FL", "331": "FL", "332": "FL", "333": "FL", "334": "FL",
    "335": "FL", "336": "FL", "337": "FL", "338": "FL", "339": "FL",
    "340": "FL", "341": "FL", "342": "FL", "343": "FL", "344": "FL",
    "345": "FL", "346": "FL", "347": "FL", "348": "FL", "349": "FL",

    // Alabama (350-369)
    "350": "AL", "351": "AL", "352": "AL", "353": "AL", "354": "AL",
    "355": "AL", "356": "AL", "357": "AL", "358": "AL", "359": "AL",
    "360": "AL", "361": "AL", "362": "AL", "363": "AL", "364": "AL",
    "365": "AL", "366": "AL", "367": "AL", "368": "AL", "369": "AL",

    // Tennessee (370-385)
    "370": "TN", "371": "TN", "372": "TN", "373": "TN", "374": "TN",
    "375": "TN", "376": "TN", "377": "TN", "378": "TN", "379": "TN",
    "380": "TN", "381": "TN", "382": "TN", "383": "TN", "384": "TN",
    "385": "TN",

    // Mississippi (386-397)
    "386": "MS", "387": "MS", "388": "MS", "389": "MS", "390": "MS",
    "391": "MS", "392": "MS", "393": "MS", "394": "MS", "395": "MS",
    "396": "MS", "397": "MS",

    // South Carolina (290-299)
    "290": "SC", "291": "SC", "292": "SC", "293": "SC", "294": "SC",
    "295": "SC", "296": "SC", "297": "SC", "298": "SC", "299": "SC",

    // North Carolina (270-289)
    "270": "NC", "271": "NC", "272": "NC", "273": "NC", "274": "NC",
    "275": "NC", "276": "NC", "277": "NC", "278": "NC", "279": "NC",
    "280": "NC", "281": "NC", "282": "NC", "283": "NC", "284": "NC",
    "285": "NC", "286": "NC", "287": "NC", "288": "NC", "289": "NC",

    // Louisiana (700-714)
    "700": "LA", "701": "LA", "702": "LA", "703": "LA", "704": "LA",
    "705": "LA", "706": "LA", "707": "LA", "708": "LA", "709": "LA",
    "710": "LA", "711": "LA", "712": "LA", "713": "LA", "714": "LA",

    // New Jersey (070-089) - RTO NOT ALLOWED
    "070": "NJ", "071": "NJ", "072": "NJ", "073": "NJ", "074": "NJ",
    "075": "NJ", "076": "NJ", "077": "NJ", "078": "NJ", "079": "NJ",
    "080": "NJ", "081": "NJ", "082": "NJ", "083": "NJ", "084": "NJ",
    "085": "NJ", "086": "NJ", "087": "NJ", "088": "NJ", "089": "NJ",
  };

  return zipToState[zip3] || "default";
}

/**
 * Get RTO fee config by ZIP code
 */
export function getRTOFeesByZIP(zipCode: string): RTOFeeConfig {
  const stateCode = getStateFromZIP(zipCode);
  return getRTOFeesByState(stateCode);
}

/**
 * Calculate Up-Front Charges (UF) for C3 Leasing
 *
 * UF = First Month's Rent + Security Deposit + State/County Fees
 *
 * These charges MUST be shown separately and CANNOT be rolled into monthly payment.
 */
export function calculateUpFrontCharges(
  monthlyRent: number,
  zipCode: string
): {
  firstMonthRent: number;
  securityDeposit: number;
  stateFee: number;
  countyFee: number;
  totalUF: number;
  stateConfig: RTOFeeConfig;
} {
  const config = getRTOFeesByZIP(zipCode);

  const firstMonthRent = monthlyRent;
  const securityDeposit = monthlyRent * config.securityDepositRate;
  const stateFee = config.stateFee;
  const countyFee = config.countyFee || 0;
  const totalUF = firstMonthRent + securityDeposit + stateFee + countyFee;

  return {
    firstMonthRent,
    securityDeposit,
    stateFee,
    countyFee,
    totalUF,
    stateConfig: config,
  };
}
