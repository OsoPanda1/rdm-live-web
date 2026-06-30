import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Página de checkout. En producción se reemplaza por la redirección al
// proveedor (Stripe/Paddle). En modo manual permite simular la confirmación
// disparando el webhook con la cuenta del propietario.
export default function ComerciosCheckout() {
  const [params] = useSearchParams();
  const sessionId = params.get("session");
  const merchantId = params.get("merchant");
  const [payment, setPayment] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    supabase.from("merchant_payments").select("*").eq("provider_session_id", sessionId).maybeSingle()
      .then(({ data }) => setPayment(data));
    supabase.from("merchant_registrations").select("*").eq("id", merchantId).maybeSingle()
      .then(({ data }) => setMerchant(data));
  }, [sessionId, merchantId]);

  const simulatePaid = async () => {
    setLoading(true);
    try {
      const url = `https://wgyzomoedwazostnvhls.supabase.co/functions/v1/merchant-payment-webhook`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, status: "succeeded", payment_id: `manual_${Date.now()}` }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success("Pago confirmado. Tu negocio ya está publicado.");
      setTimeout(() => (window.location.href = "/catalogo"), 1500);
    } catch (e: any) {
      toast.error(e.message ?? "Error al confirmar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-2xl">
        <h1 className="text-3xl font-bold">Checkout</h1>
        {!payment || !merchant ? (
          <p className="text-muted-foreground mt-4">Cargando información…</p>
        ) : (
          <div className="glass-surface p-6 mt-6 space-y-3">
            <p><strong>Negocio:</strong> {merchant.name}</p>
            <p><strong>Categoría:</strong> {merchant.category_id}</p>
            <p><strong>Monto:</strong> ${payment.amount_mxn} MXN</p>
            <p><strong>Estado:</strong> {payment.status}</p>
            <hr className="my-4 border-border" />
            <p className="text-sm text-muted-foreground">
              Cuando se conecte el proveedor de pagos, esta pantalla redirigirá automáticamente a su checkout.
              En modo de configuración inicial puedes simular la confirmación:
            </p>
            <Button onClick={simulatePaid} disabled={loading || payment.status === "succeeded"} className="w-full">
              {payment.status === "succeeded" ? "Ya pagado" : loading ? "Confirmando…" : "Confirmar pago (modo manual)"}
            </Button>
            <Link to="/catalogo" className="text-sm underline block text-center">Volver al catálogo</Link>
          </div>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
