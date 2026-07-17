import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Trophy, Flame, Star, Clock, CheckCircle2,
  ChevronRight, Zap, Shield, Pickaxe, Mountain
} from "lucide-react";
import { getPlayerProfile } from "../api";
import type { GamificationPlayerQuest, GamificationQuest, XpTrack } from "../types";
import { calculateLevel, levelProgress } from "../engine";

const TRACK_COLORS: Record<XpTrack, string> = {
  cultura: "hsl(43, 80%, 55%)",
  comunidad: "hsl(152, 60%, 45%)",
  juego: "hsl(210, 100%, 55%)",
};

const TRACK_LABELS: Record<XpTrack, string> = {
  cultura: "Cultura",
  comunidad: "Comunidad",
  juego: "Juego",
};

const TRACK_ICONS: Record<XpTrack, typeof Target> = {
  cultura: Pickaxe,
  comunidad: Shield,
  juego: Zap,
};

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-orange-400 bg-orange-400/10",
  legendary: "text-purple-400 bg-purple-400/10",
};

interface QuestPanelProps {
  compact?: boolean;
}

export function QuestPanel({ compact = false }: QuestPanelProps) {
  const [quests, setQuests] = useState<(GamificationPlayerQuest & { quest: GamificationQuest })[]>([]);
  const [player, setPlayer] = useState<{ total_xp: number; level: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState<XpTrack | 'all'>('all');

  useEffect(() => {
    getPlayerProfile().then((profile) => {
      setQuests(profile.active_quests);
      setPlayer(profile.player);
      setLoading(false);
    });
  }, []);

  const filteredQuests = activeTrack === 'all'
    ? quests
    : quests.filter(q => q.quest.track === activeTrack);

  const completedCount = quests.filter(q => q.status === 'completed').length;
  const totalCount = quests.length;

  if (loading) {
    return (
      <div className="rdm-glass rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rdm-glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
            <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Misiones Activas
            </h3>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* XP Bar */}
        {player && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Nivel {player.level}
              </span>
              <span className="text-xs text-[hsl(var(--rdm-amber))]">
                {player.total_xp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress(player.total_xp) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Track filters */}
        {!compact && (
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTrack('all')}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                activeTrack === 'all'
                  ? 'bg-[hsl(var(--rdm-amber)/0.2)] text-[hsl(var(--rdm-amber))]'
                  : 'bg-white/5 text-[hsl(var(--muted-foreground))] hover:bg-white/10'
              }`}
            >
              Todas
            </button>
            {(Object.keys(TRACK_COLORS) as XpTrack[]).map(track => {
              const Icon = TRACK_ICONS[track];
              return (
                <button
                  key={track}
                  onClick={() => setActiveTrack(track)}
                  className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all flex items-center gap-1 ${
                    activeTrack === track
                      ? 'text-white'
                      : 'bg-white/5 text-[hsl(var(--muted-foreground))] hover:bg-white/10'
                  }`}
                  style={activeTrack === track ? { background: TRACK_COLORS[track] + '33', color: TRACK_COLORS[track] } : undefined}
                >
                  <Icon className="w-3 h-3" />
                  {TRACK_LABELS[track]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quest List */}
      <div className={`p-3 space-y-2 ${compact ? 'max-h-[300px]' : 'max-h-[500px]'} overflow-y-auto`}>
        <AnimatePresence>
          {filteredQuests.map((pq, i) => (
            <motion.div
              key={pq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className={`relative p-3 rounded-xl border transition-all ${
                pq.status === 'completed'
                  ? 'bg-[hsl(var(--rdm-amber)/0.05)] border-[hsl(var(--rdm-amber)/0.2)]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Track indicator */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: TRACK_COLORS[pq.quest.track] + '20' }}
                >
                  {pq.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: TRACK_COLORS[pq.quest.track] }} />
                  ) : (
                    <Target className="w-4 h-4" style={{ color: TRACK_COLORS[pq.quest.track] }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-display)" }}>
                      {pq.quest.name}
                    </h4>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${DIFFICULTY_COLORS[pq.quest.difficulty]}`}>
                      {pq.quest.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-1 mb-2">
                    {pq.quest.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: TRACK_COLORS[pq.quest.track] }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(pq.progress_json.current / pq.progress_json.target) * 100}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                      />
                    </div>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] shrink-0">
                      {pq.progress_json.current}/{pq.progress_json.target}
                    </span>
                  </div>

                  {/* Reward preview */}
                  {pq.quest.reward_json.xp && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 text-[hsl(var(--rdm-amber))]" />
                      <span className="text-[10px] text-[hsl(var(--rdm-amber))]">
                        +{pq.quest.reward_json.xp} XP
                      </span>
                      {pq.quest.reward_json.badge_code && (
                        <>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">·</span>
                          <Trophy className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] text-purple-400">Badge</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground)/0.5)] shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredQuests.length === 0 && (
          <div className="text-center py-8">
            <Target className="w-8 h-8 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-2" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              No hay misiones en esta categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
