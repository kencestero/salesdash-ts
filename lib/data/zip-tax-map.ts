/**
 * Kentucky ZIP Code → Tax Rate + Location Mapping
 *
 * Tax Rates:
 * - KY state base: 6%
 * - Warren County (Bowling Green): 6% + 3.5% = 9.5%
 * - Most other counties: 6% (base only)
 *
 * This is a local lookup table. Extend as needed or replace with API call later.
 */

export type LocationData = {
  city: string;
  state: string;
  taxRate: number;
  county?: string;
};

export const ZIP_TAX_MAP: Record<string, LocationData> = {
  // Warren County (Bowling Green area) - 9.5% total tax
  '42101': { city: 'Bowling Green', state: 'KY', taxRate: 9.5, county: 'Warren' },
  '42102': { city: 'Bowling Green', state: 'KY', taxRate: 9.5, county: 'Warren' },
  '42103': { city: 'Bowling Green', state: 'KY', taxRate: 9.5, county: 'Warren' },
  '42104': { city: 'Bowling Green', state: 'KY', taxRate: 9.5, county: 'Warren' },

  // Jefferson County (Louisville area) - 6% base tax
  '40201': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40202': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40203': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40204': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40205': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40206': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40207': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40208': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40209': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40210': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40211': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40212': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40213': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40214': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40215': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40216': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40217': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40218': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40219': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40220': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40221': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40222': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40223': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40224': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40225': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40228': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40229': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40231': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40232': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40233': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40241': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40242': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40243': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40245': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40250': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40251': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40252': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40253': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40255': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40256': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40257': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40258': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40259': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40261': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40266': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40268': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40269': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40270': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40272': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40280': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40281': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40282': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40283': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40285': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40287': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40289': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40290': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40291': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40292': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40293': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40294': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40295': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40296': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40297': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40298': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },
  '40299': { city: 'Louisville', state: 'KY', taxRate: 6.0, county: 'Jefferson' },

  // Fayette County (Lexington area) - 6% base tax
  '40502': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40503': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40504': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40505': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40506': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40507': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40508': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40509': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40510': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40511': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40512': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40513': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40514': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40515': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40516': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40517': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40522': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40523': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40524': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40526': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40533': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40536': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40544': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40546': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40550': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40555': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40574': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40575': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40576': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40577': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40578': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40579': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40580': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40581': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40582': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40583': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40588': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40591': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
  '40598': { city: 'Lexington', state: 'KY', taxRate: 6.0, county: 'Fayette' },
};

/**
 * Get location data (city, state, tax rate) for a given ZIP code
 * @param zipcode - 5-digit ZIP code (can include dashes or spaces, will be cleaned)
 * @returns LocationData if found, or default KY base rate (6%) if not in map
 */
export function getLocationByZip(zipcode: string): LocationData {
  // Clean the zipcode (remove non-numeric characters)
  const cleanZip = zipcode.replace(/\D/g, '').slice(0, 5);

  // Return mapped data or default to KY base tax (6%)
  return ZIP_TAX_MAP[cleanZip] || {
    city: 'Unknown',
    state: 'KY',
    taxRate: 6.0,
  };
}

/**
 * Validate if a ZIP code is in the database
 */
export function isValidKYZip(zipcode: string): boolean {
  const cleanZip = zipcode.replace(/\D/g, '').slice(0, 5);
  return cleanZip in ZIP_TAX_MAP;
}
