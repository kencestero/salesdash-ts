/**
 * Application Configuration
 *
 * Centralized config for environment-dependent values.
 * Use Vercel env vars to override defaults in production.
 */

/**
 * Cargo Craft / Diamond Cargo contact email
 * Default: kencestero@gmail.com
 * Override: Set CARGOCRAFT_CONTACT_EMAIL in Vercel env vars
 */
export const CARGOCRAFT_CONTACT_EMAIL =
  process.env.CARGOCRAFT_CONTACT_EMAIL ?? "kencestero@gmail.com";
