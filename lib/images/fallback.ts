/**
 * Fallback image utility for trailers without photos
 * Maps trailer specs to standard stock images
 */

interface TrailerSpecs {
  width: number;
  length: number;
  axles?: number;
  model?: string;
  category?: string;
}

/**
 * Detect if model is blackout edition
 */
function isBlackout(model?: string): boolean {
  if (!model) return false;
  const lower = model.toLowerCase();
  return lower.includes('blackout') || lower.includes('black out') || lower.includes('.080');
}

/**
 * Detect if model is V-nose
 */
function isVNose(model?: string): boolean {
  if (!model) return false;
  const lower = model.toLowerCase();
  return lower.includes('v-nose') || lower.includes('vnose') || lower.includes('v nose') || lower.includes(' vn ');
}

/**
 * Detect if model is racing edition
 */
function isRacing(model?: string): boolean {
  if (!model) return false;
  const lower = model.toLowerCase();
  return lower.includes('racing') || lower.includes('race');
}

/**
 * Detect if model is concession trailer
 */
function isConcession(category?: string, model?: string): boolean {
  if (category?.toLowerCase() === 'concession') return true;
  if (!model) return false;
  const lower = model.toLowerCase();
  return lower.includes('concession') || lower.includes('food');
}

/**
 * Detect if model is dump trailer
 */
function isDump(category?: string, model?: string): boolean {
  if (category?.toLowerCase() === 'dump') return true;
  if (!model) return false;
  const lower = model.toLowerCase();
  return lower.includes('dump');
}

/**
 * Get standard image path for trailer based on specs
 * Returns webp format (preferred) or fallback to png
 */
export function getStandardImagePath(specs: TrailerSpecs): string {
  const { width, length, axles, model, category } = specs;

  // Detect axle type from model string if not provided
  let axleType = '';
  if (axles) {
    axleType = axles === 1 ? 'SA' : 'TA';
  } else if (model) {
    const lower = model.toLowerCase();
    if (lower.includes('sa') || lower.includes('single')) axleType = 'SA';
    else if (lower.includes('ta') || lower.includes('tandem')) axleType = 'TA';
    else axleType = 'SA'; // Default to single axle
  } else {
    axleType = 'SA'; // Default
  }

  // Build size string (e.g., "7X16")
  const sizeStr = `${width}X${length}`;

  // Detect special editions
  const blackout = isBlackout(model);
  const vnose = isVNose(model);
  const racing = isRacing(model);
  const concession = isConcession(category, model);
  const dump = isDump(category, model);

  // Build image filename variations to try
  const variations: string[] = [];

  // Special categories
  if (dump) {
    variations.push(`${sizeStr}${axleType} DUMP`);
  } else if (concession) {
    variations.push(`${sizeStr}${axleType} CONCESSION`);
    variations.push(`7X18-20TA CONCESSION`); // Generic concession fallback
  } else if (racing) {
    if (blackout) {
      variations.push(`${sizeStr}${axleType} RACING BLACKOUT`);
      variations.push(`8.5X18${axleType} RACING BLACKOUT`); // Generic racing blackout
    }
    variations.push(`${sizeStr}${axleType} RACING`);
    variations.push(`8.5X18${axleType} RACING`); // Generic racing
  } else {
    // Standard enclosed trailers
    if (vnose) {
      variations.push(`${sizeStr}${axleType} V NOSE`);
    }
    if (blackout) {
      variations.push(`${sizeStr}${axleType} BLACKOUT`);
      if (model?.toLowerCase().includes('green')) {
        variations.push(`${sizeStr}${axleType} BLACKOUT GREEN`);
      }
    }
    // Standard (no modifier)
    variations.push(`${sizeStr}${axleType}`);
  }

  // Add generic fallbacks based on size
  if (axleType === 'TA') {
    if (width >= 8) {
      variations.push('8.5X18-20TA BLACKOUT', '8.5X18-20TA', '7X16TA BLACKOUT', '7X16TA');
    } else {
      variations.push('7X16TA BLACKOUT', '7X16TA', '6X12TA BLACKOUT', '6X12TA');
    }
  } else {
    if (width >= 7) {
      variations.push('7X16SA BLACKOUT', '7X16SA');
    } else if (width >= 6) {
      variations.push('6X12SA BLACKOUT', '6X12SA', '6X10SA BLACKOUT');
    } else {
      variations.push('5X8SA', '4X6SA');
    }
  }

  // Try webp first (preferred), then png
  for (const variant of variations) {
    // Prefer webp format
    const webpPath = `/images/standardtrailerpics/${variant}.webp`;
    // Note: In production, you'd check if file exists server-side
    // For now, we return the first match and let browser handle 404
    return webpPath;
  }

  // Ultimate fallback - most common trailer
  return '/images/standardtrailerpics/7X16TA.webp';
}

/**
 * Get fallback image array for trailer
 * Returns array with single fallback image
 */
export function getFallbackImages(specs: TrailerSpecs): string[] {
  return [getStandardImagePath(specs)];
}
