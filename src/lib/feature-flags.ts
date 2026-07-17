import { createClient } from "@vercel/edge-config";

const FLAG_DEFAULTS = {
  crypto_payments_enabled: false,
  crypto_subscriptions_enabled: false,
  agentic_commerce_enabled: true,
  mpp_enabled: true,
  tax_automatic: true,
  maintenance_mode: false,
  new_checkout_flow: true,
} as const;

type FlagKey = keyof typeof FLAG_DEFAULTS;

let edgeConfigClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!edgeConfigClient) {
    const connectionString = process.env.EDGE_CONFIG;
    if (connectionString) {
      edgeConfigClient = createClient(connectionString);
    }
  }
  return edgeConfigClient;
}

export async function getFlag<T extends FlagKey>(key: T): Promise<(typeof FLAG_DEFAULTS)[T]> {
  const client = getClient();
  if (!client) return FLAG_DEFAULTS[key];
  try {
    const value = await client.get(key);
    return (value ?? FLAG_DEFAULTS[key]) as (typeof FLAG_DEFAULTS)[T];
  } catch {
    return FLAG_DEFAULTS[key];
  }
}

export async function getAllFlags(): Promise<Record<FlagKey, boolean>> {
  const client = getClient();
  if (!client) return { ...FLAG_DEFAULTS };
  try {
    const stored = await client.getAll();
    const result = { ...FLAG_DEFAULTS };
    for (const key of Object.keys(FLAG_DEFAULTS) as FlagKey[]) {
      if (stored[key] !== undefined) {
        result[key] = Boolean(stored[key]);
      }
    }
    return result;
  } catch {
    return { ...FLAG_DEFAULTS };
  }
}

export async function isMaintenanceMode(): Promise<boolean> {
  return getFlag("maintenance_mode");
}
