// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = { color?: string };

export default function HealthSparkline({ color = "#D4AF37" }: Props) {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const { data } = await supabase
        .from("federation_health_log")
        .select("integrity, recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(30);
      if (cancel) return;
      const vals = (data ?? []).map((r) => Number(r.integrity)).reverse();
      setPoints(vals);
    };
    load();
    const id = setInterval(load, 15000);
    return () => { cancel = true; clearInterval(id); };
  }, []);

  if (points.length < 2) {
    return <div className="h-12 flex items-center text-[10px] font-mono text-muted-foreground/60">acumulando lecturas…</div>;
  }
  const w = 200, h = 48, pad = 4;
  const max = 1, min = 0;
  const step = (w - pad * 2) / (points.length - 1);
  const d = points.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const last = points[points.length - 1];

  return (
    <div className="flex items-center gap-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="flex-1 h-12">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#spark-fill)" />
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
      <span className="text-sm font-display font-bold" style={{ color }}>{last.toFixed(2)}</span>
    </div>
  );
}