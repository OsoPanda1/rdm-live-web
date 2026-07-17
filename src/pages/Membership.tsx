
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Star, Users, Building, Radio } from "lucide-react";
import PrismaticCard from "@/components/PrismaticCard";

const Membership = () => {
  const membershipTypes = [
    {
      id: "basic",
      name: "Nivel Gratuito (Basic)",
      icon: <Radio className="h-7 w-7 mb-2 text-blue-300" />,
      color: "blue",
      popular: false,
      price: "Gratis",
      features: [
        "Acceso básico a la plataforma con funcionalidades limitadas",
        "Capacidad para explorar Dream Spaces públicos",
        "Créditos TAMV de bienvenida para experimentar con el ecosistema",
        "Participación en eventos comunitarios seleccionados"
      ],
      buttonText: "Comenzar Gratis"
    },
    {
      id: "explorer",
      name: "Nivel Estándar (Explorer)",
      icon: <Star className="h-7 w-7 mb-2 text-green-400" />,
      color: "green",
      popular: true,
      price: "$9.99/mes",
      features: [
        "Bonificación mensual de Créditos TAMV",
        "Acceso a herramientas de creación intermedias",
        "Descuentos en la tienda virtual (5-10%)",
        "Prioridad media en el soporte técnico",
        "Capacidad de monetización básica para creadores"
      ],
      buttonText: "Elegir Explorer"
    },
    {
      id: "creator",
      name: "Nivel Premium (Creator)",
      icon: <Users className="h-7 w-7 mb-2 text-purple-400" />,
      color: "purple",
      popular: false,
      price: "$19.99/mes",
      features: [
        "Bonificación mensual de Créditos TAMV incrementada",
        "Acceso completo a todas las herramientas de creación",
        "Descuentos preferentes en la tienda virtual (15-20%)",
        "Mayor capacidad de almacenamiento y Dream Spaces",
        "Soporte técnico prioritario",
        "Comisiones reducidas para creadores",
        "Distintivos exclusivos en el perfil"
      ],
      buttonText: "Elegir Creator"
    },
    {
      id: "enterprise",
      name: "Nivel Empresarial (Enterprise)",
      icon: <Building className="h-7 w-7 mb-2 text-amber-400" />,
      color: "amber",
      popular: false,
      price: "Personalizado",
      features: [
        "Soluciones personalizadas para organizaciones",
        "Herramientas avanzadas de administración y análisis",
        "API dedicada para integración con sistemas propios",
        "Soporte técnico dedicado con tiempos de respuesta garantizados",
        "Opciones de marca blanca para Dream Spaces corporativos",
        "Posibilidad de crear y gestionar eventos a gran escala"
      ],
      buttonText: "Contactar Ventas"
    }
  ];

  const fidelityBenefits = [
    {
      title: "Recompensas por Antigüedad",
      description: "Bonificaciones y elementos exclusivos por cumplir hitos de permanencia en la plataforma."
    },
    {
      title: "Programa VIP",
      description: "Acceso anticipado a nuevas funcionalidades y contenido exclusivo para miembros de larga duración."
    },
    {
      title: "Descuentos por Renovación",
      description: "Incentivos económicos para la renovación anticipada de membresías."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Effect with parallax */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-indigo-950/40 to-black z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-indigo-900/30 to-transparent opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/30 via-transparent to-blue-900/20 opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-950/20 to-transparent opacity-10 mix-blend-overlay" />
      </div>
      
      <Header />
      
      <motion.main 
        className="flex-1 container max-w-6xl mx-auto px-4 py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-8">
          {/* Hero section */}
          <section className="text-center space-y-4 relative">
            <div className="absolute -top-20 -left-20 w-[140%] h-[140%] bg-gradient-prismatic opacity-5 blur-3xl animate-pulse-slow" />
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight relative">
              <span className="text-gradient bg-gradient-crystal animate-text-shimmer">Membresía</span>{" "}
              <span className="text-white/90">por Niveles</span>
            </h1>
            
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[2px] w-2/3 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-70"></div>
              </div>
              <div className="relative bg-black/50 px-4 py-1 rounded-full border border-white/10">
                <p className="text-sm font-semibold text-white flex items-center">
                  <span className="text-red-500">O</span>
                  <span className="text-white mx-1">•</span>
                  <span className="text-green-500">M</span>
                  <span className="text-white mx-1">•</span>
                  <span className="text-red-500">H</span>
                  <span className="mx-2 text-xs opacity-70">|</span>
                  <span className="text-xs text-white/70">Orgullosamente Mexicanos, Real del Monte, Hidalgo</span>
                </p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Elige el nivel que mejor se adapte a tus necesidades en nuestra plataforma multisensorial
            </p>
            
            <Separator className="bg-gradient-prismatic h-0.5 opacity-50 max-w-xs mx-auto" />
          </section>

          {/* Membership tiers */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {membershipTypes.map((tier) => (
              <motion.div 
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: membershipTypes.indexOf(tier) * 0.1 }}
              >
                <PrismaticCard variant={tier.color === "green" ? "crystal" : 
                              tier.color === "purple" ? "quantum" : 
                              tier.color === "amber" ? "nebula" : "default"} 
                             className={`h-full flex flex-col relative ${tier.popular ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-white/10'}`}>
                  
                  {tier.popular && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1 bg-green-500 text-xs font-semibold rounded-full text-black">
                      Más Popular
                    </div>
                  )}
                  
                  {tier.icon}
                  <h2 className="text-xl font-bold mb-2">{tier.name}</h2>
                  <div className="text-2xl font-semibold mb-4">{tier.price}</div>
                  
                  <ul className="space-y-2 mb-8 flex-grow">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 px-4 rounded-md transition-colors
                    ${tier.color === "blue" ? 'bg-blue-600 hover:bg-blue-700' : 
                      tier.color === "green" ? 'bg-green-600 hover:bg-green-700' :
                      tier.color === "purple" ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-amber-600 hover:bg-amber-700'} text-white font-medium`}>
                    {tier.buttonText}
                  </button>
                </PrismaticCard>
              </motion.div>
            ))}
          </section>

          {/* Additional benefits section */}
          <section className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient bg-gradient-crystal animate-text-shimmer">
                Beneficios Adicionales por Fidelidad
              </h2>
              <p className="text-muted-foreground mt-2">
                El sistema reconoce y premia la lealtad de los usuarios a través de un programa de fidelidad progresivo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {fidelityBenefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                >
                  <PrismaticCard className="h-full">
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </PrismaticCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-16 bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes sobre Membresías</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-crystal-400">¿Puedo cambiar mi plan en cualquier momento?</h3>
                <p className="text-sm text-muted-foreground">
                  Sí, puedes actualizar o reducir tu plan en cualquier momento. Los cambios se aplicarán al comienzo del siguiente período de facturación.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-crystal-400">¿Qué métodos de pago aceptan?</h3>
                <p className="text-sm text-muted-foreground">
                  Aceptamos tarjetas de crédito/débito principales, Google Pay y otros métodos de pago globales para la compra de membresías o Créditos TAMV.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-crystal-400">¿Hay descuentos para suscripciones anuales?</h3>
                <p className="text-sm text-muted-foreground">
                  Sí, ofrecemos descuentos para los usuarios que eligen suscribirse anualmente. Por lo general, obtienes dos meses gratis al elegir el plan anual.
                </p>
              </div>
            </div>
          </section>

          {/* Footer section */}
          <section className="text-center mt-12">
            <p className="text-xs text-muted-foreground">
              TAMV ONLINE NETWORK © 2025 — Metaconsciencia Sistémica v1.0
            </p>
          </section>
        </div>
      </motion.main>
    </div>
  );
};

export default Membership;
