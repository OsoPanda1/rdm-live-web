// Mock data for RDM DIGITAL

export const revenueData = [
  { name: "Ene", value: 42000 },
  { name: "Feb", value: 48000 },
  { name: "Mar", value: 55000 },
  { name: "Abr", value: 62000 },
  { name: "May", value: 58000 },
  { name: "Jun", value: 71000 },
  { name: "Jul", value: 85000 },
  { name: "Ago", value: 92000 },
  { name: "Sep", value: 78000 },
  { name: "Oct", value: 88000 },
  { name: "Nov", value: 95000 },
  { name: "Dic", value: 110000 },
];

export const occupancyData = [
  { name: "Lun", value: 45 },
  { name: "Mar", value: 52 },
  { name: "Mié", value: 58 },
  { name: "Jue", value: 63 },
  { name: "Vie", value: 82 },
  { name: "Sáb", value: 95 },
  { name: "Dom", value: 88 },
];

export const miningActivityData = [
  { name: "06:00", value: 12 },
  { name: "08:00", value: 35 },
  { name: "10:00", value: 78 },
  { name: "12:00", value: 95 },
  { name: "14:00", value: 110 },
  { name: "16:00", value: 130 },
  { name: "18:00", value: 105 },
  { name: "20:00", value: 72 },
  { name: "22:00", value: 28 },
];

export const energyNodesData = [
  { name: "El Portal", recharges: 245, revenue: 12400, type: "Pastería" },
  { name: "Real Cornish", recharges: 198, revenue: 9800, type: "Pastería" },
  { name: "La Plata Viva", recharges: 167, revenue: 15200, type: "Platería" },
  { name: "Mina del Oro", recharges: 312, revenue: 8900, type: "Pastería" },
  { name: "Artesanías RDM", recharges: 89, revenue: 6700, type: "Artesanías" },
];

export const zoneHeatmap = [
  { zone: "Plaza Principal", density: 95, trend: "up" as const },
  { zone: "Mina de Acosta", density: 78, trend: "up" as const },
  { zone: "Panteón Inglés", density: 62, trend: "stable" as const },
  { zone: "Barrio Inglés", density: 45, trend: "down" as const },
  { zone: "Cerro del Hiloche", density: 33, trend: "up" as const },
  { zone: "Museo de Medicina", density: 28, trend: "stable" as const },
];

export const b2bPlans = [
  { sector: "Hoteles", price: 500, businesses: 12, icon: "🏨" },
  { sector: "Bares", price: 450, businesses: 8, icon: "🍺" },
  { sector: "Pasterías/Platerías", price: 400, businesses: 15, icon: "🥧" },
  { sector: "Artesanías", price: 350, businesses: 22, icon: "🎨" },
  { sector: "Tiendas", price: 250, businesses: 18, icon: "🏪" },
  { sector: "Góndolas/Semifijos", price: 150, businesses: 35, icon: "🛒" },
];

export const mineralTypes = [
  { name: "Cuarzo", rarity: "Común", color: "silver", spawnRate: 40, value: 10 },
  { name: "Pirita", rarity: "Frecuente", color: "gold-dim", spawnRate: 30, value: 25 },
  { name: "Plata", rarity: "Raro", color: "silver", spawnRate: 20, value: 75 },
  { name: "Oro", rarity: "Épico", color: "gold", spawnRate: 10, value: 200 },
];

export const leaderboard = [
  { rank: 1, name: "MineroReal_23", minerals: 4520, level: 42, avatar: "⛏️" },
  { rank: 2, name: "CornishPick", minerals: 3890, level: 38, avatar: "🪨" },
  { rank: 3, name: "PlataViva", minerals: 3210, level: 35, avatar: "💎" },
  { rank: 4, name: "OroDelMonte", minerals: 2890, level: 33, avatar: "🏆" },
  { rank: 5, name: "VetaSoberana", minerals: 2450, level: 30, avatar: "⚡" },
];

export const sovereigntyMetrics = {
  localRetention: 73,
  externalLeakage: 27,
  circularEconomyIndex: 0.68,
  directRevenue: 284000,
  activeBusinesses: 110,
  monthlyPlayers: 2340,
};
