import { useEffect, useRef, useState } from 'react';

export const useWebSocketSubscription = <T = unknown>(channel: string) => {
  const [event, setEvent] = useState<T | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/ws';
    const ws = new WebSocket(`${wsBase}?channel=${encodeURIComponent(channel)}`);
    socketRef.current = ws;

    ws.onmessage = (message) => {
      try {
        setEvent(JSON.parse(message.data));
      } catch {
        // ignore malformed payloads
      }
    };

    return () => {
      ws.close();
    };
  }, [channel]);

  return event;
};
