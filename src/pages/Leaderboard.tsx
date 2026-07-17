import { RDMLayout } from "@/components/rdm/RDMLayout";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Row { id: string; display_name: string; avatar_url: string | null; total_points: number; level: number; location: string | null; }

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles_public")
        .select("id, display_name, avatar_url, total_points, level, location")
        .order("total_points", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const podiumIcon = (idx: number) => {
    if (idx === 0) return <Crown className="h-5 w-5 text-[hsl(var(--rdm-amber))]" />;
    if (idx === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (idx === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-mono text-muted-foreground w-5 text-center">{idx + 1}</span>;
  };

  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 pt-24 pb-16 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <Trophy className="h-12 w-12 mx-auto text-[hsl(var(--rdm-amber))] mb-3" />
            <h1 className="text-4xl font-bold">Tabla de Honor</h1>
            <p className="text-muted-foreground mt-2">Los exploradores más activos de Real del Monte</p>
          </motion.div>

          <Card>
            <CardHeader><CardTitle>Top 50</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-center text-muted-foreground">Cargando...</p>
              ) : rows.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">Aún nadie en el ranking. ¡Sé el primero!</p>
              ) : (
                <ul className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <motion.li key={r.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className={`flex items-center gap-3 p-4 hover:bg-muted/30 ${i < 3 ? "bg-[hsl(var(--rdm-amber)/0.05)]" : ""}`}>
                      <div className="w-6 flex justify-center">{podiumIcon(i)}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={r.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">{r.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{r.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.location ?? "Pueblo Mágico"} · Nivel {r.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[hsl(var(--rdm-amber))]">{r.total_points}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">puntos</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RDMLayout>
  );
}
