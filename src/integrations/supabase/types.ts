// @ts-nocheck
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_email_whitelist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id: string
          name: string
          points_required?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes: number
          place_name: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number
          place_name?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number
          place_name?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          level: number
          location: string | null
          total_points: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          level?: number
          location?: string | null
          total_points?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          level?: number
          location?: string | null
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_public: boolean
          mime_type: string
          size_bytes: number | null
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          artist?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_public?: boolean
          mime_type: string
          size_bytes?: number | null
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          artist?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string
          size_bytes?: number | null
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string; name: string; description: string | null; category: string
          direccion: string | null; telefono: string | null; horario: string | null
          image_url: string | null; rating: number | null; lat: number | null; lng: number | null
          verified: boolean; status: string; created_at: string
        }
        Insert: {
          id?: string; name: string; description?: string | null; category: string
          direccion?: string | null; telefono?: string | null; horario?: string | null
          image_url?: string | null; rating?: number | null; lat?: number | null; lng?: number | null
          verified?: boolean; status?: string; created_at?: string
        }
        Update: {
          id?: string; name?: string; description?: string | null; category?: string
          direccion?: string | null; telefono?: string | null; horario?: string | null
          image_url?: string | null; rating?: number | null; lat?: number | null; lng?: number | null
          verified?: boolean; status?: string; created_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          id: string; name: string; description: string | null; type: string; duration: string
          price: number; image_url: string | null; includes: string[]; available: boolean
          status: string; created_at: string
        }
        Insert: {
          id?: string; name: string; description?: string | null; type: string; duration: string
          price: number; image_url?: string | null; includes?: string[]
          available?: boolean; status?: string; created_at?: string
        }
        Update: {
          id?: string; name?: string; description?: string | null; type?: string; duration?: string
          price?: number; image_url?: string | null; includes?: string[]
          available?: boolean; status?: string; created_at?: string
        }
        Relationships: []
      }
      shuttle_routes: {
        Row: {
          id: string; name: string; origin: string; destination: string
          departure_time: string; return_time: string; price: number; duration: string
          days_of_week: string[]; company_id: string | null; status: string
          available: boolean; created_at: string
          shuttle_companies: { name: string } | null
        }
        Insert: {
          id?: string; name: string; origin: string; destination: string
          departure_time: string; return_time: string; price: number; duration: string
          days_of_week?: string[]; company_id?: string | null; status?: string
          available?: boolean; created_at?: string
        }
        Update: {
          id?: string; name?: string; origin?: string; destination?: string
          departure_time?: string; return_time?: string; price?: number; duration?: string
          days_of_week?: string[]; company_id?: string | null; status?: string
          available?: boolean; created_at?: string
        }
        Relationships: []
      }
      transport_providers: {
        Row: {
          id: string; name: string; type: string; description: string | null
          phone: string | null; schedule: string | null; image_url: string | null
          verified: boolean; status: string; created_at: string
        }
        Insert: {
          id?: string; name: string; type: string; description?: string | null
          phone?: string | null; schedule?: string | null; image_url?: string | null
          verified?: boolean; status?: string; created_at?: string
        }
        Update: {
          id?: string; name?: string; type?: string; description?: string | null
          phone?: string | null; schedule?: string | null; image_url?: string | null
          verified?: boolean; status?: string; created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
    }
    Functions: {
      award_points: {
        Args: {
          _action: string
          _metadata?: Json
          _points: number
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "merchant" | "tourist"
    }
    CompositeTypes: {
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "merchant", "tourist"],
    },
  },
} as const
