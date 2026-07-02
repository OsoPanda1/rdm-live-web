// @ts-nocheck
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Store, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const sectors = [
  "Hospedaje",
  "Gastronomía",
  "Pastería",
  "Bar",
  "Platería",
  "Artesanía",
  "Tour / Experiencia",
  "Otro",
];

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(120),
  sector: z.string().min(1, "Elige un sector"),
  description: z.string().trim().max(500).optional(),
  contact_phone: z.string().trim().max(40).optional(),
  contact_email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
});

export default function RegistrarComercio() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [plan, setPlan] = useState<"mensual" | "trimestral">("mensual");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sector: "",
    description: "",
    contact_phone: "",
    contact_email: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authReady && !user) navigate("/auth");
    if (user && !form.contact_email) {
      setForm((f) => ({ ...f, contact_email: user.email ?? "" }));
    }
  }, [authReady, user, navigate]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      const { data: created, error } = await supabase
        .from("businesses")
        .insert({
          name: parsed.data.name,
          sector: parsed.data.sector,
          description: parsed.data.description || null,
          contact_phone: parsed.data.contact_phone || null,
          contact_email: parsed.data.contact_email || null,
          owner_id: user.id,
          is_active: true,
          is_subscribed: false,
        } as any)
        .select("id")
        .single();
      if (error || !created) throw error || new Error("No se creó el comercio");

      const { data: checkout, error: cErr } = await supabase.functions.invoke(
        "create-commerce-checkout",
        { body: { business_id: created.id, plan } },
      );
      if (cErr) throw cErr;
      if (checkout?.url) {
        window.location.href = checkout.url;
        return;
      }
      toast.error("No se generó el enlace de pago");
    } catch (err: any) {
      toast.error(err?.message || "Error al registrar el comercio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 mb-5">
            <Store className="h-3.5 w-3.5 text-teal" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-teal">
              Alta de comercio · Federación oficial
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Registra tu negocio en <span className="text-gradient-gold">RDM Digital</span>
          </h1>
          <p className="mt-3 text-sm font-body text-muted-foreground max-w-xl mx-auto">
            Visibilidad en el mapa oficial, recomendaciones por Realito AI y participación
            en la economía Veta Soberana. Activación inmediata tras el pago.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl glass-card border border-border/20 p-7 space-y-5"
        >
          <Field label="Nombre del comercio *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={120}
              placeholder="Pastería La Inglesa"
              className="form-input"
            />
          </Field>

          <Field label="Sector *">
            <select
              required
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="form-input"
            >
              <option value="">Selecciona…</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
              rows={4}
              placeholder="Qué ofrece tu comercio, horarios, qué te hace único…"
              className="form-input resize-none"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Teléfono de contacto">
              <input
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                maxLength={40}
                placeholder="771 000 0000"
                className="form-input"
              />
            </Field>
            <Field label="Email de contacto">
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                maxLength={255}
                placeholder="hola@micomercio.mx"
                className="form-input"
              />
            </Field>
          </div>

          {/* Planes */}
          <div className="pt-2">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Elige tu plan
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <PlanCard
                active={plan === "mensual"}
                onClick={() => setPlan("mensual")}
                title="Mensual"
                price="$499"
                period="MXN / mes"
                hint="Visibilidad + recompensas"
              />
              <PlanCard
                active={plan === "trimestral"}
                onClick={() => setPlan("trimestral")}
                title="Trimestral"
                price="$1,299"
                period="MXN / 3 meses"
                hint="Ahorra 15% + perfil destacado"
                highlighted
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
            Pago seguro vía Stripe · Cancela cuando quieras
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl gradient-gold px-6 py-4 text-sm font-body font-semibold text-primary-foreground shadow-gold hover:shadow-elevated transition-all disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? "Procesando…" : "Registrar y continuar al pago"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.form>
      </div>
      <style>{`
        .form-input {
          width: 100%;
          background: hsl(var(--background) / 0.6);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-family: var(--font-body, inherit);
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: hsl(var(--gold) / 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function PlanCard({
  active,
  onClick,
  title,
  price,
  period,
  hint,
  highlighted,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  period: string;
  hint: string;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-5 border transition-all ${
        active
          ? "border-gold/50 bg-gold/10 shadow-gold"
          : highlighted
          ? "border-gold/25 bg-background/40 hover:border-gold/40"
          : "border-border/30 bg-background/40 hover:border-gold/30"
      }`}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <p className="text-2xl font-display font-bold text-gradient-gold mt-1">
        {price}
        <span className="text-[11px] font-mono text-muted-foreground ml-1">{period}</span>
      </p>
      <p className="text-[11px] font-body text-muted-foreground mt-1">{hint}</p>
    </button>
  );
}