import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/core/hooks/useTracking";

/**
 * Trackea cada cambio de ruta. Montar una sola vez dentro del Router.
 */
export function RouteTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    track({ event_type: "page_view", route: pathname });
  }, [pathname]);
  return null;
}
