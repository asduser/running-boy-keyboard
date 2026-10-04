export interface Scheduler {
  every(intervalMs: number, task: () => void): () => void;
}

export const browserScheduler: Scheduler = {
  every(intervalMs, task) {
    const id = setInterval(task, intervalMs);
    return () => clearInterval(id);
  },
};
