import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Trophy, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Q { id: string; question: string; options: string[]; correct_index: number; category: string; explanation?: string | null; }

export default function TriviaGame() {
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["trivia_questions"],
    queryFn: async (): Promise<Q[]> => {
      const { data } = await supabase.from("trivia_questions").select("*").eq("is_active", true).limit(20);
      return (data ?? []) as Q[];
    },
  });

  const shuffled = useMemo(() => [...questions].sort(() => Math.random() - 0.5).slice(0, 8), [questions]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => { setIdx(0); setPicked(null); setScore(0); setDone(false); }, [shuffled.length]);

  if (isLoading) return <div className="glass-card rounded-2xl p-6 border border-border/20 text-center text-muted-foreground text-sm">Cargando trivia…</div>;
  if (shuffled.length === 0) return <div className="glass-card rounded-2xl p-6 border border-border/20 text-center text-muted-foreground text-sm">No hay preguntas disponibles.</div>;

  const q = shuffled[idx];
  if (!q) return null;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct_index) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= shuffled.length) setDone(true);
      else { setIdx(idx + 1); setPicked(null); }
    }, 1400);
  };

  const reset = () => { setIdx(0); setPicked(null); setScore(0); setDone(false); };

  return (
    <div className="glass-card rounded-2xl p-6 border border-border/20">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Pregunta {Math.min(idx + 1, shuffled.length)}/{shuffled.length}</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-gold flex items-center gap-1"><Trophy className="h-3 w-3" />{score}</span>
          <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-gold flex items-center gap-1"><RotateCcw className="h-3 w-3" />Reiniciar</button>
        </div>
      </div>

      {done ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <Trophy className="h-12 w-12 text-gold mx-auto mb-3" />
          <p className="text-3xl font-display font-bold">Score: {score}/{shuffled.length}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {score === shuffled.length ? "¡Maestro del territorio!" : score >= shuffled.length / 2 ? "Buen conocimiento territorial." : "Sigue explorando RDM."}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gold mb-2">{q.category}</p>
            <h3 className="text-xl font-display font-semibold mb-5">{q.question}</h3>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const correct = picked !== null && i === q.correct_index;
                const wrong = picked === i && i !== q.correct_index;
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    className={`w-full text-left rounded-xl p-3 border transition flex items-center justify-between ${
                      correct ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" :
                      wrong ? "bg-red-500/15 border-red-500/40 text-red-300" :
                      "bg-secondary/20 border-border/20 hover:border-gold/30"
                    }`}
                  >
                    <span className="text-sm font-body">{opt}</span>
                    {correct && <Check className="h-4 w-4" />}
                    {wrong && <X className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && q.explanation && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[11px] font-mono text-muted-foreground italic">
                {q.explanation}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
