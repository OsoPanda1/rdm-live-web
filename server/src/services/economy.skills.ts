import { db } from "../lib/store.js";

export function getEconomySummary(): string {
  const donations = [...db.donations.values()];

  const totalDonations = donations.reduce(
    (acc, donation) => acc + (Number(donation.amount) || 0),
    0,
  );

  const totalEntries = db.ledger.size;
  const activeMemberships = [...db.memberships.values()].filter(
    (membership) => membership.active,
  ).length;

  const lines = [
    `Donaciones registradas: ${donations.length}`,
    `Monto acumulado (MXN): ${totalDonations.toFixed(2)}`,
    `Membresías activas: ${activeMemberships}`,
    `Movimientos de ledger: ${totalEntries}`,
  ];

  return lines.join("\n");
}
