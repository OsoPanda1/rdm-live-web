import React from "react";
import { motion } from "framer-motion";
import { Play, Eye, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  id: string;
  thumbnail: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  views: number;
  likes: number;
  duration: string;
  isLive?: boolean;
  isFeatured?: boolean;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  thumbnail,
  title,
  creator,
  creatorAvatar,
  views,
  likes,
  duration,
  isLive,
  isFeatured,
  onClick
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer rounded-xl overflow-hidden",
        "bg-card/50 backdrop-blur-sm border border-border/30",
        "transition-all duration-300",
        isFeatured && "col-span-2 row-span-2"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Play button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-accent/30">
            <Play className="w-7 h-7 text-accent-foreground ml-1" fill="currentColor" />
          </div>
        </motion.div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
          {duration}
        </div>

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-red-500 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            EN VIVO
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Creator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary overflow-hidden">
            {creatorAvatar ? (
              <img src={creatorAvatar} alt={creator} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {creator[0]}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-foreground/90 truncate">{creator}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(likes)}
          </span>
        </div>
      </div>

      {/* Hover actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-card to-transparent"
      >
        <div className="flex items-center justify-around">
          <button className="p-2 rounded-full hover:bg-accent/20 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-accent/20 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-accent/20 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-accent/20 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface VideoGridProps {
  videos: VideoCardProps[];
  columns?: number;
  showFeatured?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ 
  videos, 
  columns = 5,
  showFeatured = true 
}) => {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      columns === 4 && "grid-cols-2 md:grid-cols-4",
      columns === 3 && "grid-cols-1 md:grid-cols-3"
    )}>
      {videos.map((video, index) => (
        <VideoCard 
          key={video.id} 
          {...video} 
          isFeatured={showFeatured && index === 0}
        />
      ))}
    </div>
  );
};

export default VideoCard;
