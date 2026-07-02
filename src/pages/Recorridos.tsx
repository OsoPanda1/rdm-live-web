// @ts-nocheck
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Clock, Users, CheckCircle2, Calendar, MapPin, Star, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export default function Recorridos() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [bookingPkg, setBookingPkg] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [persons, setPersons] = useState(2);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const { data: packages } = useQuery({
    queryKey: ["tour-packages"],
    queryFn: async () => {
      const { data } = await supabase.from("tour_packages").select("*").eq("is_active", true).order("price");
      return data || [];
    },
  });

  const { data: guides } = useQuery({
    queryKey: ["tour-guides"],
    queryFn: async () => {
      const { data } = await supabase.from("tour_guides").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const handleBook = async () => {
    if (!user) { toast.error("Inicia sesión para reservar"); navigate("/auth"); return; }
    if (!bookingPkg || !bookingDate || !contactName) { toast.error("Completa todos los campos"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("tour_bookings").insert({
      user_id: user.id,
      package_id: bookingPkg.id,
      persons,
      total_paid: Number(bookingPkg.price) * persons,
      status: "pendiente" as const,
      contact_name: contactName,
      contact_phone: contactPhone,
      notes: `Fecha solicitada: ${bookingDate} ${bookingTime}`,
    });
    setSubmitting(false);
    if (error) { toast.error("No se pudo crear la reserva"); return; }
    toast.success("¡Reserva creada! Te contactaremos para confirmar.");
    setBookingPkg(null);
    setContactName(""); setContactPhone(""); setBookingDate("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-12 px-6 lg:px-12">
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(150 60% 45% / 0.08), transparent 70%)" }} />
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15">
                <Compass className="h-5 w-5 text-teal" />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-teal/80">Experiencias Guiadas Oficiales</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
              Recorridos <span className="text-gradient-gold">Guiados</span>
            </h1>
            <p className="mt-3 text-sm font-body text-muted-foreground max-w-xl">
              Reserva tu día y hora con guías certificados. Disponibilidad sujeta a personal autorizado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-3">
          {(packages || []).map((p: any, i: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl glass-card border border-border/20 transition-shadow hover:shadow-elevated flex flex-col"
            >
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gold/10 via-secondary/30 to-teal/10 flex items-center justify-center">
                <Compass className="h-20 w-20 text-gold/30" />
                <div className="absolute top-3 right-3 rounded-full glass-gold px-3 py-1.5">
                  <span className="text-[11px] font-mono font-bold text-gold">${Number(p.price).toLocaleString()} MXN</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-display font-bold">{p.title}</h3>
                <p className="mt-2 text-[12px] font-body text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.duration_min} min</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Máx {p.max_capacity}</span>
                  <span className="flex items-center gap-1 text-teal">{p.difficulty}</span>
                </div>
                {p.includes?.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {p.includes.map((inc: string) => (
                      <li key={inc} className="flex items-start gap-2 text-[11px] font-body text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-teal shrink-0 mt-0.5" />{inc}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setBookingPkg(p)}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl gradient-gold px-4 py-2.5 text-sm font-body font-semibold text-primary-foreground shadow-gold hover:shadow-elevated transition-all"
                >
                  <Calendar className="h-4 w-4" />Reservar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-display font-bold mb-2">Nuestros guías certificados</h2>
          <p className="text-sm font-body text-muted-foreground mb-8">Profesionales locales avalados por la federación turística de Real del Monte.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(guides || []).map((g: any) => (
              <div key={g.id} className="rounded-2xl glass p-5 border border-border/20 flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold/30 to-teal/20 flex items-center justify-center text-2xl shrink-0">
                  👤
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold">{g.name}</p>
                  <p className="text-[11px] font-body text-muted-foreground mt-1 line-clamp-2">{g.bio}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-gold"><Star className="h-2.5 w-2.5 fill-gold" />{g.rating}</span>
                    <span className="text-muted-foreground">{g.languages?.join(" · ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking modal */}
      {bookingPkg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setBookingPkg(null)}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card rounded-3xl border border-border/30 p-7 relative"
          >
            <button onClick={() => setBookingPkg(null)} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-secondary/40 text-muted-foreground hover:text-gold">
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gold/80">Reservar recorrido</p>
            <h3 className="text-2xl font-display font-bold mt-1">{bookingPkg.title}</h3>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">${Number(bookingPkg.price).toLocaleString()} MXN por persona</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tu nombre</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={100}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl glass text-sm outline-none focus:border-gold/40" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Teléfono</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} maxLength={20}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl glass text-sm outline-none focus:border-gold/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fecha</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl glass text-sm outline-none focus:border-gold/40" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Hora</label>
                  <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl glass text-sm outline-none focus:border-gold/40" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Personas</label>
                <input type="number" min={1} max={bookingPkg.max_capacity} value={persons} onChange={(e) => setPersons(Number(e.target.value))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl glass text-sm outline-none focus:border-gold/40" />
              </div>
              <div className="rounded-xl bg-secondary/20 p-4 flex justify-between items-center">
                <span className="text-[12px] font-mono text-muted-foreground">Total estimado</span>
                <span className="text-xl font-display font-bold text-gradient-gold">${(Number(bookingPkg.price) * persons).toLocaleString()} MXN</span>
              </div>
              <button
                onClick={handleBook}
                disabled={submitting}
                className="w-full rounded-xl gradient-gold px-4 py-3 text-sm font-body font-semibold text-primary-foreground shadow-gold disabled:opacity-50"
              >
                {submitting ? "Procesando..." : "Confirmar reserva"}
              </button>
              <p className="text-[10px] font-mono text-muted-foreground text-center">
                Tu reserva quedará en estado pendiente. Te contactaremos en máx. 24h para confirmar disponibilidad.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}