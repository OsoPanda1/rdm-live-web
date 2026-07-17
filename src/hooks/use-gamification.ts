import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GamificationProfile {
  user_id: string;
  points: number;
  level: number;
  badges: string[];
  streak_days: number;
}

export interface GamificationEvent {
  id: string;
  event_type: string;
  points: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GamificationQuest {
  id: string;
  code: string;
  title: string;
  description: string;
  quest_type: string;
  criteria: Record<string, unknown>;
  reward_xp: number;
  reward_badge: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
  rank: number;
}

const TIERS = [
  { level: 1, name: "Aprendiz Minero", xpRequired: 0 },
  { level: 2, name: "Minero Local", xpRequired: 500 },
  { level: 3, name: "Explorador del Hub", xpRequired: 1500 },
  { level: 4, name: "Guardián del Patrimonio", xpRequired: 3500 },
  { level: 5, name: "Cronista Digital", xpRequired: 6000 },
  { level: 6, name: "Arquitecto Territorial", xpRequired: 10000 },
  { level: 7, name: "Maestro del Hub", xpRequired: 20000 },
] as const;

export function getTierForLevel(level: number) {
  return TIERS.find((t) => t.level === level) ?? TIERS[TIERS.length - 1];
}

export function getLevelForXp(points: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].xpRequired) return TIERS[i].level;
  }
  return 1;
}

export function useGamification() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [quests, setQuests] = useState<GamificationQuest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      setProfile({
        user_id: data.user_id,
        points: data.points,
        level: data.level,
        badges: (data.badges as string[]) ?? [],
        streak_days: data.streak_days,
      });
    }
  }, []);

  const fetchQuests = useCallback(async () => {
    const { data } = await supabase
      .from("gamification_quests")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setQuests(data as GamificationQuest[]);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("gamification_profiles")
      .select("user_id, points, level, badges, streak_days")
      .order("points", { ascending: false })
      .limit(50);
    if (data) {
      setLeaderboard(
        data.map((row, i) => ({
          user_id: row.user_id,
          display_name: null,
          avatar_url: null,
          points: row.points,
          level: row.level,
          rank: i + 1,
        })),
      );
    }
  }, []);

  const fetchEvents = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("gamification_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setEvents(data as GamificationEvent[]);
  }, []);

  const recordEvent = useCallback(
    async (userId: string, eventType: string, points: number, metadata?: Record<string, unknown>) => {
      await supabase.from("gamification_events").insert({
        user_id: userId,
        event_type: eventType,
        points,
        metadata: (metadata ?? {}) as unknown as Record<string, string>,
      });

      const { data: current } = await supabase
        .from("gamification_profiles")
        .select("points, level")
        .eq("user_id", userId)
        .maybeSingle();

      if (current) {
        const newPoints = current.points + points;
        const newLevel = getLevelForXp(newPoints);
        await supabase
          .from("gamification_profiles")
          .update({ points: newPoints, level: newLevel, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }

      await fetchProfile(userId);
      await fetchEvents(userId);
    },
    [fetchProfile, fetchEvents],
  );

  const loadAll = useCallback(
    async (userId: string) => {
      if (loadedRef.current) return;
      setLoading(true);
      await Promise.all([
        fetchProfile(userId),
        fetchQuests(),
        fetchLeaderboard(),
        fetchEvents(userId),
      ]);
      loadedRef.current = true;
      setLoading(false);
    },
    [fetchProfile, fetchQuests, fetchLeaderboard, fetchEvents],
  );

  return {
    profile,
    quests,
    leaderboard,
    events,
    loading,
    tiers: TIERS,
    loadAll,
    fetchProfile,
    fetchQuests,
    fetchLeaderboard,
    fetchEvents,
    recordEvent,
  };
}
