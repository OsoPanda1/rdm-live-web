// ============================================================================
// RDM Digital OS — Decision Engine & Audit Store v2
// Tamper-evident ledger for AI-assisted decisions (SHA-256 hash chain)
// ============================================================================

import { createHash } from "crypto";

// --------------------------------------------------------------------------
// Domain types
// --------------------------------------------------------------------------

/**
 * Entrada mínima que el motor necesita para recomendar algo.
 * No asume UI ni copy concreto.
 */
export interface DecisionInput {
  traceId: string;
  intent: string;
  payload: unknown;
}

/**
 * Recomendación en lenguaje natural orientada a usuario final.
 * El copy se puede versionar y/o localizar.
 */
export interface DecisionRecommendation {
  traceId: string;
  intent: string;
  recommendation: string;
  /** Puntuación de confianza 0–1, opcionalmente usada por UI. */
  confidence?: number;
}

/**
 * Registro auditable de una decisión.
 * No mezcla texto de marketing; es puro dato para auditoría/compliance.
 */
export interface AuditedDecision {
  traceId: string;
  intent: string;
  score: number; // 0–1
  territory: string;
  decidedAt: string; // ISO-8601
  version: number;
  /** Hash actual del registro (incluye previousHash). */
  hash: string;
  /** Hash del registro anterior en la cadena (o null si es el primero). */
  previousHash: string | null;
}

/**
 * Eventos que se consideran "decision events" en el sistema.
 * Esto ayuda a evitar sesgos: se define explícitamente qué se audita.
 */
export type DecisionEventKind =
  | "ROUTING"
  | "PRIORITIZATION"
  | "ALERTING"
  | "RECOMMENDATION";

export interface DecisionMetadata {
  kind: DecisionEventKind;
  actorId?: string; // humano, sistema, o agente
  source?: string; // microservicio / módulo origen
  notes?: string;
}

// --------------------------------------------------------------------------
// Utils
// --------------------------------------------------------------------------

function sha256(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Normaliza un score a rango 0–1 para evitar valores fuera de rango.
 */
function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, score));
}

// --------------------------------------------------------------------------
// Decision Engine
// --------------------------------------------------------------------------

/**
 * Motor ligero de recomendación textual.
 * No almacena estado sensible: puedes usarlo como servicio puro.
 */
export class DecisionEngine {
  /**
   * Traduce una respuesta de un modelo a una recomendación legible,
   * sin introducir juicios de valor fuera del intent declarado.
   */
  public buildRecommendation(
    input: DecisionInput,
    rawModelOutput: string,
    confidence?: number,
  ): DecisionRecommendation {
    const safeConfidence = confidence !== undefined
      ? normalizeScore(confidence)
      : undefined;

    const base = rawModelOutput.trim();

    // Plantilla neutral y explicativa. Aquí puedes luego aplicar i18n.
    const recommendationText =
      base.length > 0
        ? `Con base en el análisis del contexto asociado a "${input.intent}", el sistema sugiere: ${base}`
        : `Se analizaron los datos asociados a "${input.intent}", pero no se generó una recomendación específica.`;

    return {
      traceId: input.traceId,
      intent: input.intent,
      recommendation: recommendationText,
      confidence: safeConfidence,
    };
  }
}

// --------------------------------------------------------------------------
// Decision Store (append-only, hash-chain ledger)
// --------------------------------------------------------------------------

/**
 * Config de la tienda de decisiones: permite ajustar comportamiento
 * sin tocar la lógica central.
 */
export interface DecisionStoreConfig {
  /**
   * Máximo de registros retornados por defecto en getLedger().
   */
  defaultLedgerLimit: number;
  /**
   * Si true, la cadena de hash incluye previousHash para tamper-evidence.
   */
  enableHashChain: boolean;
  /**
   * Si true, se permiten lecturas públicas del ledger completo.
   * Si false, se recomienda exponer solo APIs filtradas.
   */
  allowFullLedgerRead: boolean;
}

const DEFAULT_DECISION_STORE_CONFIG: DecisionStoreConfig = {
  defaultLedgerLimit: 50,
  enableHashChain: true,
  allowFullLedgerRead: true,
};

/**
 * Entrada para guardar una decisión sin campos derivados.
 */
export interface DecisionStoreSaveInput
  extends Omit<
    AuditedDecision,
    "hash" | "decidedAt" | "version" | "previousHash"
  > {
  metadata?: DecisionMetadata;
}

/**
 * Registro extendido interno (con metadata).
 * Útil si en futuro quieres auditar también el metadata.
 */
interface InternalLedgerEntry {
  decision: AuditedDecision;
  metadata?: DecisionMetadata;
}

/**
 * Append-only ledger de decisiones con cadena de hashes SHA‑256.
 * Pensado como building block: no asume base de datos concreta.
 */
export class DecisionStore {
  private readonly config: DecisionStoreConfig;
  private readonly ledger: InternalLedgerEntry[] = [];
  private lastDecision: AuditedDecision | null = null;

  constructor(config: Partial<DecisionStoreConfig> = {}) {
    this.config = { ...DEFAULT_DECISION_STORE_CONFIG, ...config };
  }

  /**
   * Calcula hash del registro actual, enlazando con el hash anterior
   * si la opción enableHashChain está activa.
   */
  private computeHash(
    payload: DecisionStoreSaveInput,
    version: number,
    previousHash: string | null,
    decidedAt: string,
  ): string {
    const base = {
      traceId: payload.traceId,
      intent: payload.intent,
      score: normalizeScore(payload.score),
      territory: payload.territory,
      version,
      previousHash: this.config.enableHashChain ? previousHash : null,
      decidedAt,
    };

    return sha256(JSON.stringify(base));
  }

  /**
   * Guarda una decisión en el ledger (append-only).
   * Devuelve el registro auditado que se insertó.
   */
  public save(input: DecisionStoreSaveInput): AuditedDecision {
    const version = this.ledger.length + 1;
    const decidedAt = isoNow();
    const previousHash = this.lastDecision?.hash ?? null;

    const score = normalizeScore(input.score);

    const hash = this.computeHash(
      { ...input, score },
      version,
      previousHash,
      decidedAt,
    );

    const audited: AuditedDecision = {
      traceId: input.traceId,
      intent: input.intent,
      score,
      territory: input.territory,
      decidedAt,
      version,
      hash,
      previousHash: this.config.enableHashChain ? previousHash : null,
    };

    const entry: InternalLedgerEntry = {
      decision: audited,
      metadata: input.metadata,
    };

    this.ledger.push(entry);
    this.lastDecision = audited;

    return audited;
  }

  /**
   * Devuelve la última decisión auditada, o null si el ledger está vacío.
   */
  public getLastDecision(): AuditedDecision | null {
    return this.lastDecision;
  }

  /**
   * Devuelve una porción del ledger, del final hacia atrás.
   * No expone metadata interna.
   */
  public getLedger(limit = this.config.defaultLedgerLimit): AuditedDecision[] {
    if (!this.config.allowFullLedgerRead) {
      // En entornos de alta seguridad podrías lanzar o devolver vacío
      // y exponer solo métodos filtrados.
    }
    const slice = this.ledger.slice(-limit);
    return slice.map((entry) => entry.decision);
  }

  /**
   * Busca una decisión por traceId.
   */
  public explain(traceId: string): AuditedDecision | null {
    const found = this.ledger.find(
      (entry) => entry.decision.traceId === traceId,
    );
    return found?.decision ?? null;
  }

  /**
   * Verifica la integridad de la cadena de hashes.
   * Útil para tareas batch de auditoría.
   */
  public verifyIntegrity(): {
    ok: boolean;
    brokenAtVersion?: number;
  } {
    let previousHash: string | null = null;

    for (const entry of this.ledger) {
      const d = entry.decision;
      const recomputed = this.computeHash(
        {
          traceId: d.traceId,
          intent: d.intent,
          score: d.score,
          territory: d.territory,
        },
        d.version,
        previousHash,
        d.decidedAt,
      );

      if (recomputed !== d.hash) {
        return { ok: false, brokenAtVersion: d.version };
      }

      previousHash = d.hash;
    }

    return { ok: true };
  }
}

// --------------------------------------------------------------------------
// Shared singletons
// --------------------------------------------------------------------------

export const decisionEngine = new DecisionEngine();
export const decisionStore = new DecisionStore();
