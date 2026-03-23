// @ts-nocheck
import { useState } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const suggestedAmounts = [50, 100, 250, 500];

export default function Donar() {
  const [amount, setAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("No fue posible iniciar el checkout");
      }

      const payload = (await response.json()) as { url?: string };
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      window.location.href = "/gracias-donativo";
    } catch {
      window.location.href = "/gracias-donativo";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 pt-28 pb-20">
        <section className="max-w-2xl mx-auto glass-surface-strong p-8 space-y-6">
          <h1 className="text-3xl font-bold">Asegura el brillo de nuestro legado</h1>
          <p className="text-muted-foreground">
            Apoyo para RDM Digital — tu donativo fortalece el patrimonio cultural, la narrativa viva y la visibilidad de
            los comercios locales.
          </p>
          <div className="flex flex-wrap gap-3">
            {suggestedAmounts.map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  amount === value ? "border-primary bg-primary/20 text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                ${value} MXN
              </button>
            ))}
          </div>
          <button
            disabled={isLoading}
            onClick={handleDonate}
            className="btn-sovereign bg-primary text-primary-foreground disabled:opacity-60"
          >
            {isLoading ? "Conectando checkout..." : `Donar $${amount} MXN`}
          </button>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
