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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          detail: Json | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_subscribed: boolean | null
          lat: number | null
          lng: number | null
          monthly_fee: number | null
          name: string
          owner_id: string | null
          sector: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_subscribed?: boolean | null
          lat?: number | null
          lng?: number | null
          monthly_fee?: number | null
          name: string
          owner_id?: string | null
          sector: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_subscribed?: boolean | null
          lat?: number | null
          lng?: number | null
          monthly_fee?: number | null
          name?: string
          owner_id?: string | null
          sector?: string
          updated_at?: string
        }
        Relationships: []
      }
      commerce_subscriptions: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          business_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dt_layer_items: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          layer_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          layer_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          layer_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dt_layer_items_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "dt_layers"
            referencedColumns: ["id"]
          },
        ]
      }
      dt_layers: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string | null
          starts_at: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          starts_at: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      federation_health_log: {
        Row: {
          avg_latency_ms: number
          degraded_count: number
          id: number
          integrity: number
          offline_count: number
          online_count: number
          recorded_at: string
          snapshot: Json
        }
        Insert: {
          avg_latency_ms: number
          degraded_count: number
          id?: number
          integrity: number
          offline_count: number
          online_count: number
          recorded_at?: string
          snapshot: Json
        }
        Update: {
          avg_latency_ms?: number
          degraded_count?: number
          id?: number
          integrity?: number
          offline_count?: number
          online_count?: number
          recorded_at?: string
          snapshot?: Json
        }
        Relationships: []
      }
      federation_thresholds: {
        Row: {
          created_at: string
          federation_key: string
          federation_name: string
          id: string
          max_latency_ms: number
          max_offline: number
          min_integrity: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          federation_key: string
          federation_name: string
          id?: string
          max_latency_ms?: number
          max_offline?: number
          min_integrity?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          federation_key?: string
          federation_name?: string
          id?: string
          max_latency_ms?: number
          max_offline?: number
          min_integrity?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      foot_traffic: {
        Row: {
          business_id: string | null
          count: number
          id: string
          place_id: string | null
          recorded_at: string
          source: string
          zone_key: string | null
        }
        Insert: {
          business_id?: string | null
          count?: number
          id?: string
          place_id?: string | null
          recorded_at?: string
          source?: string
          zone_key?: string | null
        }
        Update: {
          business_id?: string | null
          count?: number
          id?: string
          place_id?: string | null
          recorded_at?: string
          source?: string
          zone_key?: string | null
        }
        Relationships: []
      }
      mining_nodes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          lat: number
          lng: number
          mineral_type: string
          name: string
          point_value: number | null
          rarity: string
          spawn_rate: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          lat: number
          lng: number
          mineral_type?: string
          name: string
          point_value?: number | null
          rarity?: string
          spawn_rate?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          lat?: number
          lng?: number
          mineral_type?: string
          name?: string
          point_value?: number | null
          rarity?: string
          spawn_rate?: number | null
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          ended_at: string | null
          id: string
          mineral_type: string | null
          minerals_earned: number | null
          node_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          mineral_type?: string | null
          minerals_earned?: number | null
          node_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          mineral_type?: string | null
          minerals_earned?: number | null
          node_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "mining_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      music_donation_intents: {
        Row: {
          amount_mxn: number
          created_at: string
          id: string
          status: string
          stripe_session_id: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_mxn: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_mxn?: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_donation_intents_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          provider: string | null
          provider_session_id: string | null
          track_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          provider?: string | null
          provider_session_id?: string | null
          track_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          provider?: string | null
          provider_session_id?: string | null
          track_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_donations_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_plays: {
        Row: {
          id: string
          played_at: string
          track_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          played_at?: string
          track_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          played_at?: string
          track_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_plays_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_tracks: {
        Row: {
          artist: string
          audio_url: string | null
          cover_url: string | null
          created_at: string
          donation_url: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          moods: string[] | null
          slug: string
          sort_order: number | null
          territories: string[] | null
          title: string
        }
        Insert: {
          artist?: string
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          donation_url?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          moods?: string[] | null
          slug: string
          sort_order?: number | null
          territories?: string[] | null
          title: string
        }
        Update: {
          artist?: string
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          donation_url?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          moods?: string[] | null
          slug?: string
          sort_order?: number | null
          territories?: string[] | null
          title?: string
        }
        Relationships: []
      }
      paste_pois: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          order_index: number
          photos: Json | null
          slug: string
          svg_x: number
          svg_y: number
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          order_index?: number
          photos?: Json | null
          slug: string
          svg_x: number
          svg_y: number
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          order_index?: number
          photos?: Json | null
          slug?: string
          svg_x?: number
          svg_y?: number
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      paste_ratings: {
        Row: {
          created_at: string
          id: string
          poi_id: string
          review: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poi_id: string
          review?: string | null
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poi_id?: string
          review?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paste_ratings_poi_id_fkey"
            columns: ["poi_id"]
            isOneToOne: false
            referencedRelation: "paste_pois"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          lat: number
          lng: number
          name: string
          rating: number | null
          schedule: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lat: number
          lng: number
          name: string
          rating?: number | null
          schedule?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lat?: number
          lng?: number
          name?: string
          rating?: number | null
          schedule?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_premium: boolean | null
          level: number | null
          total_minerals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean | null
          level?: number | null
          total_minerals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean | null
          level?: number | null
          total_minerals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          code: string
          id: string
          redeemed_at: string
          reward_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code?: string
          id?: string
          redeemed_at?: string
          reward_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          redeemed_at?: string
          reward_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          business_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          monetary_value: number
          points_cost: number
          stock: number | null
          title: string
          type: Database["public"]["Enums"]["reward_type"]
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          monetary_value?: number
          points_cost?: number
          stock?: number | null
          title: string
          type?: Database["public"]["Enums"]["reward_type"]
        }
        Update: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          monetary_value?: number
          points_cost?: number
          stock?: number | null
          title?: string
          type?: Database["public"]["Enums"]["reward_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rewards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_premium: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          acknowledged: boolean
          created_at: string
          federation_key: string | null
          id: string
          message: string
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean
          created_at?: string
          federation_key?: string | null
          id?: string
          message: string
          severity: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean
          created_at?: string
          federation_key?: string | null
          id?: string
          message?: string
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      territorial_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      tour_availability: {
        Row: {
          capacity_left: number
          created_at: string
          date: string
          guide_id: string | null
          id: string
          is_active: boolean | null
          package_id: string
          time: string
        }
        Insert: {
          capacity_left?: number
          created_at?: string
          date: string
          guide_id?: string | null
          id?: string
          is_active?: boolean | null
          package_id: string
          time: string
        }
        Update: {
          capacity_left?: number
          created_at?: string
          date?: string
          guide_id?: string | null
          id?: string
          is_active?: boolean | null
          package_id?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_availability_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "tour_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_availability_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tour_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_bookings: {
        Row: {
          availability_id: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          package_id: string
          persons: number
          status: Database["public"]["Enums"]["booking_status"]
          total_paid: number
          user_id: string
        }
        Insert: {
          availability_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          package_id: string
          persons?: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_paid?: number
          user_id: string
        }
        Update: {
          availability_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          package_id?: string
          persons?: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_paid?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "tour_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tour_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_guides: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_active: boolean | null
          languages: string[] | null
          name: string
          rating: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name: string
          rating?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string
          rating?: number | null
        }
        Relationships: []
      }
      tour_packages: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration_min: number
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          max_capacity: number
          price: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_min?: number
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          max_capacity?: number
          price?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_min?: number
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          max_capacity?: number
          price?: number
          title?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          payload: Json | null
          route: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          route?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          route?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trivia_questions: {
        Row: {
          category: string | null
          correct_index: number
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          options: string[]
          question: string
        }
        Insert: {
          category?: string | null
          correct_index: number
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options: string[]
          question: string
        }
        Update: {
          category?: string | null
          correct_index?: number
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: string[]
          question?: string
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
      wiki_articles: {
        Row: {
          category: string
          content_md: string
          created_at: string
          excerpt: string | null
          hero_image: string | null
          id: string
          order_index: number
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_md: string
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_md?: string
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      app_role: "admin" | "operador" | "lector"
      booking_status: "pendiente" | "confirmada" | "completada" | "cancelada"
      reward_type: "descuento" | "producto" | "experiencia"
      subscription_plan: "mensual" | "trimestral"
      subscription_status: "activa" | "pendiente" | "cancelada" | "expirada"
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
      app_role: ["admin", "operador", "lector"],
      booking_status: ["pendiente", "confirmada", "completada", "cancelada"],
      reward_type: ["descuento", "producto", "experiencia"],
      subscription_plan: ["mensual", "trimestral"],
      subscription_status: ["activa", "pendiente", "cancelada", "expirada"],
    },
  },
} as const
