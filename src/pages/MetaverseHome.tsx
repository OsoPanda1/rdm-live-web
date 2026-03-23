// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Bell, Wallet, Globe, User, Settings, CreditCard, 
  ShoppingBag, Shield, Home, Users, Music, Sparkles, 
  GraduationCap, Image, Gavel, Bot, PawPrint, Store,
  TrendingUp, Award, Ticket, Zap, MessageCircle, Video
} from "lucide-react";
import Matrix3DEffect from "@/components/metaverse/Matrix3DEffect";
import RetractableToolbar from "@/components/metaverse/RetractableToolbar";
import StoriesSection from "@/components/metaverse/StoriesSection";
import SocialWall from "@/components/metaverse/SocialWall";
import ModulesGrid from "@/components/metaverse/ModulesGrid";
import { VideoGrid } from "@/components/metaverse/VideoCard";

const MetaverseHome: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<string | undefined>();

  // Toolbar configurations
  const topBarItems = [
    { id: "home", icon: <Home className="w-5 h-5" />, label: "Inicio" },
    { id: "search", icon: <Search className="w-5 h-5" />, label: "Buscar" },
    { id: "profile", icon: <User className="w-5 h-5" />, label: "Perfil", badge: 3 },
    { id: "notifications", icon: <Bell className="w-5 h-5" />, label: "Notificaciones", badge: 12 },
    { id: "wallet", icon: <Wallet className="w-5 h-5" />, label: "NubiWallet" },
    { id: "global", icon: <Globe className="w-5 h-5" />, label: "Muro Global" },
  ];

  const leftBarItems = [
    { id: "dreamspaces", icon: <Sparkles className="w-5 h-5" />, label: "Dream Spaces" },
    { id: "channels", icon: <Users className="w-5 h-5" />, label: "Mis Canales" },
    { id: "groups", icon: <MessageCircle className="w-5 h-5" />, label: "Mis Grupos" },
    { id: "videos", icon: <Video className="w-5 h-5" />, label: "Mis Videos" },
    { id: "music", icon: <Music className="w-5 h-5" />, label: "Mi Música" },
  ];

  const rightBarItems = [
    { id: "trending", icon: <TrendingUp className="w-5 h-5" />, label: "Tendencias" },
    { id: "university", icon: <GraduationCap className="w-5 h-5" />, label: "Universidad TAMV" },
    { id: "lottery", icon: <Ticket className="w-5 h-5" />, label: "Lotería TAMV" },
    { id: "popular", icon: <Award className="w-5 h-5" />, label: "Populares" },
    { id: "isabella", icon: <Bot className="w-5 h-5" />, label: "Isabella AI" },
  ];

  const bottomBarItems = [
    { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Ajustes" },
    { id: "monetization", icon: <CreditCard className="w-5 h-5" />, label: "Monetización" },
    { id: "payments", icon: <Wallet className="w-5 h-5" />, label: "Pagos" },
    { id: "membership", icon: <Award className="w-5 h-5" />, label: "Membresías" },
    { id: "marketplace", icon: <ShoppingBag className="w-5 h-5" />, label: "Marketplace" },
    { id: "security", icon: <Shield className="w-5 h-5" />, label: "Seguridad" },
  ];

  // Mock data
  const mockStories = Array.from({ length: 12 }, (_, i) => ({
    id: `story-${i}`,
    username: `creator_${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    hasNew: i < 5,
  }));

  const mockVideos = Array.from({ length: 11 }, (_, i) => ({
    id: `video-${i}`,
    thumbnail: `https://picsum.photos/seed/${i + 100}/640/360`,
    title: `Contenido Exclusivo #${i + 1} - Experiencia Inmersiva`,
    creator: `Creator ${i + 1}`,
    creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 50}`,
    views: Math.floor(Math.random() * 100000),
    likes: Math.floor(Math.random() * 10000),
    duration: `${Math.floor(Math.random() * 20) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    isLive: i === 0,
  }));

  const mockPosts = Array.from({ length: 10 }, (_, i) => ({
    id: `post-${i}`,
    author: {
      id: `user-${i}`,
      name: `Creador ${i + 1}`,
      username: `creator${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 200}`,
      verified: i < 3,
    },
    content: "Explorando las infinitas posibilidades del metaverso TAMV. ¡El futuro de las redes sociales está aquí! 🚀✨",
    media: i % 2 === 0 ? [{ type: "image" as const, url: `https://picsum.photos/seed/${i + 300}/800/600` }] : undefined,
    likes: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 200),
    timestamp: "hace 2h",
    visibility: "public" as const,
    federationHash: `0x${Math.random().toString(16).slice(2, 18)}`,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Matrix 3D Background */}
      <Matrix3DEffect showHero={false} />

      {/* 4 Retractable Toolbars */}
      <RetractableToolbar position="top" items={topBarItems} notificationType={activeNotification as any} />
      <RetractableToolbar position="left" items={leftBarItems} />
      <RetractableToolbar position="right" items={rightBarItems} />
      <RetractableToolbar position="bottom" items={bottomBarItems} />

      {/* Main Content */}
      <main className="relative z-10 pt-16 pb-16 px-16 space-y-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4"
            style={{
              background: "linear-gradient(180deg, #fff 0%, #00f0ff 50%, #0066ff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 40px rgba(0, 240, 255, 0.5)"
            }}
          >
            TAMV ONLINE
          </h1>
          <p className="text-xl text-red-400 tracking-[0.2em] font-bold">EL METAVERSO DESTRUCTOR</p>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Redefiniendo el futuro de las redes sociales. Donde los creadores son los verdaderos héroes.
          </p>
        </motion.section>

        {/* Featured Videos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
            Contenido Destacado
          </h2>
          <VideoGrid videos={mockVideos} columns={5} showFeatured />
        </section>

        {/* Stories */}
        <StoriesSection stories={mockStories} />

        {/* Social Wall */}
        <SocialWall posts={mockPosts} />

        {/* Modules Grid */}
        <ModulesGrid />

        {/* Additional Sections */}
        <section className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Marketplace", icon: ShoppingBag, color: "from-emerald-600 to-green-600" },
            { title: "Galería de Arte", icon: Image, color: "from-violet-600 to-purple-600" },
            { title: "Subastas", icon: Gavel, color: "from-amber-600 to-orange-600" },
          ].map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.02 }}
              className={`p-8 rounded-2xl bg-gradient-to-br ${item.color} cursor-pointer`}
            >
              <item.icon className="w-10 h-10 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default MetaverseHome;
