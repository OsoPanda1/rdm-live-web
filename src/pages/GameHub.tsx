import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2, Trophy, Target, Star, Users, Flame,
  ChevronRight, Shield, Zap, MapPin, Compass
} from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { QuestPanel } from "@/features/gamification/components/QuestPanel";
import { Leaderboard } from "@/features/gamification/components/Leaderboard";
import { PlayerProfile } from "@/features/gamification/components/PlayerProfile";
import { ScrollReveal, CinematicBanner, FloatingParticles } from "@/components/rdm/ScrollReveal";

const QUICK_QUESTS = [
  { icon: MapPin, label: "Explorar Mapa", desc: "Visita el mapa interactivo", to: "/mapa", xp: 50, color: "hsl(43, 80%, 55%)" },
  { icon: Compass, label: "Ruta Minera", desc: "Completa la ruta historica", to: "/rutas", xp: 150, color: "hsl(15, 65%, 50%)" },
  { icon: Shield, label: "Panteon Ingles", desc: "Descubre la leyenda", to: "/historia", xp: 200, color: "hsl(270, 40%, 50%)" },
  { icon: Flame, label: "Festival del Paste", desc: "Vota por tu paste favorito", to: "/gastronomia", xp: 100, color: "hsl(25, 80%, 50%)" },
];

const GAME_FEATURES = [
  {
    icon: Gamepad2,
    title: "RDM Match",
    description: "Puzzle match-3 con piezas de Real del Monte: pastes, minas, capillas y calles.",
    status: "Proximamente",
    color: "hsl(210, 100%, 55%)",
  },
  {
    icon: Target,
    title: "Misiones Narrativas",
    description: "Misiones que conectan el juego con el Hub:explora, descubre y gana.",
    status: "Activo",
    color: "hsl(43, 80%, 55%)",
  },
  {
    icon: Trophy,
    title: "Temporadas",
    description: "Campanas tematicas con metas globales y recompensas exclusivas.",
    status: "Activo",
    color: "hsl(152, 60%, 45%)",
  },
  {
    icon: Users,
    title: "Comunidad",
    description: "Leaderboards, insignias y roles federados dentro del LTOS.",
    status: "Activo",
    color: "hsl(15, 65%, 50%)",
  },
];

export default function GameHubPage() {
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard' | 'profile'>('quests');

  return (
    <RDMLayout>
      <SEOMeta
        title="Game Hub — Metajuego Territorial RDM Digital"
        description="Gamificacion federada integrada al LTOS. Misiones, insignias, leaderboard y roles territoriales."
      />

      {/* Hero Banner */}
      <CinematicBanner
        image="/images/rdm-aerial-pueblo.jpg"
        alt="Game Hub RDM"
        height="50vh"
        className="mt-0"
      >
        <FloatingParticles count={5} />
        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--rdm-amber)/0.15)] backdrop-blur-sm border border-[hsl(var(--rdm-amber)/0.3)] mb-4"
          >
            <Gamepad2 className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
            <span className="text-xs font-medium text-[hsl(var(--rdm-amber))]">Metajuego Territorial</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Game <span className="text-gradient-gold">Hub</span> RDM
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-white/70 max-w-xl"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Mas que un juego: un motor de participacion territorial que conecta identidad, economia y cultura.
          </motion.p>
        </div>
      </CinematicBanner>

      {/* Game Features Grid */}
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>
                Arquitectura del Juego
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Tres capas de <span className="text-[hsl(var(--rdm-amber))]">experiencia</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAME_FEATURES.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 100}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rdm-glass rounded-2xl p-5 rdm-glow-border h-full"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                    style={{
                      background: feature.status === 'Activo' ? 'hsl(152, 60%, 45% / 0.15)' : 'hsl(43, 80%, 55% / 0.15)',
                      color: feature.status === 'Activo' ? 'hsl(152, 60%, 45%)' : 'hsl(43, 80%, 55%)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{
                      background: feature.status === 'Activo' ? 'hsl(152, 60%, 45%)' : 'hsl(43, 80%, 55%)',
                    }} />
                    {feature.status}
                  </span>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Quests */}
      <section className="py-12 px-6 md:px-16 lg:px-24 rdm-section-amber">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Misiones Rapidas
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_QUESTS.map((quest, i) => (
              <ScrollReveal key={quest.label} delay={i * 80}>
                <motion.a
                  href={quest.to}
                  whileHover={{ y: -3 }}
                  className="block rdm-glass rounded-xl p-4 rdm-card-lift group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${quest.color}15` }}
                    >
                      <quest.icon className="w-5 h-5" style={{ color: quest.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                        {quest.label}
                      </h3>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{quest.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[hsl(var(--rdm-amber))]" />
                      <span className="text-[10px] font-medium text-[hsl(var(--rdm-amber))]">+{quest.xp} XP</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground)/0.3)] group-hover:text-[hsl(var(--rdm-amber))] transition-colors" />
                  </div>
                </motion.a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Quests / Leaderboard / Profile */}
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 justify-center">
            {[
              { key: 'quests' as const, label: 'Misiones', icon: Target },
              { key: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
              { key: 'profile' as const, label: 'Mi Perfil', icon: User },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[hsl(var(--rdm-amber))] text-[hsl(var(--navy-dark))]'
                    : 'bg-white/5 text-[hsl(var(--muted-foreground))] hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === 'quests' && <QuestPanel />}
              {activeTab === 'leaderboard' && <Leaderboard showSeason />}
              {activeTab === 'profile' && <PlayerProfile />}
            </div>
            <div className="hidden lg:block">
              {activeTab !== 'leaderboard' && <Leaderboard compact />}
              {activeTab !== 'profile' && <div className="mt-6"><PlayerProfile /></div>}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center rdm-section-dark">
        <ScrollReveal>
          <Gamepad2 className="w-10 h-10 mx-auto text-[hsl(var(--rdm-amber))] mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Tu impacto <span className="text-gradient-gold">va mas alla</span> del juego
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-lg mx-auto mb-8" style={{ fontFamily: "var(--font-body)" }}>
            Cada accion en el juego se convierte en un evento de vida del territorio.
            Tu XP se traduce en reputacion comunitaria, acceso a roles federados y experiencias reales.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/mapa"
              className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-[hsl(var(--navy-dark))] px-8 py-3 rounded-full font-semibold text-sm rdm-btn-shimmer rdm-magnetic"
            >
              <MapPin className="w-4 h-4" /> Explorar Mapa
            </a>
            <a
              href="/comunidad"
              className="inline-flex items-center gap-3 border-2 border-[hsl(var(--rdm-amber)/0.3)] text-[hsl(var(--rdm-amber))] px-8 py-3 rounded-full font-semibold text-sm hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors rdm-magnetic"
            >
              <Users className="w-4 h-4" /> Comunidad
            </a>
          </div>
        </ScrollReveal>
      </section>
    </RDMLayout>
  );
}
