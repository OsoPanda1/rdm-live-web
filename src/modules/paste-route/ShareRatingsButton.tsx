import { useState } from "react";
import { Share2, Download, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Rating = { id: string; poi_id: string; score: number; review: string | null; created_at: string };
type Poi = { id: string; name: string };

export function ShareRatingsButton({ pois }: { pois: Poi[] }) {
  const [loading, setLoading] = useState(false);

  const fetchMine = async (): Promise<{ user: { id: string; email?: string } | null; ratings: Rating[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, ratings: [] };
    const { data } = await supabase.from("paste_ratings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return { user: { id: user.id, email: user.email ?? undefined }, ratings: (data ?? []) as Rating[] };
  };

  const exportPdf = async () => {
    setLoading(true);
    try {
      const { user, ratings } = await fetchMine();
      if (!user) { toast.error("Inicia sesión para exportar"); return; }
      if (!ratings.length) { toast.error("Aún no tienes valoraciones"); return; }
      const poiMap = Object.fromEntries(pois.map((p) => [p.id, p.name]));
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Mis valoraciones · Ruta del Paste</title>
        <style>
          body{font-family:Georgia,serif;color:#1a1a1a;max-width:760px;margin:40px auto;padding:0 24px}
          h1{color:#b8860b;font-size:28px;border-bottom:2px solid #b8860b;padding-bottom:8px}
          .meta{color:#666;font-size:12px;margin-bottom:24px}
          .item{border:1px solid #ddd;border-radius:8px;padding:14px;margin-bottom:10px}
          .name{font-weight:bold;color:#222}
          .stars{color:#b8860b;font-size:18px}
          .date{color:#888;font-size:11px;float:right}
          footer{margin-top:40px;text-align:center;color:#999;font-size:11px;font-style:italic}
        </style></head><body>
        <h1>Mis valoraciones · Ruta del Paste</h1>
        <p class="meta">Real del Monte, Hidalgo · ${user.email ?? "Usuario"} · ${new Date().toLocaleString("es-MX")}</p>
        ${ratings.map((r) => `
          <div class="item">
            <span class="date">${new Date(r.created_at).toLocaleDateString("es-MX")}</span>
            <div class="name">${poiMap[r.poi_id] ?? "POI"}</div>
            <div class="stars">${"★".repeat(r.score)}${"☆".repeat(5 - r.score)}</div>
            ${r.review ? `<p>${r.review}</p>` : ""}
          </div>`).join("")}
        <footer>Orgullosamente Realmontenses · Proyecto dedicado a Reyna Trejo Serrano</footer>
        </body></html>`;
      const w = window.open("", "_blank");
      if (!w) { toast.error("Permite popups para exportar"); return; }
      w.document.write(html); w.document.close();
      setTimeout(() => w.print(), 400);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Error al exportar"); }
    finally { setLoading(false); }
  };

  const sharePublic = async () => {
    setLoading(true);
    try {
      const { user, ratings } = await fetchMine();
      if (!user) { toast.error("Inicia sesión"); return; }
      if (!ratings.length) { toast.error("Sin valoraciones para compartir"); return; }
      const avg = (ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1);
      const text = `Califiqué ${ratings.length} pastes en la Ruta del Paste de Real del Monte · promedio ${avg}★ 🥟⛏️`;
      const url = `${location.origin}/ruta-del-paste`;
      if (navigator.share) {
        await navigator.share({ title: "Mis valoraciones · RDM", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} → ${url}`);
        toast.success("Enlace copiado");
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Error al compartir"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={exportPdf} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-gold/40 text-gold px-3 py-2 text-xs font-mono hover:bg-gold/10 disabled:opacity-50">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Exportar PDF
      </button>
      <button onClick={sharePublic} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-electric/40 text-electric px-3 py-2 text-xs font-mono hover:bg-electric/10 disabled:opacity-50">
        <Share2 className="h-3.5 w-3.5" /> Compartir
      </button>
      <button onClick={async () => { await navigator.clipboard.writeText(`${location.origin}/ruta-del-paste`); toast.success("Link copiado"); }}
        className="inline-flex items-center gap-2 rounded-xl border border-border/30 text-muted-foreground px-3 py-2 text-xs font-mono hover:text-foreground">
        <Link2 className="h-3.5 w-3.5" /> Copiar ruta
      </button>
    </div>
  );
}
