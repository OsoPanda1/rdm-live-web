import { db } from "../../lib/store.js";
import type {
  GamificationPlayerData,
  GamificationGuardianData,
  GamificationRewardData,
  EmotionStateData,
} from "../types.js";

interface GamificationPlayerRecord extends GamificationPlayerData {
  rewards: GamificationRewardData[];
}

class GamificationPlayerStore {
  private players = new Map<number, GamificationPlayerRecord>();
  private bySupabaseId = new Map<string, number>();
  private nextId = 1;

  async findBySupabaseId(supabaseUserId: string): Promise<GamificationPlayerRecord | null> {
    const id = this.bySupabaseId.get(supabaseUserId);
    if (!id) return null;
    return this.players.get(id) ?? null;
  }

  async findById(id: number): Promise<GamificationPlayerRecord | null> {
    return this.players.get(id) ?? null;
  }

  async create(data: { supabaseUserId: string; displayName?: string }): Promise<GamificationPlayerRecord> {
    const id = this.nextId++;
    const record: GamificationPlayerRecord = {
      id,
      supabaseUserId: data.supabaseUserId,
      displayName: data.displayName ?? "",
      level: 1,
      xp: 0,
      virtuePoints: 0,
      reputationScore: 2000,
      rewards: [],
    };
    this.players.set(id, record);
    this.bySupabaseId.set(data.supabaseUserId, id);
    return record;
  }

  async update(id: number, data: Partial<GamificationPlayerRecord>): Promise<GamificationPlayerRecord | null> {
    const existing = this.players.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.players.set(id, updated);
    return updated;
  }

  async addReward(playerId: number, reward: GamificationRewardData): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      player.rewards.push(reward);
    }
  }

  async getAll(): Promise<GamificationPlayerRecord[]> {
    return Array.from(this.players.values());
  }
}

const playerStore = new GamificationPlayerStore();

const guardianSeeds: GamificationGuardianData[] = [
  { id: 1, code: "GUARDIAN_OBSERVADOR", name: "Guardian Observador", description: "Comienzo del viaje; observas y aprendes.", archetype: "observador", primaryVirtue: "curiosidad" },
  { id: 2, code: "GUARDIAN_CALMA", name: "Guardia de la Calma", description: "Has encontrado paz en medio del movimiento.", archetype: "sabio", primaryVirtue: "calma" },
  { id: 3, code: "GUARDIAN_CREACION", name: "Guardián de la Creación", description: "Tu alegría se manifiesta en crear.", archetype: "creador", primaryVirtue: "creatividad" },
  { id: 4, code: "GUARDIAN_RESILIENCIA", name: "Guardián de la Resiliencia", description: "Cada desafío te fortalece.", archetype: "guerrero", primaryVirtue: "resiliencia" },
  { id: 5, code: "GUARDIAN_COMUNIDAD", name: "Guardián de la Comunidad", description: "Tu impacto se extiende a quienes te rodean.", archetype: "cuidador", primaryVirtue: "cooperación" },
  { id: 6, code: "GUARDIAN_SABIDURIA", name: "Guardián de la Sabiduría", description: "El conocimiento y la experiencia te guían.", archetype: "sabio", primaryVirtue: "sabiduría" },
];

export const playerService = {
  async getOrCreate(supabaseUserId: string, displayName?: string): Promise<GamificationPlayerData> {
    let player = await playerStore.findBySupabaseId(supabaseUserId);
    if (!player) {
      player = await playerStore.create({ supabaseUserId, displayName });
    }
    return player;
  },

  async getById(id: number): Promise<GamificationPlayerData | null> {
    return playerStore.findById(id);
  },

  async getBySupabaseId(supabaseUserId: string): Promise<GamificationPlayerData | null> {
    return playerStore.findBySupabaseId(supabaseUserId);
  },

  async addXp(playerId: number, amount: number): Promise<GamificationPlayerData | null> {
    const player = await playerStore.findById(playerId);
    if (!player) return null;
    const newXp = player.xp + amount;
    const newLevel = Math.floor(newXp / 250) + 1;
    const updated = await playerStore.update(playerId, { xp: newXp, level: newLevel });
    return updated;
  },

  async addVirtuePoints(playerId: number, amount: number): Promise<GamificationPlayerData | null> {
    const player = await playerStore.findById(playerId);
    if (!player) return null;
    const newVp = player.virtuePoints + amount;
    return playerStore.update(playerId, { virtuePoints: newVp });
  },

  async setGuardian(playerId: number, guardianId: number): Promise<GamificationPlayerData | null> {
    return playerStore.update(playerId, { avatarId: guardianId } as Partial<GamificationPlayerRecord>);
  },

  async getGuardians(): Promise<GamificationGuardianData[]> {
    return guardianSeeds;
  },

  async findGuardianByCode(code: string): Promise<GamificationGuardianData | undefined> {
    return guardianSeeds.find((g) => g.code === code);
  },

  async findAll(): Promise<GamificationPlayerData[]> {
    return playerStore.getAll();
  },
};
