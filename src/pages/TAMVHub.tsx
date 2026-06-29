import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Shield, Wallet, Users, Globe, Activity, Zap, TrendingUp, Crown, Sparkles,
  Network, Cpu, ScrollText, Database, Radio, Lock,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import SEOMeta from "@/components/SEOMeta";
import { useIsabellaStore } from "@/stores/tamv/isabellaStore";
import { useEconomyStore } from "@/stores/tamv/economyStore";
import { useNetworkStore } from "@/stores/tamv/networkStore";

const TAMVHub = () => {
  const { status, guardianMode, emotionalLevel, creativityIndex, empathyIndex } = useIsabellaStore();
  const { tcBalance, msrBalance, phoenixFund, infraFund, reserveFund } = useEconomyStore();
  const { nodes, quantumEncryptionActive, msrBridgeConnected, bookpiAnchorActive } = useNetworkStore();

  const systemMetrics = [
    { label: "Ciudadanos Federados", value: "24,847", icon: Users, trend: "+12.4%" },
    { label: "DreamSpaces Activos", value: "3,421", icon: Globe, trend: "+8.7%" },
    { label: "Decisiones/día (BABAS)", value: "156K", icon: Activity, trend: "+15.2%" },
    { label: "Nodos Federados", value: nodes.length.toString(), icon: Network, trend: "Triple Federado" },
  ];

  const economyDistribution = [
    { label: "Fénix (20%) — Resiliencia", value: phoenixFund, color: "from-[hsl(var(--terracotta))] to-[hsl(var(--copper))]" },
    { label: "Infraestructura (30%)", value: infraFund, color: "from-[hsl(var(--electric))] to-[hsl(var(--navy))]" },
    { label: "Reserva (50%)", value: reserveFund, color: "from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))]" },
  ];

  const protocols = [
    { name: "BABAS", desc: "Auditoría blockchain", icon: Lock },
    { name: "Fénix Rex 4.0", desc: "Recuperación autónoma", icon: Sparkles },
    { name: "Chronus", desc: "Saturación zonal", icon: Activity },
    { name: "Autopoiesis", desc: "Auto-regulación", icon: Cpu },
    { name: "BookPI", desc: "Memoria IPFS", icon: Database },
    { name: "ANUBIS-ZK", desc: "Pruebas Zero Knowledge", icon: Shield },
  ];

  return (
    <>
      <SEOMeta
        title="TAMV Civilization Hub — Nodo Cero Real del Monte"
        description="Centro de mando del ecosistema TAMV Blockchain MSR. Triple Federado conceptual, legal y técnico. Despliegue del Nodo Cero en Real del Monte."
      />
      <div className="min-h-screen bg-background relative">
        <NavBar />

        <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5">
              <Crown className="w-4 h-4 mr-2 text-[hsl(var(--gold))]" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">
                Nodo Cero · Real del Monte
              </span>
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-6 leading-tight">
              <span className="text-gradient-gold">TAMV</span>{" "}
              <span className="text-foreground/90">Civilization Hub</span>
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sistema operativo civilizacional híbrido cuántico-tradicional.
              Triple Federado: <span className="text-[hsl(var(--gold))]">conceptual</span> ·{" "}
              <span className="text-[hsl(var(--electric))]">legal</span> ·{" "}
              <span className="text-[hsl(var(--platinum))]">técnico</span>.
            </p>
          </motion.div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {systemMetrics.map((m, idx) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
              >
                <Card className="border-[hsl(var(--gold))]/15 bg-card/60 backdrop-blur-md hover:border-[hsl(var(--gold))]/40 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                          {m.label}
                        </p>
                        <p className="font-display text-3xl font-light mt-2 text-foreground">
                          {m.value}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <m.icon className="w-7 h-7 text-[hsl(var(--gold))]/60" />
                        <Badge variant="secondary" className="text-[9px] tracking-wider bg-[hsl(var(--electric))]/10 text-[hsl(var(--electric-light))]">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {m.trend}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Triple federado main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Isabella AI */}
            <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${guardianMode ? "text-[hsl(var(--electric))]" : "text-muted-foreground"}`} />
                  Isabella AI NextGen™
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                    Estado
                  </span>
                  <Badge className="bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30">
                    {status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                    Modo Guardián
                  </span>
                  <Badge variant={guardianMode ? "default" : "outline"}>
                    {guardianMode ? "ACTIVO" : "STANDBY"}
                  </Badge>
                </div>
                {[
                  { label: "Empatía", value: empathyIndex },
                  { label: "Creatividad", value: creativityIndex },
                  { label: "Emocional", value: emotionalLevel },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between font-body text-xs mb-2">
                      <span className="text-muted-foreground tracking-wider uppercase">{m.label}</span>
                      <span className="text-foreground/80">{m.value}%</span>
                    </div>
                    <Progress value={m.value} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Economía */}
            <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[hsl(var(--gold))]" />
                  Economía Civilizatoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[hsl(var(--gold))]/8 border border-[hsl(var(--gold))]/20">
                    <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">TC</p>
                    <p className="font-display text-2xl font-light mt-1">{tcBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(var(--electric))]/8 border border-[hsl(var(--electric))]/20">
                    <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">MSR</p>
                    <p className="font-display text-2xl font-light mt-1">{msrBalance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/30 space-y-3">
                  <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                    Regla Phoenix 20·30·50
                  </p>
                  {economyDistribution.map((f) => (
                    <div key={f.label}>
                      <div className="flex justify-between font-body text-xs mb-1.5">
                        <span className="text-foreground/80">{f.label}</span>
                        <span className="text-muted-foreground">${f.value.toFixed(2)}</span>
                      </div>
                      <div className={`h-1.5 rounded-full bg-gradient-to-r ${f.color} opacity-60`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--gold))]" />
                  Acceso Rápido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Estado del Nodo Cero", path: "/tamv/status", icon: Radio },
                  { label: "Explorador de API", path: "/tamv/api", icon: ScrollText },
                  { label: "Realito AI (Local)", path: "/", icon: Sparkles },
                  { label: "Catálogo Comercios", path: "/catalogo", icon: Wallet },
                  { label: "Rutas Territoriales", path: "/rutas", icon: Globe },
                ].map((a) => (
                  <Link
                    key={a.path}
                    to={a.path}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-[hsl(var(--gold))]/40 hover:bg-[hsl(var(--gold))]/5 transition-all group"
                  >
                    <a.icon className="w-4 h-4 text-[hsl(var(--gold))]/70 group-hover:text-[hsl(var(--gold))]" />
                    <span className="font-body text-xs tracking-wider uppercase text-foreground/80 group-hover:text-foreground">
                      {a.label}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Network status */}
          <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md mb-12">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-[hsl(var(--electric))]" />
                  Red Federada — 8 Capas Operativas
                </span>
                <div className="flex gap-2">
                  {quantumEncryptionActive && (
                    <Badge className="bg-[hsl(var(--electric))]/15 text-[hsl(var(--electric-light))] border-[hsl(var(--electric))]/30">
                      Quantum
                    </Badge>
                  )}
                  {msrBridgeConnected && (
                    <Badge className="bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30">
                      MSR Bridge
                    </Badge>
                  )}
                  {bookpiAnchorActive && (
                    <Badge variant="outline" className="border-border/40">
                      BookPI · IPFS
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {nodes.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-lg border border-border/40 bg-background/40 hover:border-[hsl(var(--gold))]/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-body text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--gold))]/70">
                        {n.layer}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          n.status === "active"
                            ? "bg-[hsl(var(--electric))] shadow-[0_0_8px_hsl(var(--electric))]"
                            : n.status === "idle"
                              ? "bg-[hsl(var(--gold))]/60"
                              : "bg-[hsl(var(--destructive))]"
                        }`}
                      />
                    </div>
                    <p className="font-display text-sm text-foreground mb-1">{n.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{n.region}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-1">
                      <span className="text-[hsl(var(--electric-light))]">{n.latency}ms</span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocols */}
          <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-[hsl(var(--gold))]" />
                Protocolos de Soberanía Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {protocols.map((p) => (
                  <div
                    key={p.name}
                    className="p-4 rounded-lg border border-border/40 bg-background/40 hover:border-[hsl(var(--gold))]/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p.icon className="w-4 h-4 text-[hsl(var(--gold))]" />
                      <p className="font-display text-sm text-foreground">{p.name}</p>
                    </div>
                    <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="default" className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background">
                  <Link to="/tamv/status">Ver Estado del Nodo Cero</Link>
                </Button>
                <Button asChild variant="outline" className="border-[hsl(var(--gold))]/30 text-foreground hover:bg-[hsl(var(--gold))]/10">
                  <Link to="/tamv/api">Explorar API TAMV</Link>
                </Button>
                <Button asChild variant="outline" className="border-[hsl(var(--electric))]/40 text-[hsl(var(--electric-light))] hover:bg-[hsl(var(--electric))]/10">
                  <Link to="/tamv/thesis">
                    <ScrollText className="w-4 h-4 mr-2" />
                    Tesis Soberana TAMV
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] text-[hsl(var(--navy-dark))] font-semibold">
                  <Link to="/tenochtitlan">
                    <Network className="w-4 h-4 mr-2" />
                    System Tenochtitlán
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <FooterSection />
      </div>
    </>
  );
};

export default TAMVHub;
