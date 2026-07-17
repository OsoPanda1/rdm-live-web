// server/src/core/decision-store.ts

export type CryptoProfile = "pre-quantum" | "hybrid-pq" | "post-quantum-ready";

export interface DecisionStoreSaveInput {
  traceId: string;
  intent: string;
  score: number;
  territory: string;
  metadata: Record<string, string | number | boolean>;

  // Campos adicionales de observabilidad / seguridad
  source?: string;           // p.ej. "realito", "isabella", "api:recommendation"
  modelId?: string;          // modelo de IA / regla que emitió la decisión
  riskLevel?: "low" | "medium" | "high";
  cryptoProfile?: CryptoProfile;  // TLS / canal cripto de la sesión
  ledgerAnchor?: string;     // hash / id externo en MSR / blockchain / ledger
  createdAt?: string;        // ISO string; si no se pasa, se genera
}

export interface DecisionRecord extends DecisionStoreSaveInput {
  createdAt: string;
}

export interface DecisionStore {
  save(input: DecisionStoreSaveInput): void;
  list(limit?: number): DecisionRecord[];
  purge(): void;
}

const decisions: DecisionRecord[] = [];

// Capacidad máxima en memoria para evitar fugas
const MAX_DECISIONS_IN_MEMORY = 5000;

// Logger mínimo opcional (puedes inyectar uno real si quieres)
const logDecision = (record: DecisionRecord) => {
  const entry = {
    ts: new Date().toISOString(),
    level: "info",
    message: "decision_recorded",
    traceId: record.traceId,
    intent: record.intent,
    score: record.score,
    territory: record.territory,
    riskLevel: record.riskLevel ?? "low",
    cryptoProfile: record.cryptoProfile ?? "pre-quantum",
    source: record.source,
  };

   
  console.log(JSON.stringify(entry));
};

export const decisionStore: DecisionStore = {
  save(input: DecisionStoreSaveInput) {
    const record: DecisionRecord = {
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
      cryptoProfile: input.cryptoProfile ?? "pre-quantum",
      riskLevel: input.riskLevel ?? "low",
    };

    decisions.push(record);

    // Evitar crecimiento ilimitado en memoria
    if (decisions.length > MAX_DECISIONS_IN_MEMORY) {
      decisions.splice(0, decisions.length - MAX_DECISIONS_IN_MEMORY);
    }

    // Telemetría básica
    logDecision(record);
  },

  list(limit?: number): DecisionRecord[] {
    if (!limit || limit >= decisions.length) {
      return [...decisions];
    }
    return decisions.slice(decisions.length - limit);
  },

  purge(): void {
    decisions.length = 0;
  },
};
