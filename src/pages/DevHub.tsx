import { useState } from "react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, BookOpen, Code2, Shield, Cpu, Globe, Database, Lock, QrCode, Network, ExternalLink, Copy, Check } from "lucide-react";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: "Public" | "Bearer" | "Admin";
  example: string;
}

const DOMAINS: { id: string; icon: typeof Terminal; name: string; description: string; endpoints: ApiEndpoint[] }[] = [
  { id: "auth", icon: Shield, name: "Auth", description: "Autenticación y registro de usuarios", endpoints: [
    { method: "POST", path: "/api/auth/login", description: "Iniciar sesión con email y contraseña", auth: "Public", example: "curl -X POST /api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"...\",\"password\":\"...\"}'" },
    { method: "POST", path: "/api/auth/register", description: "Registrar nuevo usuario", auth: "Public", example: "curl -X POST /api/auth/register -d '{\"email\":\"...\",\"name\":\"...\"}'" },
  ]},
  { id: "identity", icon: Cpu, name: "Identity", description: "Identidad soberana TAMV", endpoints: [
    { method: "GET", path: "/api/identity/profile", description: "Obtener perfil del usuario", auth: "Bearer", example: "curl /api/identity/profile -H 'Authorization: Bearer <token>'" },
    { method: "PUT", path: "/api/identity/profile", description: "Actualizar perfil", auth: "Bearer", example: "curl -X PUT /api/identity/profile -d '{\"name\":\"...\"}'" },
  ]},
  { id: "kernel", icon: Network, name: "Kernel", description: "Núcleo MD-X5 y motor de decisión", endpoints: [
    { method: "POST", path: "/api/kernel/intent", description: "Enviar intención al kernel", auth: "Bearer", example: "curl -X POST /api/kernel/intent -d '{\"type\":\"query\",\"payload\":{}}'" },
    { method: "GET", path: "/api/kernel/status", description: "Estado del kernel", auth: "Public", example: "curl /api/kernel/status" },
  ]},
  { id: "security", icon: Lock, name: "Security", description: "Seguridad y cifrado post-cuántico", endpoints: [
    { method: "POST", path: "/api/security/encrypt", description: "Cifrar datos con PQC", auth: "Bearer", example: "curl -X POST /api/security/encrypt -d '{\"data\":\"...\",\"key\":\"...\"}'" },
    { method: "POST", path: "/api/security/verify", description: "Verificar integridad", auth: "Bearer", example: "curl -X POST /api/security/verify -d '{\"data\":\"...\",\"hash\":\"...\"}'" },
  ]},
  { id: "economy", icon: Database, name: "Economy", description: "Economía federada y ledger", endpoints: [
    { method: "GET", path: "/api/economy/balance", description: "Consultar saldo", auth: "Bearer", example: "curl /api/economy/balance" },
    { method: "POST", path: "/api/economy/transfer", description: "Transferencia entre cuentas", auth: "Bearer", example: "curl -X POST /api/economy/transfer -d '{\"to\":\"...\",\"amount\":10}'" },
  ]},
  { id: "social", icon: Globe, name: "Social", description: "Red social territorial", endpoints: [
    { method: "GET", path: "/api/social/feed", description: "Obtener feed comunitario", auth: "Public", example: "curl /api/social/feed?limit=20" },
    { method: "POST", path: "/api/social/post", description: "Crear publicación", auth: "Bearer", example: "curl -X POST /api/social/post -d '{\"content\":\"...\"}'" },
  ]},
  { id: "isabella", icon: QrCode, name: "Isabella AI", description: "API de inteligencia artificial", endpoints: [
    { method: "POST", path: "/api/isabella/recommendations", description: "Recomendaciones contextuales", auth: "Bearer", example: "curl -X POST /api/isabella/recommendations -d '{\"query\":\"¿qué visitar?\"}'" },
    { method: "GET", path: "/api/isabella/stream", description: "SSE en tiempo real", auth: "Bearer", example: "curl -N /api/isabella/stream" },
  ]},
];

export default function DevHub() {
  const [activeDomain, setActiveDomain] = useState(DOMAINS[0].id);
  const [copied, setCopied] = useState<string | null>(null);

  const domain = DOMAINS.find(d => d.id === activeDomain) ?? DOMAINS[0];

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(null), 2000); } catch { /* clipboard write may fail */ }
  };

  return (
    <RDMLayout>
      <SEOMeta {...PAGE_SEO.mapa} title="DevHub DM-X7 — API Gateway" description="API unificada TAMV Gateway con 160 operaciones en 13 dominios soberanos." />
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.08)] px-4 py-2 text-xs uppercase tracking-[0.2em] mb-4">
            <Terminal className="h-3.5 w-3.5 text-[hsl(var(--rdm-amber))]" />
            <span>API Developer Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>DevHub DM-X7</h1>
          <p className="mt-3 text-[hsl(var(--muted-foreground))] max-w-2xl">Explora y prueba los endpoints de la API unificada TAMV Gateway. 13 dominios soberanos, 160+ operaciones documentadas.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <div className="space-y-1">
            {DOMAINS.map(d => (
              <button key={d.id} onClick={() => setActiveDomain(d.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  activeDomain === d.id ? "bg-[hsl(var(--rdm-amber)/0.12)] text-[hsl(var(--rdm-amber))] border border-[hsl(var(--rdm-amber)/0.25)]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.5)]"
                }`}>
                <d.icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{d.name}</div>
                  <div className="text-[10px] opacity-70 truncate">{d.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><domain.icon className="h-5 w-5 text-[hsl(var(--rdm-amber))]" />{domain.name}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{domain.description}</p>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {domain.endpoints.map((ep, i) => (
                  <motion.div key={ep.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] overflow-hidden">
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ep.method === "GET" ? "bg-emerald-500/10 text-emerald-500" : ep.method === "POST" ? "bg-blue-500/10 text-blue-500" : ep.method === "PUT" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>{ep.method}</span>
                          <code className="text-xs font-mono text-[hsl(var(--foreground))]">{ep.path}</code>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ep.auth === "Public" ? "bg-green-500/10 text-green-500" : ep.auth === "Bearer" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>{ep.auth}</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{ep.description}</p>
                      </div>
                      <button onClick={() => copyToClipboard(ep.example)} className="shrink-0 p-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] transition-colors" title="Copiar ejemplo">
                        {copied === ep.example ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />}
                      </button>
                    </div>
                    <div className="border-t border-[hsl(var(--border)/0.3)] bg-[hsl(var(--muted)/0.3)] px-4 py-2.5">
                      <code className="text-[11px] font-mono text-[hsl(var(--muted-foreground))] break-all">{ep.example}</code>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 p-5 rounded-2xl border border-[hsl(var(--rdm-amber)/0.25)] bg-[hsl(var(--rdm-amber)/0.06)]">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-2"><ExternalLink className="h-4 w-4 text-[hsl(var(--rdm-amber))]" />Documentación Completa</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">La especificación OpenAPI 3.1 completa está disponible en el repositorio del Gateway.</p>
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber))]">13 dominios</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber))]">160+ endpoints</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber))]">Auth Bearer</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber))]">Rate limiting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RDMLayout>
  );
}