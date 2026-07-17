import { motion } from "framer-motion";
import { Heart, MessageCircle, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Post {
  id: string;
  title?: string | null;
  content: string;
  images?: string[];
  location?: string | null;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

export function PostCard({ post }: { post: Post }) {
  const firstImg = post.images?.[0];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {firstImg && (
          <div className="h-52 overflow-hidden">
            <img src={firstImg} alt="" loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-5 space-y-3">
          {post.title && <h3 className="font-display text-lg text-foreground">{post.title}</h3>}
          <p className="text-sm text-muted-foreground line-clamp-4">{post.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes_count ?? 0}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments_count ?? 0}</span>
            </div>
            {post.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{post.location}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
