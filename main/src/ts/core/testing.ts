import type { Scheduler } from "./scheduler";

export interface FakeScheduler {
  readonly scheduler: Scheduler;
  readonly intervalMs: number | undefined;
  readonly running: boolean;
  tick(times?: number): void;
}

export function createFakeScheduler(): FakeScheduler {
  let task: (() => void) | undefined;
  let intervalMs: number | undefined;
  return {
    scheduler: {
      every(ms, scheduled) {
        intervalMs = ms;
        task = scheduled;
        return () => {
          task = undefined;
        };
      },
    },
    get intervalMs() {
      return intervalMs;
    },
    get running() {
      return task !== undefined;
    },
    tick(times = 1) {
      for (let i = 0; i < times; i++) {
        task?.();
      }
    },
  };
}
