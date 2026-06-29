import { useCallback, useMemo, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type DonationButtonProps = {
  trackTitle?: string;
  trackId?: string;
  compact?: boolean;
  minAmount?: number;
};

export function DonationButton({
  trackTitle,
  trackId,
  compact = false,
  minAmount = 25,
}: DonationButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  const label = trackTitle?.trim() || "RDM Music";

  const presets = useMemo(
    () => [minAmount, 50, 100, 250, 500].filter(
      (v, idx, arr) => v >= minAmount && arr.indexOf(v) === idx,
    ),
    [minAmount],
  );

  const validAmount = useMemo(
    () => Number.isFinite(amount) && amount >= minAmount,
    [amount, minAmount],
  );

  const handleAmountChange = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return;
      setAmount(value);
    },
    [],
  );

  const donate = useCallback(async () => {
    if (!validAmount) {
      toast.error(`La donación mínima es de ${minAmount} MXN`);
      return;
    }
    if (!trackId) {
      toast.error("No se pudo asociar la donación a la pista");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-music-donation",
        {
          body: {
            amount_mxn: amount,
            track_id: trackId,
            track_title: label,
          },
        },
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        toast.error("No se recibió una URL de pago");
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la donación";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [amount, label, minAmount, trackId, validAmount]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "inline-flex items-center gap-2 rounded-xl gradient-gold text-primary-foreground shadow-gold font-body font-semibold transition-all hover:shadow-elevated",
          compact ? "px-3 py-1.5 text-[11px]" : "px-5 py-3 text-sm",
        ].join(" ")}
      >
        <Heart className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Donar
      </button>
    );
  }

  return (
    <div className="glass-card max-w-md space-y-3 rounded-2xl border border-gold/30 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/80">
        Apoya RDM Music
      </p>
      <p className="text-xs font-body text-muted-foreground">
        Esta música sostiene el proyecto RDM Digital. Cada donación ayuda a
        cubrir infraestructura y producción. Monto mínimo: {minAmount} MXN.
      </p>

      <div className="flex flex-wrap gap-2">
        {presets.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleAmountChange(value)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-mono border transition",
              amount === value
                ? "border-gold bg-gold/15 text-gold"
                : "border-border/30 text-muted-foreground hover:border-gold/40",
            ].join(" ")}
          >
            ${value}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Monto personalizado (MXN)
        </label>
        <input
          type="number"
          min={minAmount}
          value={amount}
          onChange={(event) =>
            handleAmountChange(Number(event.target.value || minAmount))
          }
          className="w-full rounded-xl border border-border/30 bg-background/60 px-4 py-2.5 text-sm font-body outline-none focus:border-gold/50"
        />
        {!validAmount && (
          <p className="text-[10px] text-red-400">
            El monto debe ser al menos {minAmount} MXN.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={donate}
          disabled={loading || !validAmount}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-gold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Heart className="h-3.5 w-3.5" />
          )}
          {validAmount
            ? `Donar $${amount} MXN`
            : `Donar desde $${minAmount} MXN`}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="rounded-xl border border-border/30 px-3 py-2.5 text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Donación asociada a:{" "}
        <span className="font-mono text-foreground">{label}</span>
      </p>
    </div>
  );
}
