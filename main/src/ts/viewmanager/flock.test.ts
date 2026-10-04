import { MAX_BIRDS, planFlock } from "./flock";

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
}

describe("planFlock", () => {
  it("sends at least one bird", () => {
    expect(planFlock(() => 0).birds).toHaveLength(1);
  });

  it("never sends more than the maximum", () => {
    expect(planFlock(() => 0.999_999).birds).toHaveLength(MAX_BIRDS);
  });

  it("varies the flock size with the random source", () => {
    expect(planFlock(sequence(0.25, 0.5)).birds).toHaveLength(3);
    expect(planFlock(sequence(0.45, 0.5)).birds).toHaveLength(5);
  });

  it("keeps every flight within the sky and timing bounds", () => {
    const { birds, pauseAfterMs } = planFlock(() => 0.999_999);

    birds.forEach((bird) => {
      expect(bird.topPercent).toBeLessThanOrEqual(40);
      expect(bird.sizePx).toBeLessThanOrEqual(48);
      expect(bird.durationMs).toBeLessThanOrEqual(18_000);
      expect(bird.delayMs).toBeLessThanOrEqual(4_000);
    });
    expect(pauseAfterMs).toBeLessThanOrEqual(6_000);
  });
});
