import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Brain, HelpCircle, Gift, Trophy, ArrowRight } from "lucide-react";
import MemoryGame from "@/modules/games/MemoryGame";
import TriviaGame from "@/modules/games/TriviaGame";

type GameId = "memoria" | "trivia";

const GAMES: { id: GameId; label: string; icon: typeof Brain; description: string }[] = [
  { id: "memoria", label: "Memoria Minera", icon: Brain, description: "Empareja los símbolos del territorio." },
  { id: "trivia", label: "Trivia Territorial", icon: HelpCircle, description: "Preguntas sobre historia, minas y leyendas de RDM." },
];

export default function Juegos() {
  const [active, setActive] = useState<GameId>("memoria");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Gamepad2 className="h-5 w-5 text-gold" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Motor de Juegos Territoriales</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
            Jugar <span className="text-gradient-gold">Real del Monte</span>
          </h1>
          <p className="mt-3 text-sm font-body text-muted-foreground max-w-xl">
            Explora el territorio jugando. Gana puntos canjeables por pastes, micheladas,
            joyería de plata, cenas románticas, hospedaje y tours.
          </p>
        </motion.div>

        {/* Points info bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4"
        >
          <Trophy className="h-5 w-5 text-gold shrink-0" />
          <span className="text-xs text-foreground/80">
            Completa partidas para ganar puntos canjeables en la{" "}
            <button onClick={() => navigate("/premium")} className="text-gold underline-offset-2 hover:underline font-semibold">
              Bolsa de Premios
            </button>
            . Los puntos se acreditan automáticamente al terminar cada juego.
          </span>
          <button
            onClick={() => navigate("/premium")}
            className="ml-auto flex items-center gap-1 rounded-full border border-gold/30 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gold hover:bg-gold/10"
          >
            Ver premios <ArrowRight className="h-3 w-3" />
          </button>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className={`text-left p-4 rounded-2xl border transition ${active === g.id ? "border-gold/40 bg-gold/5" : "border-border/20 hover:border-gold/30"}`}
            >
              <g.icon className={`h-5 w-5 ${active === g.id ? "text-gold" : "text-muted-foreground"}`} />
              <p className="mt-2 text-sm font-display font-semibold">{g.label}</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">{g.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {active === "memoria" && <MemoryGame />}
          {active === "trivia" && <TriviaGame />}
        </div>
      </div>
    </div>
  );
}
