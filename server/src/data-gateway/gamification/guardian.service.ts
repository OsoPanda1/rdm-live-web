import { randomUUID } from "node:crypto";
import type {
  GamificationPlayerData,
  GamificationMissionData,
  GamificationGuardianData,
  GamificationRewardData,
  GuardianAssignmentResult,
} from "../types.js";
import { playerService } from "./player.service.js";

const rewardCodeIndex = new Map<string, number>();

export const guardianService = {
  async assignGuardian(playerId: number): Promise<GuardianAssignmentResult | null> {
    const player = await playerService.getById(playerId);
    if (!player) return null;

    const previousCode = player.avatarId
      ? (await playerService.getGuardians()).find((g) => g.id === player.avatarId)?.code
      : undefined;

    let targetGuardian: GamificationGuardianData;
    let reason: string;

    if (player.virtuePoints >= 300 && player.xp >= 1500) {
      targetGuardian = await playerService.findGuardianByCode("GUARDIAN_SABIDURIA") ?? player.avatar!;
      reason = "Has acumulado sabiduría a través de acciones consistentes.";
    } else if (player.virtuePoints >= 200 && player.level >= 5) {
      targetGuardian = await playerService.findGuardianByCode("GUARDIAN_COMUNIDAD") ?? player.avatar!;
      reason = "Tu impacto en la comunidad es cada vez mayor.";
    } else if (player.virtuePoints >= 150 && player.xp >= 800) {
      targetGuardian = await playerService.findGuardianByCode("GUARDIAN_RESILIENCIA") ?? player.avatar!;
      reason = "Has demostrado resiliencia frente a los desafíos.";
    } else if (player.virtuePoints >= 80 && player.level >= 3) {
      targetGuardian = await playerService.findGuardianByCode("GUARDIAN_CREACION") ?? player.avatar!;
      reason = "Tu creatividad florece en cada acción.";
    } else if (player.virtuePoints >= 30 && player.level >= 2) {
      targetGuardian = await playerService.findGuardianByCode("GUARDIAN_CALMA") ?? player.avatar!;
      reason = "Has cultivado calma en tu viaje.";
    } else {
      targetGuardian = await playerService.findGuardianByCode("GUARDIAN_OBSERVADOR") ?? {
        id: 1, code: "GUARDIAN_OBSERVADOR", name: "Guardian Observador",
        description: "Estás comenzando tu viaje.", archetype: "observador", primaryVirtue: "curiosidad",
      };
      reason = "Estás comenzando tu viaje; observa y aprende.";
    }

    if (player.avatarId !== targetGuardian.id) {
      await playerService.setGuardian(playerId, targetGuardian.id);
    }

    return {
      previousCode,
      currentCode: targetGuardian.code,
      guardian: targetGuardian,
      reason,
    };
  },

  async evaluateAndReward(player: GamificationPlayerData, mission: GamificationMissionData): Promise<GamificationRewardData | null> {
    if (mission.xpReward < 100) return null;

    const rewardKey = `${mission.context}_FIRST_${player.id}`;
    if (rewardCodeIndex.has(rewardKey)) return null;
    rewardCodeIndex.set(rewardKey, Date.now());

    const badgeCode = `BADGE_${mission.code}`;
    const reward: GamificationRewardData = {
      id: rewardCodeIndex.size,
      playerId: player.id,
      rewardCode: badgeCode,
      type: "BADGE",
      metadata: {
        missionCode: mission.code,
        missionTitle: mission.title,
        earnedAt: new Date().toISOString(),
      },
      claimedAt: new Date().toISOString(),
    };

    return reward;
  },

  async getRewards(playerId: number): Promise<GamificationRewardData[]> {
    const allRewards = Array.from(rewardCodeIndex.entries())
      .filter(([key]) => key.endsWith(`_${playerId}`))
      .map(([key]) => {
        const parts = key.split("_FIRST_");
        const badgeCode = parts[0];
        return {
          id: rewardCodeIndex.get(key)!,
          playerId,
          rewardCode: `BADGE_${badgeCode}`,
          type: "BADGE" as const,
          metadata: {},
          claimedAt: new Date().toISOString(),
        };
      });
    return allRewards;
  },
};
