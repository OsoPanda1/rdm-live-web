// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Trophy, Timer, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SYMBOLS = ["⛰️", "⛏️", "🥟", "☕", "🕯️", "✝️", "🌫️", "🪙"];

type Card = { sym: string; flipped: boolean; matched: boolean };

function buildDeck(): Card[] {
  const deck = [...SYMBOLS, ...SYMBOLS].map((sym) => ({ sym, flipped: false, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryGame() {
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    setMoves((m) => m + 1);
    if (deck[a].sym === deck[b].sym) {
      setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
      setFlipped([]);
    } else {
      setTimeout(() => {
        setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
        setFlipped([]);
      }, 800);
    }
  }, [flipped, deck]);

  useEffect(() => {
    if (deck.every((c) => c.matched) && !pointsAwarded) {
      setDone(true);
      awardPoints();
    }
  }, [deck, pointsAwarded]);

  const awardPoints = async () => {
    try {
      const { error } = await supabase.functions.invoke("award-points", {
        body: { action: "memory_game_complete", metadata: { score, moves, seconds } },
      });
      if (!error) {
        setPointsAwarded(true);
        toast.success(`+${score} puntos por completar Memoria Minera`);
      }
    } catch {
      // Silently fail — points are a bonus
    }
  };

  const click = (i: number) => {
    if (flipped.length >= 2 || deck[i].flipped || deck[i].matched) return;
    setDeck((d) => d.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setFlipped((f) => [...f, i]);
  };

  const reset = () => { setDeck(buildDeck()); setFlipped([]); setMoves(0); setSeconds(0); setDone(false); setPointsAwarded(false); };
  const score = useMemo(() => Math.max(0, 1000 - moves * 20 - seconds * 5), [moves, seconds]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-border/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1 text-electric"><Timer className="h-3 w-3" />{seconds}s</span>
          <span className="text-muted-foreground">Movs: {moves}</span>
          {done && (
            <span className="flex items-center gap-2 text-gold">
              <Trophy className="h-3 w-3" />Score {score}
              {pointsAwarded && <Sparkles className="h-3 w-3 text-emerald" />}
            </span>
          )}
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-body glass hover:text-gold transition">
          <RotateCcw className="h-3 w-3" /> Reiniciar
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {deck.map((c, i) => (
          <motion.button
            key={i}
            onClick={() => click(i)}
            whileHover={{ scale: c.matched ? 1 : 1.04 }}
            className={`aspect-square rounded-xl flex items-center justify-center text-2xl font-display transition ${
              c.matched ? "bg-emerald-500/20 border border-emerald-500/40" :
              c.flipped ? "bg-gold/20 border border-gold/40" :
              "bg-secondary/30 border border-border/20 hover:border-gold/30"
            }`}
          >
            {(c.flipped || c.matched) ? c.sym : ""}
          </motion.button>
        ))}
      </div>
    </div>
  );
}