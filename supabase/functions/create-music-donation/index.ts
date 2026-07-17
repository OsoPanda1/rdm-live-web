// ============================================================================
// RDM Digital OS — Edge Function: Music Streaming & Sovereign Donation Engine v4.0
// Identidad: Silver & Mist Sovereign — Plata pulida, Platino y Crystal Glow
// ============================================================================
import { createStripe, safeError } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ============================================================================
// CATÁLOGO DE ACTIVOS MUSICALES SOBERANOS (src/assets)
// Metadatos Inmersivos para Renderizado de Nueva Generación en el Frontend
// ============================================================================
interface Track {
  id: string;
  title: string;
  src: string;
  genre: string;
  visualConfig: {
    ambientColor: string; // Frecuencia lumínica para el ecualizador 3D
    glowIntensity: string;
    shimmerMode: "mercury" | "platinum" | "ghost_silk";
    waveType: "sierreño_12str" | "deep_tololoche" | "ambient_mist" | "industrial_metal";
  };
}

const MUSIC_CATALOG: Record<string, Track> = {
  "mi-pueblito": {
    id: "mi-pueblito",
    title: "Mi Pueblito (Ecos del Real)",
    src: "/src/assets/mi_pueblito.mp3",
    genre: "Sad Sierreño / Orgullo Regional",
    visualConfig: {
      ambientColor: "#E5E4E2", // Pure Platinum
      glowIntensity: "rgba(240, 248, 255, 0.4)", // Crystal Glow suave
      shimmerMode: "platinum",
      waveType: "sierreño_12str"
    }
  },
  "sed-de-ti": {
    id: "sed-de-ti",
    title: "Sed de Ti (Lágrimas de Mercurio)",
    src: "/src/assets/sed_deti.mp3",
    genre: "Corrido Tumbado Romántico / Despecho",
    visualConfig: {
      ambientColor: "#8E8E8E", // Sterling Silver
      glowIntensity: "rgba(240, 248, 255, 0.6)", // Crystal Glow intenso
      shimmerMode: "mercury",
      waveType: "deep_tololoche"
    }
  },
  "mi-viejo": {
    id: "mi-viejo",
    title: "Mi Viejo (Memorias del Minero Narciso)",
    src: "/src/assets/mi_viejo.mp3",
    genre: "Mística Barretera / Corrido de Altura",
    visualConfig: {
      ambientColor: "#0A0A0B", // Obsidian Deep
      glowIntensity: "rgba(229, 228, 226, 0.3)", // Platino sutil
      shimmerMode: "ghost_silk",
      waveType: "ambient_mist"
    }
  },
  "angels-in-the-cold": {
    id: "angels-in-the-cold",
    title: "Angels in the Cold (Neblina Invernal)",
    src: "/src/assets/angelsinthecold.mp3",
    genre: "Techno-House Industrial / Experimental",
    visualConfig: {
      ambientColor: "#F0F8FF", // Pure Crystal Glow
      glowIntensity: "rgba(240, 248, 255, 0.85)", // Máxima luminiscencia perlada
      shimmerMode: "ghost_silk",
      waveType: "industrial_metal"
    }
  }
};

// ============================================================================
// MANEJADOR PRINCIPAL (CORE SERVERLESS)
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const method = req.method;
  
  try {
    // ---- PROTOCOLO GET: Recuperación del Catálogo e Interfaces de Audio ----
    if (method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          engine: "EOCT-Music-Kernel-v4",
          uiTheme: {
            base: "Obsidian Deep (#0A0A0B)",
            accent: "Pure Platinum (#E5E4E2)",
            glow: "Crystal Glow (#F0F8FF)",
            glassmorphism: "blur(20px)"
          },
          catalog: Object.values(MUSIC_CATALOG)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- PROTOCOLO POST: Orquestación de Checkout y Micro-donativos ----
    if (method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { amount_mxn = 25, track_id = null } = body;

      // Validación estricta de límites financieros (Soberanía de Fondos)
      const amount = Math.max(25, Math.floor(Number(amount_mxn)));
      if (!Number.isFinite(amount) || amount < 25) {
        throw new Error("El protocolo de RDM Digital exige un micro-donativo mínimo de 25 MXN.");
      }

      const stripe = createStripe();

      // Verificación de Identidad Descentralizada a través de Supabase Auth
      const authHeader = req.headers.get("Authorization");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
      );

      let userId: string | null = null;
      let email: string | undefined;
      
      if (authHeader) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id ?? null;
        email = data.user?.email ?? undefined;
      }

      // Resolución de metadatos de la pista seleccionada
      const track = track_id ? MUSIC_CATALOG[track_id] : null;
      const finalTrackTitle = track ? track.title : "Legado RDM Digital General";

      const origin = req.headers.get("origin") || Deno.env.get("PRODUCTION_ORIGIN") || "https://visitarealdelmonte.online";

      // Creación de la sesión de pasarela inteligente
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Preservación Digital · ${finalTrackTitle}`,
              description: "Sustenta la soberanía tecnológica de la UTAMV, la red de RDM Digital y TAMV ONLINE Records.",
            },
            unit_amount: amount * 100, // Conversión a centavos
          },
          quantity: 1,
        }],
        metadata: {
          user_id: userId ?? "anon",
          track_id: track_id ?? "general_rdm",
          kind: "music_donation_v4",
          federation_node: "Nodo_Cero_Real_Del_Monte"
        },
        success_url: `${origin}/music?donation=success&track=${track_id ?? ""}`,
        cancel_url: `${origin}/music?donation=cancel`,
      });

      // Registro inmutable de intención de pago para auditoría del Dashboard de las 7 Federaciones
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      await admin.from("music_donation_intents").insert({
        user_id: userId,
        track_id: track_id,
        amount_mxn: amount,
        stripe_session_id: session.id,
        status: "pending",
        metadata: {
          track_title: finalTrackTitle,
          engine_version: "MD-X5-Audio-Core"
        }
      });

      return new Response(
        JSON.stringify({ 
          url: session.url,
          trackMetadata: track // Devuelve los parámetros de renderizado visual al cliente
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Method Not Allowed");

  } catch (e) {
    return safeError(e);
  }
});
