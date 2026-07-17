import { RDMLayout } from "@/components/rdm/RDMLayout";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Award, Loader2, LogOut, Save, Sparkles, Trophy, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(60),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  avatar_url: z.string().url().max(500).optional().or(z.literal("")),
});

interface BadgeRow { id: string; name: string; description: string; icon: string; category: string; points_required: number; }
interface UserBadgeRow { badge_id: string; earned_at: string; }
interface TxRow { id: string; action: string; points: number; created_at: string; }

function levelProgress(points: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(points / 100)) + 1);
  const curBase = (level - 1) ** 2 * 100;
  const nextBase = level ** 2 * 100;
  const pct = Math.min(100, ((points - curBase) / (nextBase - curBase)) * 100);
  return { level, pct, toNext: Math.max(0, nextBase - points), nextBase };
}

export default function Perfil() {
  const { user, profile, roles, loading, signOut, refreshProfile } = useRDMAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ display_name: "", bio: "", location: "", avatar_url: "" });
  const [allBadges, setAllBadges] = useState<BadgeRow[]>([]);
  const [earned, setEarned] = useState<UserBadgeRow[]>([]);
  const [history, setHistory] = useState<TxRow[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [b, ub, tx] = await Promise.all([
        supabase.from("badges").select("*").order("points_required"),
        supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
        supabase.from("point_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setAllBadges((b.data ?? []) as BadgeRow[]);
      setEarned((ub.data ?? []) as UserBadgeRow[]);
      setHistory((tx.data ?? []) as TxRow[]);
    })();
  }, [user, profile?.total_points]);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      const avatar_url = urlData.publicUrl;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url }).eq("id", user.id);
      if (updateError) throw updateError;
      setForm(prev => ({ ...prev, avatar_url }));
      await refreshProfile();
      toast({ title: "Avatar actualizado" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo subir el avatar", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const lp = levelProgress(profile.total_points);
  const earnedIds = new Set(earned.map((e) => e.badge_id));

  const handleSave = async () => {
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || null,
      location: parsed.data.location || null,
      avatar_url: parsed.data.avatar_url || null,
    }).eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Perfil actualizado" });
  };

  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 pt-24 pb-16 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rdm-glass rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-[hsl(var(--rdm-amber))]">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-2xl bg-[hsl(var(--rdm-amber))] text-white">
                  {profile.display_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Upload className="h-6 w-6 text-white" />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              <p className="text-sm text-muted-foreground">{user!.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </Button>
          </motion.div>

          {/* Level + Points */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[hsl(var(--rdm-amber))]" />
                  <span className="font-semibold">Nivel {lp.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-[hsl(var(--rdm-amber))]" />
                  <span className="font-bold text-lg">{profile.total_points}</span>
                  <span className="text-muted-foreground">pts</span>
                </div>
              </div>
              <Progress value={lp.pct} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {lp.toNext} puntos para nivel {lp.level + 1}
              </p>
            </CardContent>
          </Card>

          {/* Edit profile */}
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">Editar perfil</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input maxLength={60} value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Input maxLength={80} placeholder="Real del Monte, Hgo." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <p className="text-xs text-muted-foreground">Haz clic en tu avatar para subir una imagen, o ingresa una URL:</p>
                <Input type="url" placeholder="https://..." value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea maxLength={280} rows={3} placeholder="Cuéntanos sobre ti..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="bg-[hsl(var(--rdm-amber))] hover:opacity-90">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar
              </Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" /> Insignias ({earned.length}/{allBadges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allBadges.map((b) => {
                  const has = earnedIds.has(b.id);
                  return (
                    <div key={b.id} className={`p-4 rounded-xl border text-center transition-all ${has ? "bg-[hsl(var(--rdm-amber)/0.1)] border-[hsl(var(--rdm-amber))]" : "bg-muted/30 border-border opacity-50 grayscale"}`}>
                      <div className="text-3xl mb-1">{b.icon}</div>
                      <div className="text-xs font-semibold">{b.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{b.description}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5" /> Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no has ganado puntos. ¡Explora el pueblo!</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((tx) => (
                    <li key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                      <span className="capitalize">{tx.action.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</span>
                        <span className="font-semibold text-[hsl(var(--rdm-amber))]">+{tx.points}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RDMLayout>
  );
}
