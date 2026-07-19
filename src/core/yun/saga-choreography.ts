// Saga Choreography Engine — decentralized alternative to executeSaga().
// Instead of a central orchestrator, each saga participant subscribes to
// FederationBus events and self-manages its step execution and compensation.
// This eliminates the SPOF and aligns with GEMET sovereignty principles.

import type { SagaStep, SagaResult } from './data-fabric';
import { federationBus } from '@/federaciones/FederationBus';

// --- Event types for choreographed sagas ---
export const SAGA_EVENTS = {
  STEP_STARTED: 'saga.step.started',
  STEP_COMPLETED: 'saga.step.completed',
  STEP_FAILED: 'saga.step.failed',
  SAGA_COMPLETED: 'saga.completed',
  SAGA_ABORTED: 'saga.aborted',
  COMPENSATION_STARTED: 'saga.compensation.started',
  COMPENSATION_COMPLETED: 'saga.compensation.completed',
} as const;

export interface SagaContext {
  sagaId: string;
  sagaName: string;
  federationSource: string;
  startedAt: number;
  ttlMs: number;
}

export interface SagaStepEvent {
  sagaId: string;
  stepName: string;
  stepIndex: number;
  totalSteps: number;
  input: unknown;
  output?: unknown;
  error?: string;
  timestamp: number;
}

// --- Choreography Participant -- each federation node runs one of these ---

export class SagaChoreographyParticipant {
  private activeSagas: Map<string, { context: SagaContext; steps: SagaStep[]; currentStep: number }> = new Map();

  constructor(private readonly federationId: string) {
    this.subscribeToEvents();
  }

  // Start a new choreographed saga by emitting the first step event
  async startSaga(sagaName: string, steps: SagaStep[], initialInput: unknown): Promise<SagaResult<unknown>> {
    const sagaId = `saga-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const context: SagaContext = {
      sagaId,
      sagaName,
      federationSource: this.federationId,
      startedAt: Date.now(),
      ttlMs: 30_000,
    };

    this.activeSagas.set(sagaId, { context, steps, currentStep: 0 });

    // Emit the first step event — subsequent steps are triggered by events
    const firstStep = steps[0];
    const event: SagaStepEvent = {
      sagaId,
      stepName: firstStep.name,
      stepIndex: 0,
      totalSteps: steps.length,
      input: initialInput,
      timestamp: Date.now(),
    };

    federationBus.emit(SAGA_EVENTS.STEP_STARTED, { ...event, federationSource: this.federationId });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.activeSagas.delete(sagaId);
        resolve({ success: false, error: new Error(`Saga ${sagaId} timed out`), completedSteps: [], compensatedSteps: [] });
      }, context.ttlMs);

      // Listen for completion
      const onComplete = (data: SagaStepEvent) => {
        if (data.sagaId !== sagaId) return;
        if (data.stepIndex === steps.length - 1) {
          clearTimeout(timeout);
          this.activeSagas.delete(sagaId);
          resolve({ success: true, result: data.output, completedSteps: steps.map(s => s.name), compensatedSteps: [] });
        }
      };

      const onAbort = (data: { sagaId: string; error: string; compensatedSteps: string[]; completedSteps: string[] }) => {
        if (data.sagaId !== sagaId) return;
        clearTimeout(timeout);
        this.activeSagas.delete(sagaId);
        resolve({ success: false, error: new Error(data.error), completedSteps: data.completedSteps, compensatedSteps: data.compensatedSteps });
      };

      federationBus.on(SAGA_EVENTS.SAGA_COMPLETED, onComplete as never);
      federationBus.on(SAGA_EVENTS.SAGA_ABORTED, onAbort as never);
    });
  }

  private subscribeToEvents(): void {
    // Listen for step events that target this federation
    federationBus.on(SAGA_EVENTS.STEP_STARTED, async (data: SagaStepEvent) => {
      const stepIndex = data.stepIndex;
      const sagaId = data.sagaId;
      const sagaEntry = this.activeSagas.get(sagaId);

      // Only process if we have this saga registered
      if (!sagaEntry) return;

      const step = sagaEntry.steps[stepIndex];
      if (!step) return;

      try {
        const output = await step.execute(data.input);

        const completedEvent: SagaStepEvent = {
          sagaId,
          stepName: step.name,
          stepIndex,
          totalSteps: data.totalSteps,
          input: data.input,
          output,
          timestamp: Date.now(),
        };

        federationBus.emit(SAGA_EVENTS.STEP_COMPLETED, { ...completedEvent, federationSource: this.federationId });

        // If there's a next step, trigger it
        if (stepIndex + 1 < data.totalSteps) {
          const nextStepEvent: SagaStepEvent = {
            sagaId,
            stepName: sagaEntry.steps[stepIndex + 1].name,
            stepIndex: stepIndex + 1,
            totalSteps: data.totalSteps,
            input: output,
            timestamp: Date.now(),
          };
          federationBus.emit(SAGA_EVENTS.STEP_STARTED, { ...nextStepEvent, federationSource: this.federationId });
        } else {
          // All steps completed
          federationBus.emit(SAGA_EVENTS.SAGA_COMPLETED, { ...completedEvent, federationSource: this.federationId });
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);

        const failedEvent: SagaStepEvent = {
          sagaId,
          stepName: step.name,
          stepIndex,
          totalSteps: data.totalSteps,
          input: data.input,
          error: errMsg,
          timestamp: Date.now(),
        };

        federationBus.emit(SAGA_EVENTS.STEP_FAILED, { ...failedEvent, federationSource: this.federationId });

        // Trigger compensation for all preceding steps
        federationBus.emit(SAGA_EVENTS.SAGA_ABORTED, {
          sagaId,
          error: errMsg,
          failedStep: step.name,
          completedSteps: sagaEntry.steps.slice(0, stepIndex).map(s => s.name),
          compensatedSteps: [] as string[],
          federationSource: this.federationId,
        });
      }
    });

    // Listen for compensation events
    federationBus.on(SAGA_EVENTS.SAGA_ABORTED, async (data: { sagaId: string; completedSteps: string[]; compensatedSteps: string[]; error: string }) => {
      const sagaEntry = this.activeSagas.get(data.sagaId);
      if (!sagaEntry) return;

      const compensated: string[] = [];

      // Compensate in reverse order using the FederationBus
      for (let i = data.completedSteps.length - 1; i >= 0; i--) {
        const stepName = data.completedSteps[i];
        const step = sagaEntry.steps.find(s => s.name === stepName);
        if (!step) continue;

        try {
          federationBus.emit(SAGA_EVENTS.COMPENSATION_STARTED, { sagaId: data.sagaId, stepName, federationSource: this.federationId });
          await step.compensate({} as never, {} as never, new Error(data.error));
          compensated.push(stepName);
          federationBus.emit(SAGA_EVENTS.COMPENSATION_COMPLETED, { sagaId: data.sagaId, stepName, federationSource: this.federationId });
        } catch {
          // Compensation failure is logged but does not block remaining compensations
          console.error(`[SagaChoreography] Compensation failed for step ${stepName} in saga ${data.sagaId}`);
        }
      }

      // Emit final abort with compensated steps
      federationBus.emit(SAGA_EVENTS.SAGA_ABORTED, {
        ...data,
        compensatedSteps: compensated,
        federationSource: this.federationId,
      });

      this.activeSagas.delete(data.sagaId);
    });
  }

  // Get active saga count for this participant
  stats(): { activeSagas: number } {
    return { activeSagas: this.activeSagas.size };
  }
}

// --- Global choreography participant map (one per federation) ---

const participants = new Map<string, SagaChoreographyParticipant>();

export function getParticipant(federationId: string): SagaChoreographyParticipant {
  if (!participants.has(federationId)) {
    participants.set(federationId, new SagaChoreographyParticipant(federationId));
  }
  return participants.get(federationId)!;
}
