import React, { useState } from 'react';
import { MapPin, Mail, Phone, Send, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import logoRdm from "@/assets/logo-rdm-digital.png";
import logoTamv from "@/assets/logotamv.jpg";
import { newsletterApi } from "../lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    try {
      await newsletterApi.subscribe({ email, source: 'footer' });
      setSubscribed(true);
      toast({
        title: "¡Suscrito! 🎉",
        description: "Recibirás las mejores ofertas y eventos de Real del Monte.",
      });
    } catch {
      // Still show success to user (email may already exist)
      setSubscribed(true);
      toast({
        title: "¡Gracias! 🎉",
        description: "Gracias por tu interés en RDM Digital.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative" style={{ background: "linear-gradient(180deg, hsl(220,45%,6%) 0%, hsl(220,50%,3%) 100%)" }}>
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-[hsla(210,100%,55%,0.03)] blur-3xl animate-orb" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-[hsla(43,80%,55%,0.03)] blur-3xl animate-orb-reverse" />
      </div>
      {/* Top decorative line */}
      <div className="separator-animated w-full" />
      
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Brand & Newsletter */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoRdm} 
                alt="RDM Digital" 
                loading="lazy" className="w-14 h-14 object-contain"
                style={{ filter: "drop-shadow(0 0 10px hsla(210,100%,55%,0.3))" }}
              />
              <div>
                <span className="font-serif text-xl font-bold" style={{ color: "hsl(0,0%,95%)" }}>
                  RDM Digital
                </span>
                <div className="flex items-center gap-1 text-[10px] tracking-wider" style={{ color: "hsl(43,70%,55%)" }}>
                  <Sparkles className="w-3 h-3" />
                  Innovación Turística 2026
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(210,20%,45%)" }}>
              Tu guía comunitaria digital para descubrir Real del Monte, Pueblo Mágico de Hidalgo. 
              Servicios de altura para visitantes exigentes.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="font-serif font-semibold mb-3" style={{ color: "hsl(0,0%,92%)" }}>
                📨 Recibe noticias y eventos
              </h4>
              {subscribed ? (
                <div 
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: "hsla(145,60%,40%,0.12)", color: "hsl(145,60%,60%)", border: "1px solid hsla(145,60%,40%,0.2)" }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">¡Te has suscrito exitosamente!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0 rounded-xl"
                    style={{ 
                      background: "hsl(220,40%,10%)", 
                      color: "white",
                      border: "1px solid hsla(210,100%,55%,0.15)",
                    }}
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="rounded-xl"
                    style={{ background: "linear-gradient(135deg, hsl(210,100%,55%), hsl(210,100%,45%))" }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-semibold mb-4" style={{ color: "hsl(0,0%,92%)" }}>Explorar</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Mapa", path: "/mapa" },
                { label: "Lugares", path: "/lugares" },
                { label: "Directorio", path: "/directorio" },
                { label: "Eventos", path: "/eventos" },
                { label: "Comunidad", path: "/comunidad" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                    style={{ color: "hsl(210,20%,45%)" }}
                    onMouseOver={(e) => e.currentTarget.style.color = "hsl(210,100%,70%)"}
                    onMouseOut={(e) => e.currentTarget.style.color = "hsl(210,20%,45%)"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-serif font-semibold mb-4" style={{ color: "hsl(0,0%,92%)" }}>Descubre</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Historia", path: "/historia" },
                { label: "Cultura", path: "/cultura" },
                { label: "Gastronomía", path: "/gastronomia" },
                { label: "Ecoturismo", path: "/ecoturismo" },
                { label: "Relatos", path: "/relatos" },
                { label: "Rutas", path: "/rutas" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm transition-colors duration-300"
                    style={{ color: "hsl(210,20%,45%)" }}
                    onMouseOver={(e) => e.currentTarget.style.color = "hsl(43,70%,60%)"}
                    onMouseOut={(e) => e.currentTarget.style.color = "hsl(210,20%,45%)"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold mb-4" style={{ color: "hsl(0,0%,92%)" }}>Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(210,20%,45%)" }}>
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "hsl(210,100%,60%)" }} />
                <span>Real del Monte, Hidalgo</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(210,20%,45%)" }}>
                <Mail className="w-4 h-4 shrink-0" style={{ color: "hsl(43,70%,55%)" }} />
                <span>info@rdmdigital.mx</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(210,20%,45%)" }}>
                <Phone className="w-4 h-4 shrink-0" style={{ color: "hsl(145,50%,50%)" }} />
                <span>+52 771 123 4567</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2.5">
              <Link
                to="/apoya"
                className="block text-sm font-medium transition-colors"
                style={{ color: "hsl(43,70%,55%)" }}
                onMouseOver={(e) => e.currentTarget.style.color = "hsl(43,70%,70%)"}
                onMouseOut={(e) => e.currentTarget.style.color = "hsl(43,70%,55%)"}
              >
                ❤️ Apoya RDM Digital
              </Link>
              <Link
                to="/auth"
                className="block text-sm transition-colors"
                style={{ color: "hsl(210,20%,45%)" }}
                onMouseOver={(e) => e.currentTarget.style.color = "hsl(210,100%,70%)"}
                onMouseOut={(e) => e.currentTarget.style.color = "hsl(210,20%,45%)"}
              >
                🔐 Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid hsla(210,100%,55%,0.08)" }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs" style={{ color: "hsl(210,20%,30%)" }}>
              © 2026 RDM Digital. Hecho con ❤️ para Real del Monte, Pueblo Mágico.
            </p>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/reglamento" 
                className="text-xs transition-colors"
                style={{ color: "hsl(210,20%,30%)" }}
                onMouseOver={(e) => e.currentTarget.style.color = "hsl(210,100%,60%)"}
                onMouseOut={(e) => e.currentTarget.style.color = "hsl(210,20%,30%)"}
              >
                Reglamento
              </Link>
            </div>
          </div>

          {/* TAMV branding */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <img
              src={logoTamv}
              alt="TAMV Online – Tecnología Avanzada Mexicana Versátil"
              className="h-12 md:h-14 object-contain opacity-40 hover:opacity-80 transition-opacity duration-500"
              loading="lazy"
            />
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
              <p className="text-xs font-light tracking-wide" style={{ color: "hsl(210,30%,35%)" }}>
                Proyecto creado con amor ♥ Tecnología TAMV Online
              </p>
              <span className="hidden md:inline" style={{ color: "hsl(210,30%,15%)" }}>|</span>
              <p className="text-xs font-medium tracking-wide" style={{ color: "hsl(43,50%,40%)" }}>
                Orgullosamente Realmontenses
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
