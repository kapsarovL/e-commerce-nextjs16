// Type-safe wrapper for the Scheduler API
// The scheduler API is available in modern browsers via window.scheduler.postTask()
// Falls back to setTimeout(0) in older browsers.

// Declare the scheduler API options for type safety (Scheduler API spec)
declare global {
  interface Scheduler {
    postTask<T>(callback: () => T | Promise<T>, options?: SchedulerPostTaskOptions): Promise<T>;
    yield(): Promise<void>;
  }

  interface SchedulerPostTaskOptions {
    priority?: 'user-blocking' | 'user-visible' | 'background';
    signal?: AbortSignal;
    delay?: number;
  }
}

// ─── Typed postTask wrapper ───────────────────────────────────────────────────

export async function postTask<T>(callback: () => T | Promise<T>, options?: SchedulerPostTaskOptions): Promise<T> {
  // scheduler.postTask is available in Chrome 94+, Edge 94+.
  // Firefox and Safari: fall back to setTimeout(0) which still yields.
  const sched = (globalThis as typeof globalThis & { scheduler?: Scheduler }).scheduler;
  if (sched?.postTask) {
    return sched.postTask(callback, options);
  }

  // Polyfill: yield via a 0ms timeout then run synchronously.
  // Not as precise as postTask (no priority), but functionally equivalent.
  return new Promise<T>((resolve, reject) => {
    setTimeout(async () => {
      try {
        resolve(await callback());
      } catch (err) {
        reject(err);
      }
    }, 0);
  });
}

// ─── scheduler.yield — the lighter hammer ────────────────────────────────────
// Yields the thread without scheduling a new task.
// Use inside a loop to break a long computation into browser-friendly chunks.

export async function yieldToMain(): Promise<void> {
  const sched = (globalThis as typeof globalThis & { scheduler?: Scheduler }).scheduler;
  if (sched?.yield) {
    return sched.yield();
  }
  return new Promise<void>(resolve => setTimeout(resolve, 0));
}
