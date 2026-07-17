import { createStripe } from "./stripe.ts";

export interface TaxConfig {
  enabled: boolean;
  automaticTax: boolean;
  taxBehavior: "exclusive" | "inclusive";
}

export function getTaxConfig(): TaxConfig {
  return {
    enabled: true,
    automaticTax: true,
    taxBehavior: "exclusive",
  };
}

export async function calculateTax(
  amount: number,
  currency: string,
  customerDetails?: { address?: { country?: string; postal_code?: string }; tax_ids?: string[] },
): Promise<{ taxAmount: number; total: number; breakdown: Array<{ amount: number; rate: string; name: string }> }> {
  const stripe = createStripe();
  const calculation = await stripe.tax.calculations.create({
    currency: currency.toLowerCase(),
    line_items: [{
      amount: amount,
      reference: "txn",
      tax_behavior: "exclusive",
    }],
    customer_details: customerDetails || {
      address: { country: "MX", postal_code: "42000" },
    },
  });

  const breakdown = calculation.line_items?.data?.[0]?.tax_breakdown?.map((b) => ({
    amount: b.amount,
    rate: b.tax_rate_details?.display_name || "unknown",
    name: b.tax_rate_details?.jurisdiction?.country || "unknown",
  })) || [];

  const taxAmount = breakdown.reduce((sum, b) => sum + b.amount, 0);

  return {
    taxAmount,
    total: amount + taxAmount,
    breakdown,
  };
}

export function applyTaxToSession(
  session: Record<string, unknown>,
  taxConfig: TaxConfig,
): Record<string, unknown> {
  if (!taxConfig.enabled) return session;
  return {
    ...session,
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: taxConfig.automaticTax },
  };
}
