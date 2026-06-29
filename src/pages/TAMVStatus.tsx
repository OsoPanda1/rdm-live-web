import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Cpu, Database, Shield, Radio } from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import SEOMeta from "@/components/SEOMeta";
import { apiGet } from "@/lib/apiClient";

interface MsrStatus {
  node: string;
  version: string;
  federation: string;
  layers: string[];
  protocols: string[];
  quantumEncryption: boolean;
  msrBridge: string;
  bookpiAnchor: string;
  citizens: number;
  proposals: number;
  decisions: number;
  timestamp: string;
}

const TAMVStatus = () => {
  const [status, setStatus] = useState<MsrStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<MsrStatus>("/api/tamv/msr/status");
      setStatus(data);
    } catch (e) {
      // Backend offline → mostrar estado simulado del nodo cero
      setStatus({
        node: "TAMV-RDM-NODO-CERO",
        version: "1.0.0",
        federation: "Triple Federado (conceptual / legal / técnica)",
        layers: ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"],
        protocols: ["BABAS", "Fénix Rex 4.0", "Chronus", "Autopoiesis", "BookPI", "ANUBIS-ZK"],
        quantumEncryption: true,
        msrBridge: "EVM-Sidechain (offline-fallback)",
        bookpiAnchor: "ipfs://offline-fallback",
        citizens: 1,
        proposals: 1,
        decisions: 0,
        timestamp: new Date().toISOString(),
      });
      setError("Backend offline — mostrando snapshot del Nodo Cero");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <SEOMeta
        title="Estado del Nodo Cero TAMV — Real del Monte"
        description="Telemetría en tiempo real del Nodo Cero TAMV: capas federadas, protocolos de soberanía, MSR Bridge y BookPI."
      />
      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="container mx-auto px-6 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4 bg-[hsl(var(--electric))]/10 text-[hsl(var(--electric-light))] border-[hsl(var(--electric))]/30">
              <Radio className="w-3 h-3 mr-2" />
              Telemetría en vivo
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-3">
              <span className="text-gradient-gold">Nodo Cero</span>
            </h1>
            <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
              TAMV-RDM · Real del Monte, Hidalgo
            </p>
          </motion.div>

          {error && (
            <div className="mb-6 p-3 rounded-lg border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5 text-center">
              <p className="font-body text-xs text-[hsl(var(--gold))]">{error}</p>
            </div>
          )}

          <div className="flex justify-end mb-6">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-[hsl(var(--gold))]/30"
            >
              <RefreshCw className={`w-3 h-3 mr-2 ${loading ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>
          </div>

          {status && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[hsl(var(--gold))]" /> Identidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 font-body text-xs">
                  <Row k="Nodo" v={status.node} />
                  <Row k="Versión" v={status.version} />
                  <Row k="Federación" v={status.federation} />
                  <Row k="Sello" v={new Date(status.timestamp).toLocaleString()} />
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[hsl(var(--electric))]" /> Capas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {status.layers.map((l) => (
                      <div
                        key={l}
                        className="p-2 rounded text-center bg-[hsl(var(--electric))]/10 border border-[hsl(var(--electric))]/20 font-display text-sm text-[hsl(var(--electric-light))]"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[hsl(var(--gold))]" /> Protocolos
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {status.protocols.map((p) => (
                    <Badge
                      key={p}
                      className="bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30"
                    >
                      {p}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Database className="w-4 h-4 text-[hsl(var(--gold))]" /> Anclaje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 font-body text-xs">
                  <Row k="Quantum Encryption" v={status.quantumEncryption ? "Activo" : "Inactivo"} />
                  <Row k="MSR Bridge" v={status.msrBridge} />
                  <Row k="BookPI" v={status.bookpiAnchor} />
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md md:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display text-base">Métricas vivas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { k: "Ciudadanos", v: status.citizens },
                      { k: "Propuestas", v: status.proposals },
                      { k: "Decisiones", v: status.decisions },
                    ].map((m) => (
                      <div key={m.k} className="text-center">
                        <p className="font-display text-3xl font-light text-foreground">{m.v}</p>
                        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mt-1">
                          {m.k}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <FooterSection />
      </div>
    </>
  );
};

const Row = ({ k, v }: { k: string; v: string | number | boolean }) => (
  <div className="flex justify-between border-b border-border/30 py-1.5">
    <span className="text-muted-foreground tracking-wider uppercase text-[10px]">{k}</span>
    <span className="text-foreground/90 truncate ml-3 max-w-[200px] text-right">{String(v)}</span>
  </div>
);

export default TAMVStatus;
