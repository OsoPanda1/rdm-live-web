import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Medal, Crown, Star, TrendingUp, Users, Flame
} from "lucide-react";
import { getLeaderboard } from "../api";
import type { LeaderboardEntry, XpTrack, GamificationSeason } from "../types";

const TRACK_TABS: { key: XpTrack | 'total'; label: string; icon: typeof Trophy }[] = [
  { key: 'total', label: 'Total', icon: Crown },
  { key: 'cultura', label: 'Cultura', icon: Star },
  { key: 'comunidad', label: 'Comunidad', icon: Users },
  { key: 'juego', label: 'Juego', icon: Flame },
];

const RANK_STYLES = [
  { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: Crown },
  { bg: 'from-slate-400/15 to-slate-500/5', border: 'border-slate-400/20', text: 'text-slate-300', icon: Medal },
  { bg: 'from-orange-600/15 to-orange-700/5', border: 'border-orange-600/20', text: 'text-orange-400', icon: Medal },
];

interface LeaderboardProps {
  compact?: boolean;
  showSeason?: boolean;
}

export function Leaderboard({ compact = false, showSeason = true }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [season, setSeason] = useState<GamificationSeason | null>(null);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [activeTrack, setActiveTrack] = useState<XpTrack | 'total'>('total');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const track = activeTrack === 'total' ? undefined : activeTrack;
    getLeaderboard(track).then((data) => {
      setEntries(data.entries);
      setSeason(data.season);
      setPlayerRank(data.player_rank);
      setTotalPlayers(data.total_players);
      setLoading(false);
    });
  }, [activeTrack]);

  const getXp = (entry: LeaderboardEntry, track: XpTrack | 'total') => {
    if (track === 'total') return entry.total_xp;
    return track === 'cultura' ? entry.xp_cultura : track === 'comunidad' ? entry.xp_comunidad : entry.xp_juego;
  };

  return (
    <div className="rdm-glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
            <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Leaderboard
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <Users className="w-3 h-3" />
            {totalPlayers} jugadores
          </div>
        </div>

        {/* Season info */}
        {showSeason && season && (
          <div className="mb-3 p-2 rounded-lg bg-[hsl(var(--rdm-amber)/0.05)] border border-[hsl(var(--rdm-amber)/0.1)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[hsl(var(--rdm-amber))] font-medium">{season.name}</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {new Date(season.end_date).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            {/* Global goal progress */}
            {season.global_goal && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                    {season.global_goal.description}
                  </span>
                  <span className="text-[9px] text-[hsl(var(--rdm-amber))]">
                    {Math.round((season.global_goal.current / season.global_goal.target) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-terracotta))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(season.global_goal.current / season.global_goal.target) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Track tabs */}
        <div className="flex gap-1">
          {TRACK_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTrack(tab.key)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTrack === tab.key
                    ? 'bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Player's rank banner */}
      {playerRank && (
        <div className="px-5 py-2 bg-[hsl(var(--rdm-amber)/0.05)] border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Tu posicion</span>
            <span className="text-sm font-bold text-[hsl(var(--rdm-amber))]">
              #{playerRank}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard entries */}
      <div className={`p-2 space-y-1 ${compact ? 'max-h-[350px]' : 'max-h-[500px]'} overflow-y-auto`}>
        <AnimatePresence>
          {loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            entries.map((entry, i) => {
              const isTop3 = i < 3;
              const rankStyle = isTop3 ? RANK_STYLES[i] : null;
              const xp = getXp(entry, activeTrack);

              return (
                <motion.div
                  key={entry.player_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`relative flex items-center gap-3 p-3 rounded-xl transition-all ${
                    entry.player_id === 'player-001'
                      ? 'bg-[hsl(var(--rdm-amber)/0.08)] border border-[hsl(var(--rdm-amber)/0.15)]'
                      : isTop3
                        ? `bg-gradient-to-r ${rankStyle?.bg ?? ''} border ${rankStyle?.border ?? ''}`
                        : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isTop3 ? `${rankStyle?.bg ?? ''}` : 'bg-white/5'
                  }`}>
                    {isTop3 ? (
                      (() => { const RankIcon = rankStyle!.icon; return <RankIcon className={`w-4 h-4 ${rankStyle?.text ?? ''}`} />; })()
                    ) : (
                      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--rdm-amber)/0.3)] to-[hsl(var(--rdm-terracotta)/0.3)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {entry.display_name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-display)" }}>
                        {entry.display_name}
                      </span>
                      {entry.roles.includes('guardian_patrimonio') && (
                        <Shield className="w-3 h-3 text-[hsl(var(--teal))] shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        Nv. {entry.level}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">·</span>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] text-amber-400/70">
                          C:{entry.xp_cultura}
                        </span>
                        <span className="text-[9px] text-emerald-400/70">
                          M:{entry.xp_comunidad}
                        </span>
                        <span className="text-[9px] text-blue-400/70">
                          J:{entry.xp_juego}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[hsl(var(--rdm-amber))]">
                      {xp.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[hsl(var(--muted-foreground))] block">XP</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
