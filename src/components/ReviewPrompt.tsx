import { useEffect, useState } from "react";
import { useIsabellaSSE } from "@/hooks/useIsabellaSSE";

export function ReviewPrompt() {
  const { decision } = useIsabellaSSE();
  const [shown, setShown] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (decision?.retentionIntent === "SAFE_EXIT" && !shown) {
      setShown(true);
    }
  }, [decision, shown]);

  if (!shown) return null;

  const submit = async (consentValue: boolean) => {
    setConsent(consentValue);
    await fetch("/api/isabella/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        territory: decision?.territory ?? "RDM",
        consent: consentValue,
        rating,
        comment,
      }),
    });

    if (!consentValue) {
      setShown(false);
    }
  };

  if (consent === false) return null;

  return (
    <section className="px-6 pb-8">
      <div className="max-w-3xl mx-auto rounded-2xl border border-border/50 p-4 bg-card/70 space-y-3">
        <p className="font-medium">¿Me ayudas con una reseña rápida?</p>
        <p className="text-xs text-muted-foreground">Tu opinión mejora la calidad turística de Real del Monte.</p>

        <div className="flex gap-2 items-center">
          <label className="text-sm">Rating:</label>
          <input type="range" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          <span className="text-sm">{rating}/5</span>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={280}
          placeholder="Comentario opcional"
          className="w-full rounded-lg border bg-background p-2 text-sm"
        />

        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm" onClick={() => submit(true)}>
            Sí, enviar
          </button>
          <button className="px-3 py-2 rounded-lg border text-sm" onClick={() => submit(false)}>
            No por ahora
          </button>
        </div>
      </div>
    </section>
  );
}
