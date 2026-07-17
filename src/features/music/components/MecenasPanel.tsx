import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  Crown,
  Sparkles,
  ExternalLink,
  Check,
} from "lucide-react";
import type { MecenasTier } from "../types";
import { postDonation } from "../api";

const TIERS: {
  tier: MecenasTier;
  label: string;
  minCents: number;
  icon: typeof Heart;
  color: string;
  bg: string;
  benefits: string[];
}[] = [
  {
    tier: "oyente",
    label: "Oyente",
    minCents: 0,
    icon: Heart,
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.08)",
    benefits: [
      "Acceso a todo el archivo sonoro",
      "Reproduccion en 3 modos espaciales",
      "Cronicas Sonoras completas",
    ],
  },
  {
    tier: "mecenas",
    label: "Mecenas",
    minCents: 5000,
    icon: Star,
    color: "#A7F300",
    bg: "rgba(167,243,0,0.08)",
    benefits: [
      "Todo lo de Oyente",
      "Voto en curaduria de tracks",
      "Acceso anticipado a restauraciones",
      "Badge exclusivo Mecenas",
      "200 XP bonus por donacion",
    ],
  },
  {
    tier: "productor",
    label: "Productor",
    minCents: 10000,
    icon: Crown,
    color: "#FFD700",
    bg: "rgba(255,215,0,0.08)",
    benefits: [
      "Todo lo de Mecenas",
      "Voto en proxima crónica",
      "Solicitud de restauracion de 1 track",
      "Credito en pagina de credits",
      "Badge legendario Productor",
      "500 XP bonus por donacion",
    ],
  },
];

interface MecenasPanelProps {
  currentTier?: MecenasTier;
  onDonationComplete?: (xp: number) => void;
}

export function MecenasPanel({ currentTier = "oyente", onDonationComplete }: MecenasPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [donated, setDonated] = useState(false);

  const amounts = [100, 200, 500, 1000, 2000];
  const currentAmount = selectedAmount ?? (customAmount ? parseInt(customAmount) || 0 : 0);

  const handleDonate = async () => {
    if (currentAmount <= 0) return;
    setProcessing(true);

    const result = await postDonation({
      amount_cents: currentAmount * 100,
      message: "Gracias por mantener vivo el archivo sonoro de RDM.",
      anonymous: false,
    });

    setProcessing(false);
    if (result) {
      setDonated(true);
      const xp = Math.round(currentAmount / 10) * 5;
      onDonationComplete?.(xp);
      setTimeout(() => setDonated(false), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tier overview */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#FFD700]" />
        <h3 className="text-sm font-bold text-[#0b1020]">Mecenas del Archivo Sonoro</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((t) => {
          const Icon = t.icon;
          const isActive = currentTier === t.tier || (currentTier === "productor" && t.tier === "mecenas") || (currentTier === "mecenas" && t.tier === "oyente");
          return (
            <div
              key={t.tier}
              className={`rounded-xl p-3 border transition-all ${
                isActive
                  ? "border-current shadow-inner"
                  : "border-[#E5E7EB] opacity-60"
              }`}
              style={{
                backgroundColor: t.bg,
                borderColor: isActive ? t.color : undefined,
              }}
            >
              <Icon className="w-5 h-5 mb-1" style={{ color: t.color }} />
              <p className="text-xs font-bold text-[#0b1020]">{t.label}</p>
              <p className="text-[9px] text-[#4B5563]">
                {t.minCents > 0 ? `$${(t.minCents / 100).toLocaleString()}+ MXN` : "Gratis"}
              </p>
              {isActive && (
                <span
                  className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-bold uppercase tracking-wider"
                  style={{ color: t.color }}
                >
                  <Check className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current tier benefits */}
      <div className="rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
          Beneficios de tu nivel
        </p>
        <ul className="space-y-1.5">
          {TIERS.find((t) => t.tier === currentTier)?.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-[#1c2540]">
              <Check className="w-3 h-3 text-[#A7F300] mt-0.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Donation form */}
      <div>
        <p className="text-[11px] text-[#4B5563] mb-3">
          Tu donacion mantiene vivo este archivo sonoro. La musica es y sera siempre gratuita.
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {amounts.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setSelectedAmount(amt);
                setCustomAmount("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedAmount === amt
                  ? "bg-gradient-to-br from-[#00D4FF] to-[#A7F300] text-white shadow-lg scale-105"
                  : "bg-white border border-[#E5E7EB] text-[#0b1020] hover:border-[#00D4FF]"
              }`}
            >
              ${amt.toLocaleString()}
              {amt === 500 && (
                <span className="block text-[8px] font-normal opacity-70">Popular</span>
              )}
              {amt === 1000 && (
                <span className="block text-[8px] font-normal opacity-70">Mecenas</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-[#6B7280]">$</span>
          <input
            type="number"
            min={1}
            placeholder="Otra cantidad"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            className="flex-1 max-w-[160px] px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#0b1020] text-xs focus:outline-none focus:border-[#00D4FF] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-[#6B7280]">MXN</span>
        </div>

        <button
          onClick={handleDonate}
          disabled={processing || currentAmount <= 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#FF1744] to-[#A7F300] text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 transition-all shadow-xl shadow-[#00D4FF]/25"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : donated ? (
            <>
              <Check className="w-4 h-4" />
              Donacion registrada
            </>
          ) : (
            <>
              <Heart className="w-4 h-4" />
              Donar ${currentAmount > 0 ? currentAmount.toLocaleString() : "..."}
            </>
          )}
        </button>

        <p className="mt-2 text-[9px] text-[#6B7280]">
          <ExternalLink className="w-3 h-3 inline mr-1" />
          Pago seguro via Stripe. No almacenamos datos bancarios.
        </p>
      </div>
    </div>
  );
}
