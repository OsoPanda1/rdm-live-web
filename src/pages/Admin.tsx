import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, Activity, ScrollText, Save, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, logAudit, type AppRole } from "@/hooks/useUserRole";
import { MusicAdminPanel } from "@/components/admin/MusicAdminPanel";

type Threshold = { id: string; federation_key: string; federation_name: string; max_latency_ms: number; min_integrity: number; max_offline: number; };
type RoleRow = { id: string; user_id: string; role: AppRole; created_at: string };
type AuditRow = { id: string; actor_email: string | null; action: string; resource: string; detail: unknown; created_at: string };

export default function Admin() {
  const { isAdmin, loading, userId } = useUserRole();
  const [bootstrapNeeded, setBootstrapNeeded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      if ((count ?? 0) === 0) setBootstrapNeeded(true);
    })();
  }, [userId]);

  const bootstrap = async () => {
    if (!userId) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) { toast.error(error.message); return; }
    await logAudit("role.bootstrap", "user_roles", { user_id: userId });
    toast.success("Eres administrador. Recarga la página.");
    setTimeout(() => location.reload(), 800);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs font-mono">Cargando…</div>;
  if (!userId) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-28 px-6 max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl border border-gold/20 p-8 text-center">
          <Shield className="h-10 w-10 text-gold mx-auto mb-3" />
          <h1 className="text-2xl font-display font-bold mb-2">Panel de Administración</h1>
          {bootstrapNeeded ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">No hay administradores. Asume el rol fundador.</p>
              <button onClick={bootstrap} className="inline-flex items-center gap-2 rounded-xl gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
                <UserPlus className="h-4 w-4" /> Convertirme en Admin
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Tu cuenta no tiene permisos administrativos.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/80">Consola Soberana</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Panel de <span className="text-gradient-gold">Administración</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Gestión de las 7 federaciones, roles, auditoría y catálogo musical.</p>
        </motion.div>

        <ThresholdsSection />
        <RolesSection />
        <MusicAdminPanel />
        <AuditSection />
      </div>
    </div>
  );
}

function ThresholdsSection() {
  const [rows, setRows] = useState<Threshold[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("federation_thresholds").select("*").order("federation_key");
    setRows((data ?? []) as Threshold[]);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, k: keyof Threshold, v: number) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, [k]: v } : r));
  const save = async (r: Threshold) => {
    setSaving(r.id);
    const { error } = await supabase.from("federation_thresholds").update({
      max_latency_ms: r.max_latency_ms, min_integrity: r.min_integrity, max_offline: r.max_offline,
    }).eq("id", r.id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    await logAudit("threshold.update", "federation_thresholds", r);
    toast.success(`${r.federation_name} actualizado`);
  };

  return (
    <section className="glass-card rounded-2xl border border-border/20 p-6">
      <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-4"><Activity className="h-4 w-4 text-electric" /> Umbrales de las 7 Federaciones</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/20">
            <tr><th className="text-left py-2">Federación</th><th>Latencia máx (ms)</th><th>Integridad mín</th><th>Offline máx</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/10">
                <td className="py-2 font-display">{r.federation_name}</td>
                <td><input type="number" value={r.max_latency_ms} onChange={(e) => update(r.id, "max_latency_ms", Number(e.target.value))} className="w-24 rounded bg-background/60 border border-border/30 px-2 py-1 text-center" /></td>
                <td><input type="number" step="0.05" value={r.min_integrity} onChange={(e) => update(r.id, "min_integrity", Number(e.target.value))} className="w-24 rounded bg-background/60 border border-border/30 px-2 py-1 text-center" /></td>
                <td><input type="number" value={r.max_offline} onChange={(e) => update(r.id, "max_offline", Number(e.target.value))} className="w-20 rounded bg-background/60 border border-border/30 px-2 py-1 text-center" /></td>
                <td className="text-right">
                  <button onClick={() => save(r)} disabled={saving === r.id} className="inline-flex items-center gap-1 rounded-lg gradient-gold px-3 py-1.5 text-[10px] font-semibold text-primary-foreground shadow-gold disabled:opacity-50">
                    {saving === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RolesSection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("operador");
  const [rows, setRows] = useState<RoleRow[]>([]);

  const load = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false }).limit(50);
    setRows((data ?? []) as RoleRow[]);
  };
  useEffect(() => { load(); }, []);

  const assign = async () => {
    if (!email.trim()) return;
    // Look up profile by email pattern (display_name fallback)
    const { data: prof } = await supabase.from("profiles").select("user_id, display_name").ilike("display_name", email.trim()).limit(1);
    const uid = prof?.[0]?.user_id;
    if (!uid) { toast.error("Usuario no encontrado por display_name. Pídeles que se registren y usa el ID."); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) { toast.error(error.message); return; }
    await logAudit("role.assign", "user_roles", { user_id: uid, role });
    toast.success("Rol asignado");
    setEmail(""); load();
  };

  const revoke = async (r: RoleRow) => {
    await supabase.from("user_roles").delete().eq("id", r.id);
    await logAudit("role.revoke", "user_roles", r);
    load();
  };

  return (
    <section className="glass-card rounded-2xl border border-border/20 p-6">
      <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-teal" /> Roles & Permisos</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="display_name del usuario" className="flex-1 rounded-xl bg-background/60 border border-border/30 px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value as AppRole)} className="rounded-xl bg-background/60 border border-border/30 px-3 py-2 text-sm">
          <option value="admin">admin</option><option value="operador">operador</option><option value="lector">lector</option>
        </select>
        <button onClick={assign} className="rounded-xl gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold">Asignar</button>
      </div>
      <ul className="divide-y divide-border/20">
        {rows.map((r) => (
          <li key={r.id} className="py-2 flex items-center justify-between text-xs font-mono">
            <span>{r.user_id.slice(0, 8)}… · <span className="text-gold">{r.role}</span></span>
            <button onClick={() => revoke(r)} className="text-red-400 hover:underline">revocar</button>
          </li>
        ))}
        {!rows.length && <p className="text-xs text-muted-foreground py-2">Sin roles asignados.</p>}
      </ul>
    </section>
  );
}

function AuditSection() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(50);
      setRows((data ?? []) as AuditRow[]);
    })();
  }, []);
  return (
    <section className="glass-card rounded-2xl border border-border/20 p-6">
      <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-4"><ScrollText className="h-4 w-4 text-amber-400" /> Auditoría reciente</h2>
      <ul className="space-y-1.5 max-h-96 overflow-y-auto">
        {rows.map((r) => (
          <li key={r.id} className="text-[11px] font-mono flex items-center justify-between border-b border-border/10 pb-1">
            <span><span className="text-gold">{r.action}</span> <span className="text-muted-foreground">· {r.resource}</span></span>
            <span className="text-muted-foreground">{r.actor_email ?? "—"} · {new Date(r.created_at).toLocaleString("es-MX")}</span>
          </li>
        ))}
        {!rows.length && <p className="text-xs text-muted-foreground">Sin eventos aún.</p>}
      </ul>
    </section>
  );
}
