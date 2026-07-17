import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "operador" | "lector";

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancel) return;
      setUserId(user?.id ?? null);
      if (!user) { setRoles([]); setLoading(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (cancel) return;
      setRoles(((data ?? []).map((r) => r.role)) as AppRole[]);
      setLoading(false);
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => { cancel = true; subscription.unsubscribe(); };
  }, []);

  const has = (r: AppRole) => roles.includes(r);
  return { roles, userId, loading, isAdmin: has("admin"), isOperador: has("operador"), isLector: has("lector"), has };
}

export async function logAudit(action: string, resource: string, detail?: unknown) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action, resource,
      detail: (detail ?? null) as never,
    });
  } catch { /* swallow */ }
}
