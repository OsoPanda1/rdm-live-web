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
      community_photos: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          image_url: string
          post_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          user_id: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          id?: string
          image_url: string
          post_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          post_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_photos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          location_name: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          location_name?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          location_name?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["content_status"]
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          points: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      gamification_profiles: {
        Row: {
          badges: Json
          level: number
          points: number
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: Json
          level?: number
          points?: number
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: Json
          level?: number
          points?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      isabella_conversations: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          last_message_at: string
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          last_message_at?: string
          summary?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          last_message_at?: string
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      isabella_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          latency_ms: number | null
          role: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          role: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          role?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "isabella_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "isabella_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          amount_mxn: number
          created_at: string
          id: string
          merchant_id: string | null
          period_end: string | null
          period_start: string | null
          plan_code: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_mxn: number
          created_at?: string
          id?: string
          merchant_id?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_code: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_mxn?: number
          created_at?: string
          id?: string
          merchant_id?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_code?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_profiles: {
        Row: {
          address: string | null
          business_name: string
          category: string
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          owner_id: string
          phone: string | null
          plan_code: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          verified: boolean
        }
        Insert: {
          address?: string | null
          business_name: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          phone?: string | null
          plan_code?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          phone?: string | null
          plan_code?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          artist: string
          audio_url: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_seconds: number
          id: string
          kind: string
          popularity: number
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          theme: string | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          artist: string
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number
          id?: string
          kind?: string
          popularity?: number
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          theme?: string | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          artist?: string
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number
          id?: string
          kind?: string
          popularity?: number
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          theme?: string | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      pending_role_grants: {
        Row: {
          claimed_at: string | null
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          email: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      place_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          place_id: string
          rating: number
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          place_id: string
          rating: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          place_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "tourism_places"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          federation: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          federation?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          federation?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_orders: {
        Row: {
          created_at: string
          id: string
          items: Json
          provider_payment_id: string | null
          shipping_address: Json | null
          status: string
          total_mxn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          provider_payment_id?: string | null
          shipping_address?: Json | null
          status?: string
          total_mxn: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          provider_payment_id?: string | null
          shipping_address?: Json | null
          status?: string
          total_mxn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          inventory: number
          name: string
          price_mxn: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          inventory?: number
          name: string
          price_mxn: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          inventory?: number
          name?: string
          price_mxn?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      telemetry_pulses: {
        Row: {
          created_at: string
          federation: string
          id: string
          metadata: Json | null
          pulse_type: string
          value: number
        }
        Insert: {
          created_at?: string
          federation: string
          id?: string
          metadata?: Json | null
          pulse_type: string
          value?: number
        }
        Update: {
          created_at?: string
          federation?: string
          id?: string
          metadata?: Json | null
          pulse_type?: string
          value?: number
        }
        Relationships: []
      }
      tourism_places: {
        Row: {
          address: string | null
          category: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          short_description: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "merchant" | "user"
      content_status: "draft" | "published" | "archived"
      membership_status: "pending" | "active" | "past_due" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: ["admin", "merchant", "user"],
      content_status: ["draft", "published", "archived"],
      membership_status: ["pending", "active", "past_due", "cancelled"],
    },
  },
} as const
