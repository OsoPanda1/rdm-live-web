import type {
  GamificationMissionData,
  GamificationQuestLogData,
  GamificationRewardData,
  MissionCompletionResult,
  QuestStatus,
  MissionContext,
} from "../types.js";
import { playerService } from "./player.service.js";
import { guardianService } from "./guardian.service.js";

interface QuestLogRecord extends GamificationQuestLogData {
  playerId: number;
  missionId: number;
}

const seedMissions: GamificationMissionData[] = [
  {
    id: 1, code: "TURISMO_RUTA_CENTRO", title: "Ruta histórica del Centro",
    description: "Visita el Jardín Principal, la Parroquia y un casillero minero. Escanea los QR para descubrir su historia.",
    context: "turismo", xpReward: 150, virtueReward: 30, maxCompletions: 1, isActive: true,
  },
  {
    id: 2, code: "COMERCIO_LOCAL_RESPONSABLE", title: "Guardianes del Comercio Justo",
    description: "Compra en un negocio local registrado, califica con respeto y deja un comentario constructivo.",
    context: "comercio", xpReward: 120, virtueReward: 40, maxCompletions: 1, isActive: true,
  },
  {
    id: 3, code: "EMOCION_DIARIO_GRATITUD", title: "Tres cosas que agradeces hoy",
    description: "Durante tres días consecutivos, escribe tres cosas por las que agradeces. Tu guardián reflejará tu nueva perspectiva.",
    context: "emociones", xpReward: 100, virtueReward: 50, maxCompletions: 3, isActive: true,
  },
  {
    id: 4, code: "EMOCION_RESPIRO_CONSCIENTE", title: "Tres minutos de calma",
    description: "Activa esta misión cuando te sientas saturado; Isabella te guiará en una respiración de 3 minutos.",
    context: "emociones", xpReward: 60, virtueReward: 25, maxCompletions: 10, isActive: true,
  },
  {
    id: 5, code: "XR_EXPLORADOR_RDM", title: "Explorador 4D de Real del Monte",
    description: "Entra a un Dreamspace XR, explora tres escenas y encuentra los símbolos de cooperación y cuidado.",
    context: "xr", xpReward: 200, virtueReward: 60, maxCompletions: 1, isActive: true,
  },
];

class QuestStore {
  private missions = new Map<number, GamificationMissionData>();
  private questLogs = new Map<string, QuestLogRecord>();
  private nextMissionId = 6;
  private nextLogId = 1;

  constructor() {
    for (const m of seedMissions) {
      this.missions.set(m.id, m);
    }
  }

  async getActiveMissions(context?: MissionContext): Promise<GamificationMissionData[]> {
    const all = Array.from(this.missions.values()).filter((m) => m.isActive);
    if (context) return all.filter((m) => m.context === context);
    return all;
  }

  async getMissionById(id: number): Promise<GamificationMissionData | null> {
    return this.missions.get(id) ?? null;
  }

  async getMissionByCode(code: string): Promise<GamificationMissionData | null> {
    return Array.from(this.missions.values()).find((m) => m.code === code) ?? null;
  }

  async getQuestLog(playerId: number, missionId: number): Promise<QuestLogRecord | null> {
    const key = `${playerId}:${missionId}`;
    return this.questLogs.get(key) ?? null;
  }

  async upsertQuestLog(playerId: number, missionId: number, data: Partial<QuestLogRecord>): Promise<QuestLogRecord> {
    const key = `${playerId}:${missionId}`;
    let log = this.questLogs.get(key);
    if (!log) {
      log = { id: this.nextLogId++, playerId, missionId, status: "IN_PROGRESS", progress: 0, completions: 0 };
    }
    Object.assign(log, data);
    this.questLogs.set(key, log);
    return log;
  }

  async getPlayerQuestLogs(playerId: number): Promise<QuestLogRecord[]> {
    return Array.from(this.questLogs.values()).filter((l) => l.playerId === playerId);
  }
}

const questStore = new QuestStore();

export const missionService = {
  async getAvailable(context?: MissionContext): Promise<GamificationMissionData[]> {
    return questStore.getActiveMissions(context);
  },

  async getById(id: number): Promise<GamificationMissionData | null> {
    return questStore.getMissionById(id);
  },

  async startMission(playerId: number, missionId: number): Promise<GamificationQuestLogData | null> {
    const mission = await questStore.getMissionById(missionId);
    if (!mission) return null;

    let log = await questStore.getQuestLog(playerId, missionId);
    if (!log) {
      log = await questStore.upsertQuestLog(playerId, missionId, { status: "IN_PROGRESS", progress: 0 });
    }
    return log;
  },

  async updateProgress(playerId: number, missionId: number, progress: number): Promise<GamificationQuestLogData | null> {
    const mission = await questStore.getMissionById(missionId);
    if (!mission) return null;

    return questStore.upsertQuestLog(playerId, missionId, { progress: Math.min(1, Math.max(0, progress)) });
  },

  async completeMission(playerId: number, missionId: number): Promise<MissionCompletionResult | null> {
    const mission = await questStore.getMissionById(missionId);
    if (!mission) return null;

    let log = await questStore.getQuestLog(playerId, missionId);
    const newCount = (log?.completions ?? 0) + 1;

    if (newCount > mission.maxCompletions) return null;

    await questStore.upsertQuestLog(playerId, missionId, {
      status: newCount >= mission.maxCompletions ? "COMPLETED" : "IN_PROGRESS",
      completions: newCount,
      progress: 1,
    });

    const player = await playerService.addXp(playerId, mission.xpReward);
    await playerService.addVirtuePoints(playerId, mission.virtueReward);

    const rewards: GamificationRewardData[] = [];
    if (newCount === 1) {
      const reward = await guardianService.evaluateAndReward(playerId, mission);
      if (reward) rewards.push(reward);
    }

    const updatedPlayer = await playerService.getById(playerId);
    if (!updatedPlayer) return null;

    await guardianService.assignGuardian(playerId);

    return {
      player: updatedPlayer,
      mission,
      xpGained: mission.xpReward,
      virtueGained: mission.virtueReward,
      rewards,
      newLevel: updatedPlayer.level,
    };
  },

  async getPlayerQuests(playerId: number): Promise<GamificationQuestLogData[]> {
    return questStore.getPlayerQuestLogs(playerId);
  },
};
