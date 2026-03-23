// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Hotel, UtensilsCrossed, Wine, Gem, Coffee, ShoppingBag,
  Store, Truck, Star, Check, Sparkles, Clock, Percent,
  ArrowRight, Shield, Users, TrendingUp, MapPin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { SEOMeta } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingTier {
  id: string;
  category: string;
  icon: React.ElementType;
  price: number;
  description: string;
  color: string;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    id: "hoteles",
    category: "Hoteles y Hospedajes",
    icon: Hotel,
    price: 500,
    description: "Máxima visibilidad para tu hospedaje con reservas directas y galería premium.",
    color: "from-amber-500 to-yellow-600",
    features: [
      "Ficha completa con galería de fotos",
      "Ubicación destacada en mapa y rutas",
      "Sistema de reservas directas",
      "Reseñas verificadas de huéspedes",
      "Cupones y ofertas especiales",
      "Estadísticas de visitas mensuales",
    ],
  },
  {
    id: "bares",
    category: "Bares",
    icon: Wine,
    price: 450,
    description: "Destaca tu bar con menú digital, eventos y horarios actualizados.",
    color: "from-purple-500 to-violet-600",
    features: [
      "Ficha con menú y carta de bebidas",
      "Galería de ambiente y eventos",
      "Horarios y eventos especiales",
      "Ubicación en mapa interactivo",
      "Promociones nocturnas",
      "Reseñas de clientes",
    ],
  },
  {
    id: "restaurantes",
    category: "Pasterías y Restaurantes",
    icon: UtensilsCrossed,
    price: 400,
    description: "Tu menú y especialidades al alcance de miles de visitantes mensuales.",
    color: "from-orange-500 to-red-500",
    features: [
      "Menú digital con fotos",
      "Ubicación prioritaria en rutas gastronómicas",
      "Reseñas y calificaciones",
      "Horarios y contacto directo",
      "Cupones descuento para turistas",
      "Estadísticas de visitas",
    ],
  },
  {
    id: "platerias",
    category: "Platerías",
    icon: Gem,
    price: 400,
    description: "Muestra tu catálogo de joyería y artesanía de plata al mundo.",
    color: "from-slate-400 to-zinc-500",
    features: [
      "Catálogo de productos con fotos",
      "Ubicación en rutas de artesanías",
      "Historia y tradición del taller",
      "Contacto y pedidos directos",
      "Certificación de autenticidad",
      "Galería de piezas destacadas",
    ],
  },
  {
    id: "pasterias",
    category: "Pasterías Especializadas",
    icon: UtensilsCrossed,
    price: 350,
    description: "Destaca tus variedades de paste y atrae a los amantes de la gastronomía local.",
    color: "from-yellow-600 to-amber-600",
    features: [
      "Menú de variedades de paste",
      "Ubicación en ruta del paste",
      "Historia y receta tradicional",
      "Horarios y contacto",
      "Reseñas de visitantes",
      "Sello de Tradición RDM",
    ],
  },
  {
    id: "cafeterias",
    category: "Cafeterías y Artesanías",
    icon: Coffee,
    price: 250,
    description: "Espacio para cafeterías de especialidad y tiendas de artesanías locales.",
    color: "from-emerald-500 to-teal-600",
    features: [
      "Ficha con fotos y descripción",
      "Ubicación en mapa interactivo",
      "Horarios y contacto",
      "Reseñas de clientes",
      "Promociones estacionales",
    ],
  },
  {
    id: "negocios",
    category: "Tiendas, Tortillerías, Pollos y Variados",
    icon: Store,
    price: 200,
    description: "Visibilidad básica para negocios esenciales de la comunidad.",
    color: "from-blue-500 to-cyan-600",
    features: [
      "Ficha con dirección y contacto",
      "Ubicación en mapa",
      "Horarios de atención",
      "Reseñas de la comunidad",
      "Sello de Negocio Local",
    ],
  },
  {
    id: "gondolas",
    category: "Góndolas y Semifijos",
    icon: Truck,
    price: 150,
    description: "Presencia digital accesible para vendedores ambulantes y puestos semifijos.",
    color: "from-green-500 to-lime-600",
    features: [
      "Ficha básica con foto",
      "Ubicación aproximada",
      "Horarios habituales",
      "Contacto directo",
    ],
  },
];

const discountPlans = [
  { months: 6, discount: 50, label: "6 meses", badge: "Popular" },
  { months: 9, discount: 50, label: "9 meses", badge: "Recomendado" },
  { months: 12, discount: 50, label: "12 meses", badge: "Mejor valor" },
];

const CatalogoPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [showEarlyBird, setShowEarlyBird] = useState(true);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <SEOMeta
          title="Catálogo de Negocios - Únete a RDM Digital"
          description="Registra tu negocio en el catálogo digital de Real del Monte. Precios accesibles para hoteles, restaurantes, pasterías, cafeterías y más."
        />
        <Navbar />

        {/* Hero */}
        <div className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-gold/10 text-gold border-gold/30 hover:bg-gold/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Oferta de Lanzamiento
              </Badge>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
                Únete al Catálogo{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-terracotta">
                  RDM Digital
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Posiciona tu negocio en la plataforma turística líder de Real del Monte.
                Miles de visitantes buscan negocios como el tuyo cada mes.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                {[
                  { value: "15K+", label: "Visitantes/mes" },
                  { value: "200", label: "Primeros lugares" },
                  { value: "50%", label: "Desc. lanzamiento" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Early Bird Banner */}
        {showEarlyBird && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            <div className="container mx-auto px-4 md:px-8">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gold/20 via-terracotta/15 to-gold/20 border border-gold/30 p-6 md:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center">
                      <Percent className="w-7 h-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        🎉 Oferta Especial: Primeros 200 negocios
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        50% de descuento al cubrir 6, 9 o 12 meses por adelantado.
                        ¡Lugares limitados!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {discountPlans.map((plan, i) => (
                      <button
                        key={plan.months}
                        onClick={() => setSelectedPlan(i)}
                        className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-all border ${
                          selectedPlan === i
                            ? "bg-gold text-white border-gold shadow-lg shadow-gold/30"
                            : "bg-background border-border text-foreground hover:border-gold/50"
                        }`}
                      >
                        {plan.badge && selectedPlan === i && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full bg-terracotta text-white whitespace-nowrap">
                            {plan.badge}
                          </span>
                        )}
                        {plan.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Pricing Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                Planes por Categoría
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Precios mensuales. Todos los planes incluyen presencia en el mapa interactivo y directorio digital.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier, index) => {
                const plan = discountPlans[selectedPlan];
                const discountedPrice = Math.round(tier.price * (1 - plan.discount / 100));
                const totalOriginal = tier.price * plan.months;
                const totalDiscounted = discountedPrice * plan.months;

                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient header */}
                    <div className={`h-2 bg-gradient-to-r ${tier.color}`} />

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                          <tier.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">
                          {tier.category}
                        </h3>
                      </div>

                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        {tier.description}
                      </p>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-foreground">
                            ${discountedPrice}
                          </span>
                          <span className="text-sm text-muted-foreground">/mes</span>
                        </div>
                        {showEarlyBird && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground line-through">
                              ${tier.price}/mes
                            </span>
                            <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                              -50%
                            </Badge>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Total {plan.label}: <span className="font-semibold text-foreground">${totalDiscounted.toLocaleString()} MXN</span>
                          {showEarlyBird && (
                            <span className="line-through ml-1">${totalOriginal.toLocaleString()}</span>
                          )}
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={tier.price >= 400 ? "default" : "outline"}
                        onClick={() => window.open("/auth", "_self")}
                      >
                        Registrar negocio
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-12">
              ¿Por qué registrarte?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: TrendingUp, title: "Más Clientes", desc: "Miles de turistas buscan negocios como el tuyo cada mes en nuestra plataforma." },
                { icon: MapPin, title: "Visibilidad en Mapa", desc: "Tu negocio aparece en el mapa interactivo HUD con marcador destacado." },
                { icon: Shield, title: "Sello Verificado", desc: "Genera confianza con el sello de verificación RDM Digital." },
                { icon: Users, title: "Comunidad Activa", desc: "Forma parte de la red de negocios más importante de Real del Monte." },
              ].map((b) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-gradient-to-r from-primary/10 via-gold/10 to-terracotta/10 border border-primary/20 p-8 md:p-12 text-center"
            >
              <Clock className="w-10 h-10 text-gold mx-auto mb-4" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                ¡Lugares limitados!
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Solo los primeros 200 negocios obtienen el 50% de descuento.
                No pierdas tu lugar en la plataforma turística más innovadora de Real del Monte.
              </p>
              <Button size="lg" className="px-8">
                <Star className="w-4 h-4 mr-2" />
                Registrarme ahora
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default CatalogoPage;
