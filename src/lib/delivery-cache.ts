/**
 * Server-side in-memory cache for delivery charges config.
 * Avoids hitting Firestore on every checkout / order creation.
 * Uses globalThis to survive Next.js HMR in dev.
 */

export interface DeliveryRange {
  minOrderValue: number;
  maxOrderValue: number | null; // null = no upper limit
  charge: number; // 0 = free delivery
}

export interface DeliveryChargesConfig {
  type: "fixed" | "range-based";
  fixedCharge: number;
  freeDeliveryEnabled: boolean;
  freeDeliveryThreshold: number | null; // applicable for fixed type
  ranges: DeliveryRange[];
  updatedAt?: string;
}

const globalForCache = globalThis as unknown as {
  _deliveryCache?: DeliveryChargesConfig | null;
  _deliveryCacheTs?: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getDeliveryCache(): { data: DeliveryChargesConfig | null; fresh: boolean } {
  const now = Date.now();
  if (globalForCache._deliveryCache && now - (globalForCache._deliveryCacheTs || 0) < CACHE_TTL_MS) {
    return { data: globalForCache._deliveryCache, fresh: true };
  }
  return { data: globalForCache._deliveryCache || null, fresh: false };
}

export function setDeliveryCache(data: DeliveryChargesConfig) {
  globalForCache._deliveryCache = data;
  globalForCache._deliveryCacheTs = Date.now();
}

export function invalidateDeliveryCache() {
  globalForCache._deliveryCache = null;
  globalForCache._deliveryCacheTs = 0;
}

/**
 * Calculate delivery charge for a given order subtotal using the config.
 */
export function calculateDeliveryCharge(config: DeliveryChargesConfig, subtotal: number): number {
  if (config.type === "fixed") {
    // Check free delivery threshold first
    if (config.freeDeliveryEnabled && config.freeDeliveryThreshold !== null && subtotal >= config.freeDeliveryThreshold) {
      return 0;
    }
    return config.fixedCharge;
  }

  // Range-based
  if (!config.ranges || config.ranges.length === 0) {
    return 0;
  }

  // Sort ranges by minOrderValue
  const sortedRanges = [...config.ranges].sort((a, b) => a.minOrderValue - b.minOrderValue);

  for (const range of sortedRanges) {
    const max = range.maxOrderValue ?? Infinity;
    if (subtotal >= range.minOrderValue && subtotal <= max) {
      return range.charge;
    }
  }

  // If no range matches, use the last range's charge (highest range)
  return sortedRanges[sortedRanges.length - 1].charge;
}

/** Default config when nothing is set in DB */
export const DEFAULT_DELIVERY_CONFIG: DeliveryChargesConfig = {
  type: "fixed",
  fixedCharge: 0,
  freeDeliveryEnabled: true,
  freeDeliveryThreshold: 0,
  ranges: [],
};
