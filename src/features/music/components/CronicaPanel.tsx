import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  BookOpen,
  GitFork,
  Heart,
  Clock,
  ChevronDown,
  ChevronRight,
  Route,
  Music,
  TreePine,
} from "lucide-react";
import type { MusicCronica } from "../types";

const CRONICA_ICONS: Record<string, typeof Route> = {
  ruta: Route,
  memoria: BookOpen,
  ambiental: TreePine,
  mixed: Music,
};

interface CronicaPanelProps {
  cronicas: MusicCronica[];
  onPlay?: (cronica: MusicCronica) => void;
  onFork?: (cronica: MusicCronica) => void;
}

export function CronicaPanel({ cronicas, onPlay, onFork }: CronicaPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-[#00D4FF]" />
        <h3 className="text-sm font-bold text-[#0b1020]">Cronicas Sonoras</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] font-semibold">
          {cronicas.length}
        </span>
      </div>

      {cronicas.map((cronica, idx) => {
        const Icon = CRONICA_ICONS[cronica.cronica_type] || Music;
        const expanded = expandedId === cronica.id;

        return (
          <motion.div
            key={cronica.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden hover:border-[#00D4FF]/50 transition-colors"
          >
            <button
              onClick={() => setExpandedId(expanded ? null : cronica.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#050814] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#A7F300]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0b1020] truncate">{cronica.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#4B5563]">
                  <span className="capitalize">{cronica.cronica_type}</span>
                  <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                  <span>{cronica.trackCount ?? "?"} pistas</span>
                  <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                  <span>{Math.round(cronica.total_duration_ms / 60000)} min</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#9CA3AF] transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 border-t border-[#F3F4F6]">
                    <p className="text-[12px] text-[#1c2540] leading-relaxed mt-3 mb-3">
                      {cronica.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-[10px] text-[#4B5563] mb-3">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {cronica.play_count.toLocaleString()} reproducciones
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {cronica.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {cronica.fork_count} forks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(cronica.total_duration_ms / 60000)} min
                      </span>
                    </div>

                    {/* Canonical level badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-[0.15em] font-semibold ${
                          cronica.canonical_level === "historical"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : cronica.canonical_level === "artistic"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {cronica.canonical_level === "historical"
                          ? "Canonico Historico"
                          : cronica.canonical_level === "artistic"
                          ? "Canon Artistico"
                          : "Comunidad"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onPlay?.(cronica)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#050814] text-[#A7F300] text-[11px] font-semibold hover:bg-[#0b1020] transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Reproducir
                      </button>
                      <button
                        onClick={() => onFork?.(cronica)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563] text-[11px] font-semibold hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        Fork
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
