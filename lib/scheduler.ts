// lib/scheduler.ts
// Type-safe wrapper — scheduler API is not yet in TypeScript's lib.dom.d.ts

type TaskPriority = 'user-blocking' | 'user-visible' | 'background'

interface SchedulerTask {
  priority: TaskPriority
  signal?: AbortSignal
  delay?: number
}

// Extend global Window type with scheduler
declare global {
  interface Window {
    scheduler?: {
      postTask<T>(
        callback: () => T | Promise<T>,
        options?: SchedulerTask
      ): Promise<T>
      yield(): Promise<void>
    }
  }
}

// postTask wrapper with fallback to setTimeout
export async function postTask<T>(
  callback: () => T | Promise<T>,
  options: SchedulerTask = { priority: 'user-visible' }
): Promise<T> {
  if (typeof window !== 'undefined' && window.scheduler?.postTask) {
    return window.scheduler.postTask(callback, options)
  }
  return new Promise<T>((resolve, reject) => {
    setTimeout(async () => {
      try {
        resolve(await callback())
      } catch (err) {
        reject(err)
      }
    }, 0)
  })
}

// yieldToMain wrapper with fallback
export async function yieldToMain(): Promise<void> {
  if (typeof window !== 'undefined' && window.scheduler?.yield) {
    return window.scheduler.yield()
  }
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}
