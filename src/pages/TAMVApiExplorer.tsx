import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Code2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import SEOMeta from "@/components/SEOMeta";
import { apiGet } from "@/lib/apiClient";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  desc: string;
  group: "identity" | "governance" | "economy" | "ai" | "metaverse" | "msr";
}

const endpoints: Endpoint[] = [
  { method: "GET", path: "/api/tamv/identity", desc: "Lista ciudadanos federados", group: "identity" },
  { method: "POST", path: "/api/tamv/identity", desc: "Emite DID + ancla BookPI", group: "identity" },
  { method: "GET", path: "/api/tamv/governance/proposals", desc: "Propuestas DAO", group: "governance" },
  { method: "POST", path: "/api/tamv/governance/proposals", desc: "Crea propuesta", group: "governance" },
  { method: "POST", path: "/api/tamv/economy/distribute", desc: "Distribuye Phoenix 20·30·50", group: "economy" },
  { method: "POST", path: "/api/tamv/ai/decision", desc: "Registra DecisionRecord (SHA-256)", group: "ai" },
  { method: "GET", path: "/api/tamv/ai/decisions", desc: "Audita decisiones IA", group: "ai" },
  { method: "GET", path: "/api/tamv/metaverse/dreamspaces", desc: "DreamSpaces XR activos", group: "metaverse" },
  { method: "GET", path: "/api/tamv/msr/status", desc: "Estado del Nodo Cero", group: "msr" },
];

const groupColor: Record<Endpoint["group"], string> = {
  identity: "from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))]",
  governance: "from-[hsl(var(--electric))] to-[hsl(var(--navy))]",
  economy: "from-[hsl(var(--terracotta))] to-[hsl(var(--copper))]",
  ai: "from-[hsl(var(--electric-light))] to-[hsl(var(--electric))]",
  metaverse: "from-[hsl(var(--platinum))] to-[hsl(var(--electric))]",
  msr: "from-[hsl(var(--gold-light))] to-[hsl(var(--gold))]",
};

const TAMVApiExplorer = () => {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const tryEndpoint = async (ep: Endpoint) => {
    setLoading(ep.path);
    try {
      if (ep.method === "GET") {
        const data = await apiGet(ep.path);
        setResults((r) => ({ ...r, [ep.path]: data }));
      } else {
        // demo-only POST sample bodies
        const sample: Record<string, unknown> = {
          "/api/tamv/identity": { alias: "Visitante RDM", seed: "demo" },
          "/api/tamv/governance/proposals": {
            title: "Propuesta demo",
            body: "Ratificar interoperabilidad MSR ↔ RDM.",
          },
          "/api/tamv/economy/distribute": { profit: 1000 },
          "/api/tamv/ai/decision": {
            actorId: "tamv-founder-eoct",
            action: "demo-action",
            context: "API explorer",
          },
        };
        const res = await fetch(ep.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sample[ep.path] ?? {}),
        });
        const data = await res.json();
        setResults((r) => ({ ...r, [ep.path]: data }));
      }
    } catch (e) {
      setResults((r) => ({
        ...r,
        [ep.path]: { error: e instanceof Error ? e.message : "Backend offline" },
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <SEOMeta
        title="Explorador de API TAMV — RDM Digital"
        description="Explorador interactivo de la API TAMV Blockchain MSR: identidad, gobernanza, economía, IA ética y metaverso."
      />
      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="container mx-auto px-6 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30">
              <Code2 className="w-3 h-3 mr-2" />
              TAMV Blockchain MSR API · v1.0.0
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-3">
              Explorador de <span className="text-gradient-gold">API</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-2xl mx-auto">
              Endpoints reales del Nodo Cero. Pulsa <em>Probar</em> para ejecutar la llamada
              contra el backend federado RDM Digital.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {endpoints.map((ep) => (
              <Card
                key={ep.path}
                className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] bg-gradient-to-r ${groupColor[ep.group]} text-background`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs text-foreground/90 truncate">
                        {ep.path}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[hsl(var(--gold))]/30 shrink-0"
                      onClick={() => tryEndpoint(ep)}
                      disabled={loading === ep.path}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      {loading === ep.path ? "..." : "Probar"}
                    </Button>
                  </CardTitle>
                  <p className="font-body text-xs text-muted-foreground pt-1">{ep.desc}</p>
                </CardHeader>
                {results[ep.path] !== undefined && (
                  <CardContent>
                    <pre className="text-[10px] font-mono bg-background/60 p-3 rounded border border-border/40 max-h-64 overflow-auto text-foreground/80">
                      {JSON.stringify(results[ep.path], null, 2)}
                    </pre>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </main>

        <FooterSection />
      </div>
    </>
  );
};

export default TAMVApiExplorer;
