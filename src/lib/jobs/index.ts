import { bus } from '@/core/infra/event-bus';

type JobHandler = (payload: unknown) => Promise<void>;

interface Job {
  id: string;
  type: string;
  payload: unknown;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

const handlers = new Map<string, JobHandler>();
const queue: Job[] = [];
const activeJobs = new Set<string>();
let processing = false;
let concurrency = 3;

export function registerJob(type: string, handler: JobHandler): void {
  handlers.set(type, handler);
}

export function enqueue(type: string, payload: unknown, priority = 0, maxAttempts = 3): string {
  const id = `job-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const job: Job = { id, type, payload, priority, attempts: 0, maxAttempts, createdAt: new Date() };
  queue.push(job);
  queue.sort((a, b) => b.priority - a.priority);
  bus.emit('job:enqueued', { id, type });
  processQueue();
  return id;
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0 && activeJobs.size < concurrency) {
    const jobIndex = queue.findIndex(j => !activeJobs.has(j.id));
    if (jobIndex === -1) break;
    const job = queue[jobIndex];
    activeJobs.add(job.id);
    queue.splice(jobIndex, 1);

    processJob(job).finally(() => {
      activeJobs.delete(job.id);
      processing = false;
      if (queue.length > 0) processQueue();
    });
  }
}

async function processJob(job: Job): Promise<void> {
  const handler = handlers.get(job.type);
  if (!handler) {
    bus.emit('job:failed', { id: job.id, type: job.type, error: `No handler for job type: ${job.type}` });
    return;
  }

  try {
    bus.emit('job:started', { id: job.id, type: job.type });
    await handler(job.payload);
    bus.emit('job:completed', { id: job.id, type: job.type });
  } catch (error) {
    job.attempts++;
    if (job.attempts < job.maxAttempts) {
      const backoff = Math.pow(2, job.attempts) * 1000;
      setTimeout(() => {
        queue.push(job);
        processQueue();
      }, backoff);
      bus.emit('job:retry', { id: job.id, type: job.type, attempt: job.attempts, maxAttempts: job.maxAttempts, backoff });
    } else {
      bus.emit('job:failed', { id: job.id, type: job.type, error: String(error), attempts: job.attempts });
    }
  }
}

export function getQueueStats(): { queued: number; active: number; handlers: string[] } {
  return {
    queued: queue.length,
    active: activeJobs.size,
    handlers: Array.from(handlers.keys()),
  };
}

export function setConcurrency(n: number): void {
  concurrency = Math.max(1, Math.min(20, n));
}
