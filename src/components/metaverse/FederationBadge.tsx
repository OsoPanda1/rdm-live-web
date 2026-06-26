import { useEffect, useState } from "react";
import { Shield, ShieldCheck, ShieldX, Clock, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { logger } from "@/lib/logger";

interface FederationBadgeProps {
  entityType: string;
  entityId: string;
  hash: string;
  className?: string;
  showDetails?: boolean;
}

interface FederationData {
  verified: boolean;
  conceptual_at?: string;
  legal_at?: string;
  technical_at?: string;
  conceptual_signer?: string;
  legal_signer?: string;
  technical_signer?: string;
  metachain_tx?: string;
}

/**
 * FederationBadge - Sistema de Triple Federado TAMV
 * 
 * Muestra el estado de verificación triple federado de cualquier entidad:
 * - Conceptual: Validación filosófica y de visión
 * - Legal: Validación de cumplimiento y derechos
 * - Técnico: Validación de integridad y seguridad
 * 
 * Triple Federado = Conceptual | Legal | Técnico
 */
export default function FederationBadge({
  entityType,
  entityId,
  hash,
  className,
  showDetails = false
}: FederationBadgeProps) {
  const [data, setData] = useState<FederationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFederation = async () => {
      try {
        // Simulated federation check - in production this would query Supabase
        // Check local registry (conceptual layer)
        // Check continental registry (legal layer)
        // Check metachain registry (technical layer)
        
        // For demo purposes, simulate verification
        const isVerified = hash.length > 8;
        const now = new Date().toISOString();

        setData({
          verified: isVerified,
          conceptual_at: isVerified ? now : undefined,
          legal_at: isVerified ? now : undefined,
          technical_at: isVerified ? now : undefined,
          conceptual_signer: isVerified ? "TAMV_GENESIS_NODE" : undefined,
          legal_signer: isVerified ? "DEKATEOTL_DAO" : undefined,
          technical_signer: isVerified ? "ANUBIS_SENTINEL" : undefined,
          metachain_tx: isVerified ? `0x${hash.slice(0, 16)}...${hash.slice(-8)}` : undefined
        });
      } catch (err) {
        logger.error("Federation check error:", err);
        setData({ verified: false });
      } finally {
        setLoading(false);
      }
    };

    if (entityType && entityId && hash) {
      checkFederation();
    }
  }, [entityType, entityId, hash]);

  if (loading) {
    return (
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full",
          "bg-muted/50 backdrop-blur-sm animate-pulse",
          className
        )}
      >
        <Shield className="w-3 h-3" />
        Verificando Triple Federado...
      </motion.span>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("inline-flex flex-col gap-1", className)}
    >
      {/* Main Badge */}
      <motion.span 
        whileHover={{ scale: 1.02 }}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full",
          "transition-all duration-300 cursor-default",
          data.verified
            ? "bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-destructive/20 text-destructive border border-destructive/30"
        )}
        style={{
          boxShadow: data.verified 
            ? "0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.1)"
            : undefined
        }}
      >
        {data.verified ? (
          <ShieldCheck className="w-4 h-4" />
        ) : (
          <ShieldX className="w-4 h-4" />
        )}
        
        <span className="font-semibold">
          {data.verified ? "TRIPLE FEDERADO" : "Sin Federación"}
        </span>

        {/* Hash Preview */}
        <span className="opacity-70 font-mono text-[10px] ml-1">
          {hash.slice(0, 8)}...
        </span>

        {/* Verification Dots */}
        {data.verified && (
          <div className="flex gap-0.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Conceptual" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Legal" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Técnico" />
          </div>
        )}
      </motion.span>

      {/* Details Panel */}
      {showDetails && data.verified && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/30 space-y-2"
        >
          {/* Triple Federation Layers */}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {/* Conceptual */}
            <div className="flex flex-col items-center p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-400 font-semibold mb-1">CONCEPTUAL</span>
              <Clock className="w-2.5 h-2.5 text-muted-foreground mb-0.5" />
              <span className="text-muted-foreground">
                {data.conceptual_at ? new Date(data.conceptual_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {/* Legal */}
            <div className="flex flex-col items-center p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-400 font-semibold mb-1">LEGAL</span>
              <Clock className="w-2.5 h-2.5 text-muted-foreground mb-0.5" />
              <span className="text-muted-foreground">
                {data.legal_at ? new Date(data.legal_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {/* Technical */}
            <div className="flex flex-col items-center p-2 rounded-md bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-cyan-400 font-semibold mb-1">TÉCNICO</span>
              <Clock className="w-2.5 h-2.5 text-muted-foreground mb-0.5" />
              <span className="text-muted-foreground">
                {data.technical_at ? new Date(data.technical_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Metachain Transaction */}
          {data.metachain_tx && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <Fingerprint className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">
                MetaChain TX: {data.metachain_tx}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
