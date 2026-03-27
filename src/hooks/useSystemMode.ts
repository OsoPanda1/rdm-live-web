/**
 * Hook: useSystemMode
 * Expone el modo antifrágil del sistema (NORMAL/SAFE/EMERGENCY) a la UI
 */

import { useState, useEffect, useCallback } from "react";
import { getSystemMode, onModeChange, updateSystemMode } from "@/core/system/controller";
import { collectSystemMetrics, trackRequest, resetMetrics } from "@/core/system/metrics-collector";
import { bootstrapCoreEvents } from "@/core/bootstrap/events";
import type { SystemMode } from "@/core/system/modes";
import type { IsabellaGuardianDecision } from "@/core/ai/isabella-guardian";

interface SystemModeState {
  mode: SystemMode;
  aiDecision: IsabellaGuardianDecision | null;
  metricsSnapshot: ReturnType<typeof collectSystemMetrics> | null;
}

export function useSystemMode(pollIntervalMs = 30000) {
  const [state, setState] = useState<SystemModeState>({
    mode: getSystemMode(),
    aiDecision: null,
    metricsSnapshot: null,
  });

  useEffect(() => {
    bootstrapCoreEvents();

    const unsub = onModeChange((mode) => {
      setState(prev => ({ ...prev, mode }));
    });

    // Periodic metrics collection
    const interval = setInterval(() => {
      trackRequest(); // simulate activity
      const metrics = collectSystemMetrics();
      const result = updateSystemMode(metrics);
      setState({
        mode: result.currentMode,
        aiDecision: result.aiDecision,
        metricsSnapshot: metrics,
      });
      resetMetrics();
    }, pollIntervalMs);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  const forceRefresh = useCallback(() => {
    const metrics = collectSystemMetrics();
    const result = updateSystemMode(metrics);
    setState({
      mode: result.currentMode,
      aiDecision: result.aiDecision,
      metricsSnapshot: metrics,
    });
  }, []);

  return { ...state, forceRefresh };
}
