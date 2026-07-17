import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Check, Store, User, Phone, Mail, MapPin, Clock,
  ChevronRight, ChevronLeft, CreditCard, Building2, Shield,
} from "lucide-react";
import BrumaHeader from "@/components/BrumaHeader";
import BrumaFooter from "@/components/BrumaFooter";
import FloatingParticles from "@/components/FloatingParticles";
import RealitoBubble from "@/components/RealitoBubble";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { toast } from "sonner";

const giros = [
  { value: "hoteleria", label: "Hotelería / Hospedaje", price: 500 },
  { value: "platerias", label: "Platerías", price: 400 },
  { value: "pasterias", label: "Pasterías", price: 400 },
  { value: "bares", label: "Bares", price: 350 },
  { value: "artesanias", label: "Locales de Artesanías", price: 300 },
  { value: "tiendas", label: "Tiendas / Misceláneas", price: 250 },
  { value: "camiones", label: "Recorridos Turísticos (Camiones)", price: 400 },
  { value: "cuatrimotos", label: "Cuatrimotos", price: 400 },
  { value: "caminatas", label: "Caminatas y Representaciones", price: 200 },
  { value: "gondolas", label: "Góndolas y Semifijos", price: 150 },
];

type Step = "info" | "giro" | "contacto" | "revisar"

const stepIcons: Record<Step, React.ComponentType<{ className?: string }>> = {
  info: Store,
  giro: MapPin,
  contacto: Phone,
  revisar: Shield,
}

const stepLabels: Record<Step, string> = {
  info: "Información",
  giro: "Giro",
  contacto: "Contacto",
  revisar: "Revisar",
}

const stepProgress: Record<Step, number> = {
  info: 25,
  giro: 50,
  contacto: 75,
  revisar: 100,
}

const spring = { type: "spring" as const, stiffness: 260, damping: 28 }

const RegistroComercio = () => {
  const [step, setStep] = useState<Step>("info")
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    giro: "",
    phone: "",
    email: "",
    description: "",
    address: "",
    schedule: "",
    website: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useRDMAuth();

  const selectedGiro = giros.find(g => g.value === formData.giro);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps: Step[] = ["info", "giro", "contacto", "revisar"]

  const canAdvance = () => {
    switch (step) {
      case "info": return formData.ownerName.trim() && formData.businessName.trim()
      case "giro": return !!formData.giro
      case "contacto": return !!formData.phone.trim()
      case "revisar": return true
    }
  }

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error("Completa todos los campos obligatorios antes de continuar")
      return
    }
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }

  const handleBack = () => {
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  const handleSubmit = async () => {
    if (!formData.ownerName || !formData.businessName || !formData.giro || !formData.phone) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    setSaving(true);
    const { error } = await supabaseClient.from("businesses").insert({
      owner_id: user?.id ?? null,
      owner_name: formData.ownerName,
      name: formData.businessName,
      description: formData.description,
      giro: formData.giro,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      schedule_display: formData.schedule,
      website: formData.website,
      status: "pending",
      is_active: false,
      category: (giros.find(g => g.value === formData.giro)?.label ?? "OTROS").toUpperCase().replace(/[\s/]/g, "_").slice(0, 20),
    });
    setSaving(false);
    if (error) {
      toast.error("Error al guardar: " + error.message);
      return;
    }
    setSubmitted(true);
    toast.success("Solicitud enviada. Tu registro está pendiente de aprobación.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card rounded-2xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-3xl text-gradient-gold mb-4">¡Solicitud Recibida!</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Tu registro está <span className="text-gold font-semibold">pendiente de aprobación</span>. Te contactaremos pronto al <strong>{formData.phone}</strong>.
          </p>
          {selectedGiro && (
            <div className="glass-gold rounded-xl p-4 mb-6">
              <p className="text-xs text-gold/70 uppercase tracking-wider mb-1">Plan contratado</p>
              <p className="font-display text-lg text-gradient-gold">{selectedGiro.label}</p>
              <p className="text-sm text-gold/80">${selectedGiro.price} MXN / mes</p>
            </div>
          )}
          <Link to="/comercios" className="btn-premium inline-block">Ver Directorio</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />
      <BrumaHeader />

      <section className="container mx-auto px-6 md:px-12 py-32 max-w-2xl">
        <Link to="/comercios" className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-muted-foreground hover:text-gold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-body text-xs tracking-wider uppercase">Volver al directorio</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <span className="font-body text-[10px] tracking-[0.5em] uppercase text-gold/60 block mb-4">Únete al Ecosistema</span>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-gradient-gold mb-4">
            Registra tu Comercio
          </h1>
          <p className="font-display text-lg text-platinum/60 italic mb-12">
            Forma parte de RDM Digital y conecta con miles de visitantes
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => {
              const Icon = stepIcons[s]
              const active = step === s
              const done = steps.indexOf(step) > i
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                    active
                      ? "bg-gold/15 text-gold border border-gold/20"
                      : done
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline">{stepLabels[s]}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`hidden sm:block w-8 h-[1px] ${
                      done ? "bg-green-500/40" : "bg-white/10"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              layout
              transition={spring}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
              style={{ width: `${stepProgress[step]}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Step 1: Basic info */}
            {step === "info" && (
              <div className="space-y-5">
                <div className="glass-card rounded-xl p-5">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Nombre del propietario <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                  />
                </div>

                <div className="glass-card rounded-xl p-5">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                    <Store className="w-3 h-3" /> Nombre del negocio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    placeholder="Nombre de tu establecimiento"
                    className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                  />
                </div>

                <div className="glass-card rounded-xl p-5">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Calle, número, colonia"
                    className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Giro / Business type */}
            {step === "giro" && (
              <div className="glass-card rounded-xl p-6">
                <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-4 block">
                  Selecciona el giro de tu negocio <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {giros.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => updateField("giro", g.value)}
                      className={`text-left px-4 py-4 rounded-xl font-body text-xs transition-all duration-300 ${
                        formData.giro === g.value
                          ? "glass-gold border border-gold/40 text-gold shadow-lg shadow-gold/10"
                          : "glass text-muted-foreground hover:text-foreground hover:border-white/20 border border-transparent"
                      }`}
                    >
                      <span className="block font-semibold text-sm mb-1">{g.label}</span>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium ${formData.giro === g.value ? "text-gold" : "text-muted-foreground"}`}>
                          ${g.price} MXN / mes
                        </span>
                        {formData.giro === g.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 rounded-full bg-gold flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-black" />
                          </motion.div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Contact details */}
            {step === "contacto" && (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-5">
                    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Teléfono <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="771-123-4567"
                      className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="glass-card rounded-xl p-5">
                    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Horario de atención
                  </label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => updateField("schedule", e.target.value)}
                    placeholder="Ej: Lunes a sábado 9:00 - 18:00"
                    className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                  />
                </div>

                <div className="glass-card rounded-xl p-5">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Sitio web o redes
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://"
                    className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors"
                  />
                </div>

                <div className="glass-card rounded-xl p-5">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 block">
                    Descripción breve
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Cuéntanos sobre tu negocio..."
                    rows={3}
                    className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mt-2 border-b border-border/30 pb-2 focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === "revisar" && (
              <div className="space-y-5">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-display text-lg text-gradient-gold mb-4">Resumen de tu registro</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Propietario</span>
                      <span className="text-sm text-white/80">{formData.ownerName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Negocio</span>
                      <span className="text-sm text-white/80">{formData.businessName}</span>
                    </div>
                    {formData.address && (
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Dirección</span>
                        <span className="text-sm text-white/80">{formData.address}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Giro</span>
                      <span className="text-sm text-gold">{selectedGiro?.label}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Teléfono</span>
                      <span className="text-sm text-white/80">{formData.phone}</span>
                    </div>
                    {formData.email && (
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Email</span>
                        <span className="text-sm text-white/80">{formData.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Plan</span>
                      <span className="font-display text-xl text-gradient-gold">${selectedGiro?.price} MXN<span className="text-xs text-white/40"> /mes</span></span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gold/60 shrink-0" />
                  <p className="text-xs text-white/50">
                    El pago se realizará al momento de la aprobación. Recibirás instrucciones por teléfono o email.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 gap-4">
          <div>
            {step !== "info" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="inline-flex items-center gap-2 glass rounded-xl px-5 py-3 text-sm text-white/60 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </motion.button>
            )}
          </div>

          {step !== "revisar" ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="btn-premium inline-flex items-center gap-2"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="btn-premium inline-flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Enviar solicitud
            </motion.button>
          )}
        </div>
      </section>

      <BrumaFooter />
      <RealitoBubble />
    </div>
  );
};

export default RegistroComercio;
