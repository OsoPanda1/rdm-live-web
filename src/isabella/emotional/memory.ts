import { logger } from "@/lib/logger";

interface EmotionalMemoryEntry {
  id: string;
  usuarioId: string;
  emocion: string;
  intensidad: number;
  contexto: string;
  timestamp: Date;
}

interface UserMemory {
  userId: string;
  entries: EmotionalMemoryEntry[];
  lastInteraction: Date;
  interactionCount: number;
}

export class MemoriaEmocional {
  private memories: Map<string, UserMemory> = new Map();
  private readonly maxEntriesPerUser = 100;

  recordar(usuarioId: string, emocion: string, intensidad: number, contexto: string): void {
    const id = crypto.randomUUID();
    const entry: EmotionalMemoryEntry = {
      id,
      usuarioId,
      emocion,
      intensidad,
      contexto: contexto.slice(0, 200),
      timestamp: new Date(),
    };

    let userMem = this.memories.get(usuarioId);
    if (!userMem) {
      userMem = {
        userId: usuarioId,
        entries: [],
        lastInteraction: new Date(),
        interactionCount: 0,
      };
    }

    userMem.entries.push(entry);
    userMem.lastInteraction = new Date();
    userMem.interactionCount++;

    if (userMem.entries.length > this.maxEntriesPerUser) {
      userMem.entries.shift();
    }

    this.memories.set(usuarioId, userMem);

    logger.info("[ISABELLA:MEMORIA] Recuerdo almacenado", {
      usuarioId,
      emocion,
      totalRecuerdos: userMem.entries.length,
    });
  }

  recordarContexto(usuarioId: string): { emocion: string; contexto: string } | null {
    const userMem = this.memories.get(usuarioId);
    if (!userMem || userMem.entries.length === 0) return null;

    const lastEntry = userMem.entries[userMem.entries.length - 1];
    return {
      emocion: lastEntry.emocion,
      contexto: lastEntry.contexto,
    };
  }

  obtenerHistorial(usuarioId: string): EmotionalMemoryEntry[] {
    return this.memories.get(usuarioId)?.entries ?? [];
  }

  obtenerPatronEmocional(usuarioId: string): Record<string, number> {
    const entries = this.obtenerHistorial(usuarioId);
    const pattern: Record<string, number> = {};

    for (const entry of entries) {
      pattern[entry.emocion] = (pattern[entry.emocion] ?? 0) + 1;
    }

    return pattern;
  }

  obtenerEstadisticas(usuarioId: string): {
    totalInteracciones: number;
    emocionPredominante: string;
    ultimaInteraccion: Date | null;
  } | null {
    const userMem = this.memories.get(usuarioId);
    if (!userMem) return null;

    const pattern = this.obtenerPatronEmocional(usuarioId);
    let emocionPredominante = "neutral";
    let maxCount = 0;

    for (const [emocion, count] of Object.entries(pattern)) {
      if (count > maxCount) {
        maxCount = count;
        emocionPredominante = emocion;
      }
    }

    return {
      totalInteracciones: userMem.interactionCount,
      emocionPredominante,
      ultimaInteraccion: userMem.lastInteraction,
    };
  }
}

export const memoriaEmocional = new MemoriaEmocional();
