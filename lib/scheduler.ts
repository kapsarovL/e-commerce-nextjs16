// Type-safe wrapper — scheduler API is not yet in TypeScript's lib.dom.d.ts

type TaskPriority = 'user-blocking' | 'user-visible' | 'background';

interface SchedulerTask {
  priority: TaskPriority;
  signal?: AbortSignal;
  delay?: number;
}

// Extend the global scheduler type
declare global {
  interface Window {
    scheduler?: {
      postTask<T>(callback: () => T | Promise<T>, options?: SchedulerTask): Promise<T>;
      yield(): Promise<void>;
    };
  }
}

// ─── Typed postTask wrapper ───────────────────────────────────────────────────

export async function postTask<T>(
  callback: () => T | Promise<T>,
  options: SchedulerTask = { priority: 'user-visible' },
): Promise<T> {
  // scheduler.postTask is available in Chrome 94+, Edge 94+.
  // Firefox and Safari: fall back to setTimeout(0) which still yields.
  if (typeof window !== 'undefined' && window.scheduler?.postTask) {
    return window.scheduler.postTask(callback, options);
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
  if (typeof window !== 'undefined' && window.scheduler?.yield) {
    return window.scheduler.yield();
  }
  return new Promise<void>(resolve => setTimeout(resolve, 0));
}
