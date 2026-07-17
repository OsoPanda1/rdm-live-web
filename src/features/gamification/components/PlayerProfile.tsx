import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Trophy, Star, Shield, Flame, TrendingUp, Award,
  Calendar, Zap, Target
} from "lucide-react";
import { getPlayerProfile } from "../api";
import type {
  GamificationPlayer,
  GamificationPlayerBadge,
  GamificationBadge,
  GamificationSeason,
  XpTrack,
} from "../types";
import { calculateLevel, levelProgress, xpForNextLevel } from "../engine";

const TRACK_CONFIG: Record<XpTrack, { label: string; color: string; icon: typeof Target }> = {
  cultura: { label: 'Cultura', color: 'hsl(43, 80%, 55%)', icon: Star },
  comunidad: { label: 'Comunidad', color: 'hsl(152, 60%, 45%)', icon: Shield },
  juego: { label: 'Juego', color: 'hsl(210, 100%, 55%)', icon: Zap },
};

const RARITY_STYLES = {
  common: 'border-white/10 bg-white/5',
  rare: 'border-blue-500/30 bg-blue-500/5',
  epic: 'border-purple-500/30 bg-purple-500/5',
  legendary: 'border-amber-500/30 bg-amber-500/5',
};

const RARITY_LABELS = {
  common: 'Comun',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Legendario',
};

const ROLE_LABELS: Record<string, string> = {
  aprendiz_minero: 'Aprendiz Minero',
  minero_local: 'Minero Local',
  guardian_patrimonio: 'Guardian del Patrimonio',
  maestro_hub: 'Maestro del Hub',
  arquitecto_territorial: 'Arquitecto Territorial',
};

export function PlayerProfile() {
  const [player, setPlayer] = useState<GamificationPlayer | null>(null);
  const [badges, setBadges] = useState<(GamificationPlayerBadge & { badge: GamificationBadge })[]>([]);
  const [season, setSeason] = useState<GamificationSeason | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayerProfile().then((profile) => {
      setPlayer(profile.player);
      setBadges(profile.badges);
      setSeason(profile.season);
      setLoading(false);
    });
  }, []);

  if (loading || !player) {
    return (
      <div className="rdm-glass rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-3 bg-white/5 rounded w-24" />
            </div>
          </div>
          <div className="h-20 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const level = calculateLevel(player.total_xp);
  const progress = levelProgress(player.total_xp);
  const nextLevelXp = xpForNextLevel(level);
  const earnedBadges = badges.filter(b => b.earned_at);
  const currentRole = player.roles[player.roles.length - 1] ?? 'aprendiz_minero';

  return (
    <div className="rdm-glass rounded-2xl overflow-hidden">
      {/* Profile Header */}
      <div className="relative p-6 pb-4">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[hsl(var(--rdm-amber)/0.08)] to-transparent" />

        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--rdm-amber)/0.4)] to-[hsl(var(--rdm-terracotta)/0.4)] flex items-center justify-center ring-2 ring-[hsl(var(--rdm-amber)/0.3)]">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[hsl(var(--rdm-amber))] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[hsl(var(--navy-dark))]">{level}</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {player.display_name || 'Jugador'}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--rdm-amber)/0.15)] text-[10px] font-medium text-[hsl(var(--rdm-amber))]">
                {ROLE_LABELS[currentRole] || currentRole}
              </span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {player.quests_completed} misiones
              </span>
            </div>

            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  Nivel {level}
                </span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {player.total_xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-terracotta))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Tracks */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(TRACK_CONFIG) as XpTrack[]).map(track => {
            const config = TRACK_CONFIG[track];
            const Icon = config.icon;
            const xp = track === 'cultura' ? player.xp_cultura
              : track === 'comunidad' ? player.xp_comunidad
              : player.xp_juego;
            const trackLevel = calculateLevel(xp);

            return (
              <motion.div
                key={track}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                  <span className="text-[10px] font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                </div>
                <p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: config.color }}>
                  {xp.toLocaleString()}
                </p>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">
                  Nivel {trackLevel}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Flame, label: 'Combos', value: player.combos_total, color: 'text-orange-400' },
            { icon: Calendar, label: 'Racha', value: `${player.streak_days}d`, color: 'text-emerald-400' },
            { icon: Trophy, label: 'Badges', value: earnedBadges.length, color: 'text-purple-400' },
            { icon: TrendingUp, label: 'Total XP', value: player.total_xp.toLocaleString(), color: 'text-[hsl(var(--rdm-amber))]' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-white/[0.02]">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xs font-bold">{stat.value}</p>
              <p className="text-[9px] text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Showcase */}
      {earnedBadges.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Insignias</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((pb) => (
              <motion.div
                key={pb.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`relative px-3 py-1.5 rounded-lg border ${RARITY_STYLES[pb.badge.rarity]}`}
                title={`${pb.badge.name} — ${RARITY_LABELS[pb.badge.rarity]}`}
              >
                <span className="text-[10px] font-medium">{pb.badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Season Progress */}
      {season && (
        <div className="px-6 pb-6">
          <div className="p-3 rounded-xl bg-[hsl(var(--rdm-amber)/0.05)] border border-[hsl(var(--rdm-amber)/0.1)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-[hsl(var(--rdm-amber))]">
                {season.name}
              </span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {new Date(season.end_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {season.global_goal && (
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-terracotta))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(season.global_goal.current / season.global_goal.target) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
