import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Category { id: string; name: string; fee_mxn: number; }

export default function ComerciosRegistro() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState({
    category_id: "", name: "", description: "", address: "",
    latitude: "", longitude: "", phone: "", website: "", main_image: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.from("merchant_categories").select("id,name,fee_mxn").eq("active", true).order("name")
      .then(({ data }) => setCategories(data ?? []));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/comercios/registro` },
      });
      if (error) toast.error(error.message); else toast.success("Revisa tu correo para confirmar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocalización no disponible");
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) })),
      () => toast.error("No se pudo obtener tu ubicación"),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-merchant-payment", {
        body: {
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          tags: [],
        },
      });
      if (error) throw error;
      toast.success("Registro creado. Redirigiendo al pago…");
      window.location.href = data.checkout_url;
    } catch (err: any) {
      toast.error(err.message ?? "Error al crear el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Registra tu negocio</h1>
          <p className="text-muted-foreground mt-2">
            Tras tu pago, tu ficha aparece automáticamente en el catálogo digital de RDM·X.
          </p>
        </header>

        {!session ? (
          <form onSubmit={handleAuth} className="glass-surface p-6 space-y-4">
            <h2 className="text-xl font-semibold">{authMode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h2>
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">{authMode === "login" ? "Entrar" : "Registrarme"}</Button>
            <button type="button" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground underline w-full">
              {authMode === "login" ? "¿No tienes cuenta? Crea una" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="glass-surface p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select required className="w-full border rounded-md p-2 bg-background"
                  value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Selecciona…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — ${c.fee_mxn} MXN</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nombre del negocio</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="outline" onClick={useMyLocation} className="w-full">Usar mi ubicación</Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sitio web</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL de imagen principal</Label>
              <Input value={form.main_image} onChange={(e) => setForm({ ...form, main_image: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Procesando…" : "Continuar al pago"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Tu ficha se publicará automáticamente al confirmarse el pago vía webhook.
            </p>
          </form>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
