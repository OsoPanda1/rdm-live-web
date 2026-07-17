import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Store, TrendingUp, CheckCircle,
  Clock, Star, MapPin, Phone,
  Plus, Search, Edit, Trash2, Eye, EyeOff
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Business categories
const BUSINESS_CATEGORIES = [
  { value: "GASTRONOMIA", label: "Gastronomía", icon: "🍽️" },
  { value: "HOSPEDAJE", label: "Hospedaje", icon: "🏨" },
  { value: "ARTESANIA", label: "Artesanía", icon: "🎨" },
  { value: "PLATERIA", label: "Platería", icon: "💍" },
  { value: "BAR", label: "Bar", icon: "🍺" },
  { value: "COMERCIO", label: "Comercio", icon: "🏪" },
  { value: "SERVICIOS", label: "Servicios", icon: "🔧" },
  { value: "TURISMO", label: "Turismo", icon: "🗺️" },
  { value: "OTROS", label: "Otros", icon: "📦" },
];

const PRICE_RANGES = [
  { value: "ECONOMICO", label: "Económico ($)" },
  { value: "MODERADO", label: "Moderado ($$)" },
  { value: "CARO", label: "Caro ($$$)" },
  { value: "LUJO", label: "Lujo ($$$$)" },
];

interface BusinessRow {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  description: string;
  short_description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  image_url2: string | null;
  image_url3: string | null;
  video_url: string | null;
  schedule_display: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  is_premium: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  price_range: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("businesses");
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRow | null>(null);

  const refreshBusinesses = async () => {
    const { data, error } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setBusinesses(data as BusinessRow[]);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshBusinesses();
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: fetch once on mount
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  function safeImageUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
    } catch { /* fall through */ }
    return "/placeholder.svg";
  }

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "GASTRONOMIA" as string,
    description: "",
    short_description: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    latitude: "",
    longitude: "",
    image_url: "",
    image_url2: "",
    image_url3: "",
    video_url: "",
    schedule_display: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    price_range: "MODERADO"
  });

  // Stats
  const stats = {
    total: businesses.length,
    active: businesses.filter(b => b.is_active).length,
    pending: businesses.filter(b => !b.is_verified).length,
    premium: businesses.filter(b => b.is_premium).length
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle form change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open new business dialog
  const handleNewBusiness = () => {
    setSelectedBusiness(null);
    setFormData({
      name: "",
      category: "GASTRONOMIA",
      description: "",
      short_description: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      address: "",
      latitude: "",
      longitude: "",
      image_url: "",
      image_url2: "",
      image_url3: "",
      video_url: "",
      schedule_display: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      price_range: "MODERADO"
    });
    setIsEditing(true);
  };

  // Open edit business dialog
  const handleEditBusiness = (business: BusinessRow) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name,
      category: business.category,
      description: business.description,
      short_description: business.short_description || "",
      phone: business.phone || "",
      whatsapp: business.whatsapp || "",
      email: business.email || "",
      website: business.website || "",
      address: business.address || "",
      latitude: business.latitude?.toString() || "",
      longitude: business.longitude?.toString() || "",
      image_url: business.image_url || "",
      image_url2: business.image_url2 || "",
      image_url3: business.image_url3 || "",
      video_url: business.video_url || "",
      schedule_display: business.schedule_display || "",
      facebook: business.facebook || "",
      instagram: business.instagram || "",
      tiktok: business.tiktok || "",
      price_range: business.price_range || "MODERADO"
    });
    setIsEditing(true);
  };

  // Save business
  const handleSaveBusiness = async () => {
    if (!formData.name || !formData.description) {
      toast({ title: "Error", description: "Por favor completa los campos requeridos", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      short_description: formData.short_description || null,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      email: formData.email || null,
      website: formData.website || null,
      address: formData.address || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      image_url: formData.image_url || null,
      image_url2: formData.image_url2 || null,
      image_url3: formData.image_url3 || null,
      video_url: formData.video_url || null,
      schedule_display: formData.schedule_display || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
      tiktok: formData.tiktok || null,
      price_range: formData.price_range || "MODERADO",
    };

    if (selectedBusiness) {
      const { error } = await supabase.from("businesses").update(payload).eq("id", selectedBusiness.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Éxito", description: "Negocio actualizado correctamente" });
    } else {
      const { error } = await supabase.from("businesses").insert({ ...payload, is_active: true, is_verified: false });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Éxito", description: "Negocio creado correctamente" });
    }

    await refreshBusinesses();
    setIsEditing(false);
    setSelectedBusiness(null);
  };

  // Toggle business status
  const handleToggleStatus = async (id: string) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;
    const { error } = await supabase.from("businesses").update({ is_active: !biz.is_active }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await refreshBusinesses();
    toast({ title: "Estado actualizado" });
  };

  // Toggle premium
  const handleTogglePremium = async (id: string) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;
    const { error } = await supabase.from("businesses").update({ is_premium: !biz.is_premium }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await refreshBusinesses();
    toast({ title: "Premium actualizado" });
  };

  // Toggle featured
  const handleToggleFeatured = async (id: string) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;
    const { error } = await supabase.from("businesses").update({ is_featured: !biz.is_featured }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await refreshBusinesses();
    toast({ title: "Destacado actualizado" });
  };

  // Delete business
  const handleDeleteBusiness = async (id: string) => {
    const { error } = await supabase.from("businesses").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await refreshBusinesses();
    toast({ title: "Eliminado" });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 pt-28 pb-12">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-8 h-8 text-white" />
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
                  Panel de Administración
                </h1>
              </div>
              <p className="text-white/80">
                Gestiona los negocios, dicho

s y contenido de RDM Digital
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 md:px-8 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Store className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Negocios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.premium}</p>
                    <p className="text-xs text-muted-foreground">Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 md:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="businesses">Negocios</TabsTrigger>
              <TabsTrigger value="dichos">Dichos del Pueblo</TabsTrigger>
              <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
            </TabsList>

            {/* Businesses Tab */}
            <TabsContent value="businesses">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar negocios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {BUSINESS_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleNewBusiness} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Negocio
                </Button>
              </div>

              {/* Business List */}
              <div className="space-y-4">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className={!business.is_active ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={business.image_url || "/placeholder.svg"} 
                            alt={business.name}
                            loading="lazy" className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{business.name}</h3>
                                {business.is_premium && (
                                  <Badge className="bg-amber-500">Premium</Badge>
                                )}
                                {business.is_featured && (
                                  <Badge className="bg-blue-500">Destacado</Badge>
                                )}
                                {!business.is_verified && (
                                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                    Pendiente
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {business.short_description}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleStatus(business.id)}
                                title={business.is_active ? "Desactivar" : "Activar"}
                              >
                                {business.is_active ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleTogglePremium(business.id)}
                                title="Toggle Premium"
                              >
                                <Star className={`w-4 h-4 ${business.is_premium ? "fill-amber-500 text-amber-500" : ""}`} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleFeatured(business.id)}
                                title="Toggle Destacado"
                              >
                                <TrendingUp className={`w-4 h-4 ${business.is_featured ? "text-blue-500" : ""}`} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditBusiness(business)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteBusiness(business.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {business.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {business.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {business.views_count} visitas
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Dichos Tab */}
            <TabsContent value="dichos">
              <Card>
                <CardHeader>
                  <CardTitle>Dichos del Pueblo</CardTitle>
                  <CardDescription>Gestiona los dichos mineros y tradiciones de Real del Monte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Dichos registrados: <strong>24</strong></p>
                      <Button size="sm">+ Nuevo Dicho</Button>
                    </div>
                    <div className="grid gap-3">
                      {[
                        { dicho: "El que nace pa' minero, del cielito le cae el pico", categoria: "Minería", estado: "Publicado" },
                        { dicho: "Más vale paste en mano que cien en el horno", categoria: "Gastronomía", estado: "Publicado" },
                        { dicho: "Cuando la niebla baja, el minero trabaja", categoria: "Minería", estado: "Publicado" },
                        { dicho: "Plata que brilla no es siempre la mejor", categoria: "Sabiduría", estado: "Borrador" },
                        { dicho: "El que come paste sin chile, no sabe lo que se pierde", categoria: "Gastronomía", estado: "Publicado" },
                      ].map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">«{d.dicho}»</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d.categoria}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.estado === "Publicado" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>{d.estado}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <Button variant="ghost" size="sm">Editar</Button>
                            <Button variant="ghost" size="sm" className="text-red-500">Eliminar</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Portal</CardTitle>
                  <CardDescription>Métricas clave de RDM Digital</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Usuarios", value: "847", change: "+12%" },
                      { label: "Negocios", value: "47", change: "+3" },
                      { label: "Lugares", value: "52", change: "+5" },
                      { label: "Visitas hoy", value: "1,234", change: "+28%" },
                    ].map(s => (
                      <div key={s.label} className="p-4 rounded-xl border border-border">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                        <span className="text-[10px] text-emerald-500">{s.change} vs ayer</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <h4 className="text-sm font-semibold mb-3">Actividad Reciente</h4>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {[
                        "Nuevo usuario registrado: ana@ejemplo.com",
                        "Negocio actualizado: Pastes El Portal",
                        "Comentario moderado en Muro Social",
                        "Donación recibida: $250 MXN",
                        "Nuevo lugar agregado: Mirador del Bosque",
                      ].map((a, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--rdm-amber))]" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Business Form Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedBusiness ? "Editar Negocio" : "Nuevo Negocio"}
              </DialogTitle>
              <DialogDescription>
                {selectedBusiness 
                  ? "Actualiza la información del negocio" 
                  : "Completa los datos del nuevo negocio para el directorio"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Negocio *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Pastes El Portal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría *</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => handleSelectChange("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rango de Precio</label>
                  <Select 
                    value={formData.price_range} 
                    onValueChange={(v) => handleSelectChange("price_range", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map(pr => (
                        <SelectItem key={pr.value} value={pr.value}>
                          {pr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Descripción * <span className="text-muted-foreground">(Máx 500 caracteres)</span>
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe el negocio, sus productos o servicios..."
                  maxLength={500}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción Corta</label>
                <Input
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  placeholder="Versión corta para el mapa y tarjetas"
                  maxLength={200}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="771 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp</label>
                  <Input
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="527711234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sitio Web</label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitud</label>
                  <Input
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="20.1397"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitud</label>
                  <Input
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="-98.6708"
                  />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Imágenes <span className="text-muted-foreground">(Máx 3)</span>
                </label>
              <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Input
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="URL Imagen 1"
                    />
                    {formData.image_url && (
                      <div className="w-full h-16 rounded overflow-hidden">
                        <img src={safeImageUrl(formData.image_url)} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      name="image_url2"
                      value={formData.image_url2}
                      onChange={handleInputChange}
                      placeholder="URL Imagen 2"
                    />
                      {formData.image_url2 && (
                      <div className="w-full h-16 rounded overflow-hidden">
                        <img src={safeImageUrl(formData.image_url2)} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      name="image_url3"
                      value={formData.image_url3}
                      onChange={handleInputChange}
                      placeholder="URL Imagen 3"
                    />
                    {formData.image_url3 && (
                      <div className="w-full h-16 rounded overflow-hidden">
                        <img src={safeImageUrl(formData.image_url3)} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Video <span className="text-muted-foreground">(Máx 60 segundos)</span>
                </label>
                  <Input
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="URL del video (YouTube, Vimeo)"
                  />
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Horario</label>
                  <Input
                    name="schedule_display"
                    value={formData.schedule_display}
                    onChange={handleInputChange}
                    placeholder="Lun-Vie: 9:00 - 18:00, Sáb: 10:00 - 14:00"
                  />
              </div>

              {/* Social Media */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facebook</label>
                  <Input
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <Input
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">TikTok</label>
                  <Input
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBusiness} className="bg-amber-600 hover:bg-amber-700">
                {selectedBusiness ? "Guardar Cambios" : "Crear Negocio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
