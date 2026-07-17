import { RDMLayout } from "@/components/rdm/RDMLayout";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PlanType = "monthly" | "yearly";

type Category =
  | "GASTRONOMIA"
  | "HOSPEDAJE"
  | "ARTESANIA"
  | "PLATERIA"
  | "BAR"
  | "COMERCIO"
  | "SERVICIOS"
  | "TURISMO"
  | "OTROS";

const defaultBusiness = {
  name: "",
  category: "GASTRONOMIA" as Category,
  description: "",
  phone: "",
  address: "",
};

export default function NegociosPortal() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState("");

  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [business, setBusiness] = useState(defaultBusiness);
  const [plan, setPlan] = useState<PlanType>("monthly");


  const handleBusinessLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: login.email, password: login.password });
      if (error) throw error;
      toast({ title: "Sesión iniciada", description: "Acceso de comercio habilitado." });
      navigate("/admin/dashboard");
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo iniciar sesión", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSignup = async (event: FormEvent) => {
    event.preventDefault();

    if (signup.password !== signup.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signup.email,
        password: signup.password,
        options: { data: { display_name: signup.name, role: "business_owner" } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      const { data: bizData, error: bizError } = await supabase.from("businesses").insert({
        owner_id: authData.user.id,
        name: business.name,
        category: business.category,
        description: business.description,
        phone: business.phone || null,
        address: business.address || null,
        is_active: false,
        is_verified: false,
      }).select("id").single();
      if (bizError) throw bizError;

      setBusinessId(bizData.id);
      toast({ title: "¡Registro completado!", description: "Tu negocio fue creado. Revisa tu email para confirmar la cuenta." });
    } catch (error) {
      toast({
        title: "Error al crear negocio",
        description: error instanceof Error ? error.message : "No se pudo crear el negocio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!businessId) {
      toast({ title: "Falta businessId", description: "Registra o pega el ID de tu negocio para pagar.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("businesses").update({
        is_premium: true,
        premium_expires_at: plan === "yearly"
          ? new Date(Date.now() + 365 * 86400000).toISOString()
          : new Date(Date.now() + 30 * 86400000).toISOString(),
      }).eq("id", businessId);
      if (error) throw error;
      toast({ title: "Plan activado", description: `Plan ${plan === "yearly" ? "anual" : "mensual"} activado. Stripe pendiente de integrar.` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Error al activar plan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6">
          <h1 className="font-serif text-3xl text-gold-400">Portal de comercios RDM Digital</h1>
          <p className="mt-2 text-sm text-silver-500">Alta de negocios, acceso para comercios y pago online mensual para aparecer en el catálogo.</p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-night-800/70 p-4">
            <Tabs defaultValue="signup">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signup">Registro comercio</TabsTrigger>
                <TabsTrigger value="login">Login comercio</TabsTrigger>
                <TabsTrigger value="payments">Pago online</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="mt-4">
                <form className="grid gap-3 md:grid-cols-2" onSubmit={handleBusinessSignup}>
                  <div>
                    <Label>Nombre del propietario</Label>
                    <Input value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Email de acceso</Label>
                    <Input type="email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <Input type="password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required minLength={6} />
                  </div>
                  <div>
                    <Label>Confirmar contraseña</Label>
                    <Input type="password" value={signup.confirmPassword} onChange={(e) => setSignup({ ...signup, confirmPassword: e.target.value })} required minLength={6} />
                  </div>
                  <div>
                    <Label>Nombre del negocio</Label>
                    <Input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={business.category}
                      onChange={(e) => setBusiness({ ...business, category: e.target.value as Category })}
                    >
                      {["GASTRONOMIA", "HOSPEDAJE", "ARTESANIA", "PLATERIA", "BAR", "COMERCIO", "SERVICIOS", "TURISMO", "OTROS"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Input value={business.description} onChange={(e) => setBusiness({ ...business, description: e.target.value })} required minLength={10} />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Dirección</Label>
                    <Input value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Button disabled={loading} type="submit" className="w-full">Crear cuenta y negocio</Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="login" className="mt-4">
                <form className="grid gap-3 md:grid-cols-2" onSubmit={handleBusinessLogin}>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <Input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
                  </div>
                  <div className="md:col-span-2">
                    <Button disabled={loading} type="submit" className="w-full">Iniciar sesión de comercio</Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="payments" className="mt-4 space-y-3">
                <p className="text-sm text-silver-500">El pago mensual activa tu negocio como destacado en el catálogo de RDM Digital.</p>

                <div>
                  <Label>ID de negocio</Label>
                  <Input value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="Pega aquí tu businessId" />
                </div>
                <div>
                  <Label>Plan</Label>
                  <div className="mt-1 flex gap-2">
                    <Button type="button" variant={plan === "monthly" ? "default" : "outline"} onClick={() => setPlan("monthly")}>Mensual</Button>
                    <Button type="button" variant={plan === "yearly" ? "default" : "outline"} onClick={() => setPlan("yearly")}>Anual</Button>
                  </div>
                </div>
                <Button disabled={loading || !businessId} onClick={handleCheckout} className="w-full">Pagar online y activar plan</Button>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RDMLayout>
  );
}
