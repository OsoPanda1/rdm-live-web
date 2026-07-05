import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Identidad Federada · RDM Digital" }, { name: "description", content: "Acceso ciudadano al Sistema Operativo Territorial de Real del Monte." }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/" }); });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu correo si la confirmación está activa.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido al kernel.");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error en la autenticación");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("No se pudo iniciar Google"); return; }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <section className="container mx-auto px-6 py-16">
      <Toaster />
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] tracking-sovereign text-accent mb-2">VI · Identidad</div>
          <h1 className="font-display text-4xl text-ink">Acceso <span className="text-gradient-copper italic">federado</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Únete al pulso del kernel territorial.</p>
        </div>

        <div className="rounded-3xl border-hairline bg-card p-7 shadow-sovereign">
          <div className="flex rounded-full bg-secondary p-1 mb-6 text-xs">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-full transition-all ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                {m === "signin" ? "Acceder" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <button onClick={handleGoogle} type="button" className="w-full mb-4 rounded-full border-hairline bg-background py-3 text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.4-4.9 3.4-8.3z"/><path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7v3C3.6 20.5 7.5 23 12 23z"/><path fill="#FBBC05" d="M5.5 13.7C5.3 13 5.2 12.3 5.2 11.5s.1-1.5.3-2.2v-3H1.7C.9 7.9.5 9.6.5 11.5s.4 3.6 1.2 5.2l3.8-3z"/><path fill="#EA4335" d="M12 4.5c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1 15.1 0 12 0 7.5 0 3.6 2.5 1.7 6.3l3.8 3C6.4 6.5 9 4.5 12 4.5z"/></svg>
            Continuar con Google
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-hairline" /></div>
            <span className="relative bg-card px-3 text-[10px] font-mono tracking-sovereign text-muted-foreground">o con correo</span>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="tu@correo.mx" className="w-full rounded-full border-hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="Contraseña" className="w-full rounded-full border-hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <button disabled={loading} className="w-full rounded-full bg-foreground text-background py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50">
              {loading ? "Procesando…" : mode === "signin" ? "Entrar al kernel" : "Crear identidad federada"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
