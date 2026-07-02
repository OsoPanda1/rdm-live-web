// @ts-nocheck
import { motion } from "framer-motion";
import { Shield, Database, Cpu, Network, Brain, Radio, Boxes } from "lucide-react";
import { Link } from "react-router-dom";

const EJES = [
  { key: "IDENTITY_CORE", name: "Identity Core", icon: Shield, desc: "DID soberano, autenticación cuántica-resistente, perfiles ciudadanos verificables." },
  { key: "LEDGER_2DBD", name: "Ledger 2DBD", icon: Database, desc: "Bitácora dual de bienes digitales territoriales. Auditable, inmutable, soberana." },
  { key: "COMPUTE_EDGE", name: "Compute Edge", icon: Cpu, desc: "Cómputo distribuido en el territorio. Edge functions Deno con baja latencia." },
  { key: "ALAMEXA_NEXUS", name: "Alamexa Nexus", icon: Network, desc: "Gemelo territorial vivo. POIs, rutas, eventos sincronizados en tiempo real." },
  { key: "UTAMV_NEURAL", name: "uTAMV Neural", icon: Brain, desc: "IA contextual cultural. Realito responde con memoria semántica del territorio." },
  { key: "MEDIA_BROADCAST", name: "Media Broadcast", icon: Radio, desc: "RDM Radio + Music. Soberanía sonora con tracks locales y donaciones directas." },
  { key: "RDM_TWIN_4D", name: "RDM Twin 4D", icon: Boxes, desc: "Gemelo digital 4D temporal. Capas de turismo, comercio, movilidad y cultura." },
];

export default function LTOS() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/70 mb-3">Manifiesto · Sistema Operativo Territorial</p>
          <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tight leading-[1.05]">
            <span className="text-gradient-gold italic">LTOS</span>
            <br />Local Territorial Operating System
          </h1>
          <p className="mt-6 text-lg font-body text-muted-foreground max-w-3xl">
            El primer sistema operativo territorial soberano del mundo. Real del Monte es su <span className="text-gold">Nodo Cero</span> —
            un experimento civilizatorio que demuestra que la tecnología puede servir a la dignidad de un pueblo sin extraerle su alma.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {EJES.map((e, i) => (
            <motion.div key={e.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 border border-gold/15 hover:border-gold/40 transition-all">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                  <e.icon className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">{e.key}</p>
                  <h3 className="text-xl font-display text-platinum mt-1">{e.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 border border-gold/25">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Fórmula de Integridad Soberana</p>
          <p className="mt-4 text-3xl md:text-4xl font-mono text-gold text-center py-6">
            I_TAMV = Σ(Wn · σ(Vn) / Δt) × E_Dignity
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            Donde <span className="text-gold">Wn</span> es el peso de cada federación, <span className="text-gold">σ(Vn)</span> su varianza operativa,
            <span className="text-gold"> Δt</span> el intervalo de evaluación y <span className="text-gold">E_Dignity</span> el coeficiente
            del Estatuto de Dignidad — el único que no puede ser cero.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/control" className="gradient-gold text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-gold hover:shadow-elevated transition-all">
            Ver Control Center en vivo
          </Link>
          <Link to="/wiki" className="border border-gold/40 text-gold px-6 py-3 rounded-xl hover:bg-gold/10 transition-all">
            Explorar la Wiki
          </Link>
        </div>
      </div>
    </div>
  );
}