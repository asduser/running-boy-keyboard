export type Listener<T> = (payload: T) => void;

export class Emitter<Events extends object> {
  private readonly listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(type: K, listener: Listener<Events[K]>): () => void {
    const set = (this.listeners[type] ??= new Set());
    set.add(listener);
    return () => set.delete(listener);
  }

  protected emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    this.listeners[type]?.forEach((listener) => {
      listener(payload);
    });
  }
}
