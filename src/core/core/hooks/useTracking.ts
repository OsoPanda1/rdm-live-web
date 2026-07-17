/**
 * Tracking client — envía eventos al Edge Function `ingest-event`.
 * Debe fallar silenciosamente: jamás rompe la UX.
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "rdm_session_id";
const OFFLINE_QUEUE_KEY = "rdm_tracking_offline_queue";
const OFFLINE_QUEUE_MAX = 200;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function getSessionId(): string | null {
  if (!isBrowser()) return null;

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      id = crypto.randomUUID();
    } else {
      id = `rdm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      // si no podemos guardar, seguimos con el id en memoria
    }
  }
  return id;
}

export type RdmEventType =
  | "page_view"
  | "click"
  | "route_suggestion"
  | "commerce_view"
  | "commerce_click"
  | "donation_started"
  | "donation_completed"
  | "membership_started"
  | "membership_completed"
  | "wall_post_created"
  | "wall_post_liked"
  | "map_interaction"
  | "map_layer_toggled"
  | "legend_view"
  | "community_story_view"
  | "custom";

export interface TrackPayload {
  event_type: RdmEventType;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
  route?: string;
  external_session_id?: string;
  /**
   * Si es true, indica al backend que debe anonimizar IP
   * (por ejemplo, truncando direcciones o usando agregación).
   */
  anonymize_ip?: boolean;
}

interface InternalTrackBody extends TrackPayload {
  session_id: string | null;
  route?: string;
  timestamp: string;
  sdk: string;
  sdk_version: string;
  user_agent?: string;
  referrer?: string;
}

/**
 * Manejo de cola offline en localStorage.
 */

function loadOfflineQueue(): InternalTrackBody[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as InternalTrackBody[];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: InternalTrackBody[]): void {
  if (!isBrowser()) return;
  try {
    // limitamos el tamaño para no crecer indefinidamente
    const trimmed =
      queue.length > OFFLINE_QUEUE_MAX
        ? queue.slice(queue.length - OFFLINE_QUEUE_MAX)
        : queue;
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignorar problemas de espacio/cupo
  }
}

async function flushOfflineQueue(): Promise<void> {
  if (!isBrowser()) return;
  if (!navigator.onLine) return;

  const queue = loadOfflineQueue();
  if (!queue.length) return;

  const remaining: InternalTrackBody[] = [];

  for (const event of queue) {
    try {
      if (!supabase?.functions) {
        remaining.push(event);
        continue;
      }

      await supabase.functions.invoke("ingest-event", {
        body: event,
      });
      // si no lanza error, se considera enviado
    } catch {
      // si falla este evento, lo dejamos en la cola
      remaining.push(event);
    }
  }

  saveOfflineQueue(remaining);
}

/**
 * Envía un evento a Supabase o lo deja en cola offline si no hay conexión.
 */
async function sendOrQueueEvent(body: InternalTrackBody): Promise<void> {
  try {
    // Primero intentamos flush de la cola anterior.
    await flushOfflineQueue();

    // Si no hay cliente o no hay conexión, encolamos.
    if (!supabase?.functions || (isBrowser() && !navigator.onLine)) {
      const queue = loadOfflineQueue();
      queue.push(body);
      saveOfflineQueue(queue);
      return;
    }

    await supabase.functions.invoke("ingest-event", { body });
  } catch {
    // En caso de fallo, volvemos a encolar para otro intento.
    const queue = loadOfflineQueue();
    queue.push(body);
    saveOfflineQueue(queue);
  }
}

/**
 * API pública de tracking genérico.
 */
export async function track(input: TrackPayload): Promise<void> {
  try {
    const sessionId = input.external_session_id ?? getSessionId();
    const route =
      input.route ??
      (isBrowser()
        ? window.location.pathname + window.location.search
        : undefined);

    const userAgent =
      isBrowser() && typeof navigator !== "undefined"
        ? navigator.userAgent
        : undefined;

    const referrer =
      isBrowser() && typeof document !== "undefined"
        ? document.referrer || undefined
        : undefined;

    const body: InternalTrackBody = {
      ...input,
      session_id: sessionId,
      route,
      timestamp: new Date().toISOString(),
      sdk: "rdm-web",
      sdk_version: "1.1.0",
      user_agent: userAgent,
      referrer,
    };

    await sendOrQueueEvent(body);
  } catch {
    // swallow — tracking nunca rompe UX
  }
}

/**
 * Hook básico de tracking.
 */
export function useTracking() {
  const trackEvent = useCallback((input: TrackPayload) => track(input), []);
  return { track: trackEvent };
}

/**
 * Helper especializado para el Plano Turístico del RDM.
 *
 * Ejemplo:
 *   const tourism = useTourismTracking();
 *   tourism.trackPageView("/historia");
 *   tourism.trackMapInteraction("zoom", { level: 14 });
 */
export function useTourismTracking(options?: { anonymizeIp?: boolean }) {
  const { track: baseTrack } = useTracking();
  const anonymizeIp = options?.anonymizeIp ?? true;

  const withDefaults = useCallback(
    (input: Omit<TrackPayload, "anonymize_ip">) =>
      baseTrack({
        ...input,
        anonymize_ip: anonymizeIp,
      }),
    [baseTrack, anonymizeIp],
  );

  const trackPageView = useCallback(
    (route?: string) =>
      withDefaults({
        event_type: "page_view",
        route,
      }),
    [withDefaults],
  );

  const trackMapInteraction = useCallback(
    (
      interactionType: "pan" | "zoom" | "marker_click" | "route_toggle",
      extra?: Record<string, unknown>,
    ) =>
      withDefaults({
        event_type: "map_interaction",
        entity_type: "map",
        payload: {
          interaction_type: interactionType,
          ...extra,
        },
      }),
    [withDefaults],
  );

  const trackMapLayerToggle = useCallback(
    (layerId: string, enabled: boolean) =>
      withDefaults({
        event_type: "map_layer_toggled",
        entity_type: "map_layer",
        entity_id: layerId,
        payload: { enabled },
      }),
    [withDefaults],
  );

  const trackCommerceView = useCallback(
    (commerceId: string) =>
      withDefaults({
        event_type: "commerce_view",
        entity_type: "commerce",
        entity_id: commerceId,
      }),
    [withDefaults],
  );

  const trackCommerceClick = useCallback(
    (commerceId: string, action: "open_details" | "call" | "navigate") =>
      withDefaults({
        event_type: "commerce_click",
        entity_type: "commerce",
        entity_id: commerceId,
        payload: { action },
      }),
    [withDefaults],
  );

  const trackDonation = useCallback(
    (stage: "started" | "completed", payload?: Record<string, unknown>) =>
      withDefaults({
        event_type:
          stage === "started" ? "donation_started" : "donation_completed",
        entity_type: "donation",
        payload,
      }),
    [withDefaults],
  );

  const trackMembership = useCallback(
    (stage: "started" | "completed", payload?: Record<string, unknown>) =>
      withDefaults({
        event_type:
          stage === "started" ? "membership_started" : "membership_completed",
        entity_type: "membership",
        payload,
      }),
    [withDefaults],
  );

  const trackWallPost = useCallback(
    (action: "created" | "liked", postId?: string) =>
      withDefaults({
        event_type:
          action === "created" ? "wall_post_created" : "wall_post_liked",
        entity_type: "wall_post",
        entity_id: postId,
      }),
    [withDefaults],
  );

  const trackLegendView = useCallback(
    (legendId: string) =>
      withDefaults({
        event_type: "legend_view",
        entity_type: "legend",
        entity_id: legendId,
      }),
    [withDefaults],
  );

  const trackCommunityStoryView = useCallback(
    (storyId: string) =>
      withDefaults({
        event_type: "community_story_view",
        entity_type: "community_story",
        entity_id: storyId,
      }),
    [withDefaults],
  );

  return {
    trackPageView,
    trackMapInteraction,
    trackMapLayerToggle,
    trackCommerceView,
    trackCommerceClick,
    trackDonation,
    trackMembership,
    trackWallPost,
    trackLegendView,
    trackCommunityStoryView,
  };
}
