// @ts-nocheck
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function track(data: { event_type: string; route: string }) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function RouteTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    track({ event_type: "page_view", route: pathname });
  }, [pathname]);
  return null;
}