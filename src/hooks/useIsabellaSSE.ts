import { useEffect, useRef, useState } from "react";
import type { IsabellaDecision } from "@/core/models";

type ConnectionState = "connecting" | "connected" | "reconnecting" | "closed";

interface Options {
  url?: string;
  maxRetries?: number;
}

const DEFAULT_STREAM_URL = import.meta.env.VITE_API_GATEWAY
  ? `${import.meta.env.VITE_API_GATEWAY}/isabella/stream`
  : undefined;

export function useIsabellaSSE(options: Options = {}) {
  const { url = DEFAULT_STREAM_URL, maxRetries = 6 } = options;
  const [decision, setDecision] = useState<IsabellaDecision | null>(null);
  const [state, setState] = useState<ConnectionState>(url ? "connecting" : "closed");
  const retries = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) {
      setState("closed");
      return;
    }

    const connect = () => {
      setState(retries.current > 0 ? "reconnecting" : "connecting");
      const source = new EventSource(url);
      sourceRef.current = source;

      source.onopen = () => {
        retries.current = 0;
        setState("connected");
      };

      source.onmessage = (event) => {
        try {
          setDecision(JSON.parse(event.data));
        } catch {
          // keep stream healthy despite malformed packets
        }
      };

      source.onerror = () => {
        source.close();
        if (retries.current >= maxRetries) {
          setState("closed");
          return;
        }

        const wait = Math.min(1_000 * 2 ** retries.current, 15_000);
        retries.current += 1;
        reconnectTimer.current = window.setTimeout(connect, wait);
      };
    };

    connect();

    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      sourceRef.current?.close();
      setState("closed");
    };
  }, [maxRetries, url]);

  return { decision, connectionState: state };
}
