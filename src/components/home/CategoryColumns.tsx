/**
 * Category Columns - 4 columnas verticales con parallax
 * Grupos, Noticias, Hashtags/Lotería, Conciertos/Música
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Newspaper, Hash, Ticket, Music, Radio, 
  TrendingUp, MessageCircle, Flame, Crown, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipos de datos
interface GroupItem {
  id: string;
  name: string;
  avatar: string;
  members: number;
  isActive: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  category: string;
  isLive: boolean;
  timestamp: string;
}

interface HashtagItem {
  id: string;
  tag: string;
  count: number;
  trending: boolean;
}

interface LotteryItem {
  id: string;
  name: string;
  prize: string;
  endsIn: string;
}

interface ConcertItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  isLive: boolean;
  viewers?: number;
}

// Columna de Grupos
const GroupsColumn: React.FC<{ groups: GroupItem[] }> = ({ groups }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Users className="w-5 h-5 text-cyan-400" />
      <h3 className="font-bold">Grupos & Canales</h3>
    </div>
    {groups.map((group, i) => (
      <motion.div
        key={group.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ x: 5 }}
        className="flex items-center gap-3 p-2 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors"
      >
        <img 
          src={group.avatar} 
          alt={group.name} 
          loading="lazy" className="w-10 h-10 rounded-full ring-2 ring-cyan-400/30"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{group.name}</p>
          <p className="text-xs text-muted-foreground">{group.members.toLocaleString()} miembros</p>
        </div>
        {group.isActive && (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
      </motion.div>
    ))}
  </div>
);

// Columna de Noticias
const NewsColumn: React.FC<{ news: NewsItem[] }> = ({ news }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Newspaper className="w-5 h-5 text-purple-400" />
      <h3 className="font-bold">Noticias & Trends</h3>
    </div>
    {news.map((item, i) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ x: 5 }}
        className="p-3 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors"
      >
        <div className="flex items-start gap-2">
          {item.isLive && (
            <Badge variant="destructive" className="text-[10px] shrink-0">
              <Radio className="w-2 h-2 mr-1" />
              LIVE
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] shrink-0">{item.category}</Badge>
        </div>
        <p className="font-medium text-sm mt-2 line-clamp-2">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
      </motion.div>
    ))}
  </div>
);

// Columna de Hashtags y Lotería
const HashtagsLotteryColumn: React.FC<{ hashtags: HashtagItem[]; lottery: LotteryItem[] }> = ({ hashtags, lottery }) => (
  <div className="space-y-6">
    {/* Hashtags */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-5 h-5 text-pink-400" />
        <h3 className="font-bold">Trending</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag, i) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge 
              variant="outline" 
              className={`cursor-pointer ${tag.trending ? 'border-pink-400 text-pink-400' : ''}`}
            >
              {tag.trending && <Flame className="w-3 h-3 mr-1" />}
              #{tag.tag}
              <span className="ml-1 text-muted-foreground">{tag.count}</span>
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Lotería */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="w-5 h-5 text-amber-400" />
        <h3 className="font-bold">Lotería TAMV</h3>
      </div>
      {lottery.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400">{item.name}</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm text-foreground mt-1">Premio: {item.prize}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Zap className="w-3 h-3" />
            Termina en: {item.endsIn}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Columna de Conciertos y Música
const ConcertsColumn: React.FC<{ concerts: ConcertItem[] }> = ({ concerts }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Music className="w-5 h-5 text-green-400" />
      <h3 className="font-bold">Conciertos & Música</h3>
    </div>
    {concerts.map((concert, i) => (
      <motion.div
        key={concert.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="relative rounded-lg overflow-hidden cursor-pointer group"
      >
        <img 
          src={concert.thumbnail} 
          alt={concert.title}
          loading="lazy" className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="font-medium text-sm truncate">{concert.title}</p>
          <p className="text-xs text-muted-foreground">{concert.artist}</p>
        </div>
        {concert.isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded text-xs text-white">
            <Radio className="w-3 h-3 animate-pulse" />
            {concert.viewers?.toLocaleString()}
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

// Componente principal
const CategoryColumns: React.FC = () => {
  // Datos de ejemplo
  const groups: GroupItem[] = [
    { id: '1', name: 'TAMV Developers', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=dev', members: 2450, isActive: true },
    { id: '2', name: 'Creadores Elite', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=elite', members: 8900, isActive: true },
    { id: '3', name: 'XR Explorers', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=xr', members: 5200, isActive: false },
    { id: '4', name: 'Música Sensitiva', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=music', members: 12000, isActive: true },
  ];

  const news: NewsItem[] = [
    { id: '1', title: 'TAMV lanza nuevo protocolo Fénix Rex 4.0', category: 'Tech', isLive: false, timestamp: 'hace 2h' },
    { id: '2', title: 'Concierto sensorial rompe récord de asistencia', category: 'Eventos', isLive: true, timestamp: 'AHORA' },
    { id: '3', title: 'Isabella AI alcanza 1M de conversaciones', category: 'IA', isLive: false, timestamp: 'hace 5h' },
  ];

  const hashtags: HashtagItem[] = [
    { id: '1', tag: 'TAMVOnline', count: 45000, trending: true },
    { id: '2', tag: 'IsabellaAI', count: 23000, trending: true },
    { id: '3', tag: 'DreamSpaces', count: 18000, trending: false },
    { id: '4', tag: 'MetaversoDestructor', count: 12000, trending: true },
    { id: '5', tag: 'CreadoresUnidos', count: 8500, trending: false },
  ];

  const lottery: LotteryItem[] = [
    { id: '1', name: 'Sorteo Celestial', prize: '50,000 TAU', endsIn: '2h 30m' },
    { id: '2', name: 'Rifa XR Premium', prize: 'DreamSpace VIP', endsIn: '1d 5h' },
  ];

  const concerts: ConcertItem[] = [
    { id: '1', title: 'Sinfonía Cuántica', artist: 'DJ Nebula', thumbnail: '/images/dia-muertos.jpg', isLive: true, viewers: 15420 },
    { id: '2', title: 'Ecos del Metaverso', artist: 'Isabella Orchestra', thumbnail: '/images/penas-cargadas.jpg', isLive: false },
    { id: '3', title: 'Noche de Creadores', artist: 'Various Artists', thumbnail: '/images/plaza-noche.jpg', isLive: false },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
      <GroupsColumn groups={groups} />
      <NewsColumn news={news} />
      <HashtagsLotteryColumn hashtags={hashtags} lottery={lottery} />
      <ConcertsColumn concerts={concerts} />
    </section>
  );
};

export default CategoryColumns;
