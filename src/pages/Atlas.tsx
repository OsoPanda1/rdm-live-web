import { useState } from "react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Server, Radio, Activity, Wifi, Cpu, HardDrive, Database, Globe, Signal, Shield, Zap, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface NodeData {
  id: string;
  name: string;
  type: "edge" | "fog" | "cloud" | "quantum";
  status: "online" | "degraded" | "offline";
  location: string;
  latency: number;
  uptime: number;
  throughput: number;
  lastHeartbeat: string;
  version: string;
}

const NODES: NodeData[] = [
  { id: "n1", name: "Nodo Cero — RDM", type: "edge", status: "online", location: "Real del Monte, Hgo.", latency: 4, uptime: 99.97, throughput: 342, lastHeartbeat: "1s ago", version: "MD-X5 v2.4" },
  { id: "n2", name: "Fog Sierra", type: "fog", status: "online", location: "Pachuca, Hgo.", latency: 12, uptime: 99.88, throughput: 891, lastHeartbeat: "2s ago", version: "FM-X2 v1.8" },
  { id: "n3", name: "Cloud CDMX", type: "cloud", status: "online", location: "CDMX", latency: 28, uptime: 99.99, throughput: 2400, lastHeartbeat: "0.5s ago", version: "CM-X1 v3.1" },
  { id: "n4", name: "Edge Tizayuca", type: "edge", status: "degraded", location: "Tizayuca, Hgo.", latency: 45, uptime: 97.2, throughput: 156, lastHeartbeat: "15s ago", version: "MD-X5 v2.3" },
  { id: "n5", name: "Quantum Lab", type: "quantum", status: "online", location: "Simulado", latency: 2, uptime: 100, throughput: 128, lastHeartbeat: "0.1s ago", version: "QK-Prototype" },
  { id: "n6", name: "Edge Tulancingo", type: "edge", status: "offline", location: "Tulancingo, Hgo.", latency: 0, uptime: 82.4, throughput: 0, lastHeartbeat: "5m ago", version: "MD-X5 v2.2" },
  { id: "n7", name: "Fog Hidalgo", type: "fog", status: "online", location: "Hidalgo", latency: 18, uptime: 99.91, throughput: 567, lastHeartbeat: "3s ago", version: "FM-X2 v1.8" },
  { id: "n8", name: "Edge Mineral", type: "edge", status: "degraded", location: "Mineral del Monte", latency: 38, uptime: 95.6, throughput: 89, lastHeartbeat: "45s ago", version: "MD-X5 v2.3" },
];

const STATUS_ICONS = { online: CheckCircle, degraded: AlertTriangle, offline: XCircle } as const;
const STATUS_COLORS = { online: "text-emerald-500", degraded: "text-amber-500", offline: "text-red-500" } as const;
const TYPE_ICONS = { edge: Wifi, fog: Radio, cloud: Globe, quantum: Cpu } as const;

export default function Atlas() {
  const [filter, setFilter] = useState<"all" | NodeData["type"]>("all");
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const filtered = filter === "all" ? NODES : NODES.filter(n => n.type === filter);
  const stats = { total: NODES.length, online: NODES.filter(n => n.status === "online").length, degraded: NODES.filter(n => n.status === "degraded").length, offline: NODES.filter(n => n.status === "offline").length };

  return (
    <RDMLayout>
      <SEOMeta {...PAGE_SEO.mapa} title="Atlas de Nodos — RDM Digital" description="Topología de nodos federados del ecosistema TAMV: edge, fog, cloud y quantum." />
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.08)] px-4 py-2 text-xs uppercase tracking-[0.2em] mb-4">
            <Network className="h-3.5 w-3.5 text-[hsl(var(--rdm-amber))]" />
            <span>Red Federada</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Atlas de Nodos</h1>
          <p className="mt-3 text-[hsl(var(--muted-foreground))] max-w-2xl">Topología de la red federada TAMV. Monitoreo en tiempo real de nodos edge, fog, cloud y quantum.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Nodos", value: stats.total, icon: Server, color: "text-[hsl(var(--foreground))]" },
            { label: "Online", value: stats.online, icon: CheckCircle, color: "text-emerald-500" },
            { label: "Degradados", value: stats.degraded, icon: AlertTriangle, color: "text-amber-500" },
            { label: "Offline", value: stats.offline, icon: XCircle, color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] w-fit">
          {(["all", "edge", "fog", "cloud", "quantum"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[hsl(var(--rdm-amber))] text-white" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
              {f === "all" ? "Todos" : f === "edge" ? "Edge" : f === "fog" ? "Fog" : f === "cloud" ? "Cloud" : "Quantum"}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((node, i) => {
              const StatusIcon = STATUS_ICONS[node.status];
              const TypeIcon = TYPE_ICONS[node.type];
              return (
                <motion.div key={node.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                    selectedNode?.id === node.id ? "border-[hsl(var(--rdm-amber)/0.5)] bg-[hsl(var(--rdm-amber)/0.06)]" : "border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] hover:border-[hsl(var(--rdm-amber)/0.3)]"
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${node.type === "edge" ? "bg-blue-500/10" : node.type === "fog" ? "bg-amber-500/10" : node.type === "cloud" ? "bg-emerald-500/10" : "bg-purple-500/10"}`}>
                        <TypeIcon className={`h-4 w-4 ${node.type === "edge" ? "text-blue-500" : node.type === "fog" ? "text-amber-500" : node.type === "cloud" ? "text-emerald-500" : "text-purple-500"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{node.name}</span>
                          <StatusIcon className={`h-3.5 w-3.5 ${STATUS_COLORS[node.status]}`} />
                        </div>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{node.location} · {node.version}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] capitalize">{node.type}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <div className="flex items-center gap-1"><Zap className="h-3 w-3" />{node.latency}ms</div>
                    <div className="flex items-center gap-1"><Signal className="h-3 w-3" />{node.uptime}% uptime</div>
                    <div className="flex items-center gap-1"><Activity className="h-3 w-3" />{node.throughput} req/s</div>
                  </div>

                  <AnimatePresence>
                    {selectedNode?.id === node.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-[hsl(var(--border)/0.3)] grid grid-cols-2 gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                          <div><span className="block text-[10px] opacity-60">Node ID</span>{node.id}</div>
                          <div><span className="block text-[10px] opacity-60">Tipo</span>{node.type.toUpperCase()}</div>
                          <div><span className="block text-[10px] opacity-60">Último heartbeat</span>{node.lastHeartbeat}</div>
                          <div><span className="block text-[10px] opacity-60">Estado</span>{node.status}</div>
                          <div className="col-span-2"><span className="block text-[10px] opacity-60">Version</span>{node.version}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </RDMLayout>
  );
}