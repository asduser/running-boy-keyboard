import { planSnowmen, snowScene } from "./snowScene";

describe("planSnowmen", () => {
  it("places the fewest snowmen for the lowest random value", () => {
    const snowmen = planSnowmen(() => 0);

    expect(snowmen).toHaveLength(4);
    expect(snowmen.map(({ x }) => x)).toEqual([300, 100, 600, 1100]);
    expect(snowmen.map(({ front }) => front)).toEqual([false, true, true, true]);
  });

  it("keeps every snowman inside the scene and on the snow", () => {
    const values = [0.9, 0.1, 0.5, 0.7, 0.3, 0.99];
    let call = 0;
    const snowmen = planSnowmen(() => values[call++ % values.length] ?? 0);

    snowmen.forEach(({ x, baseY }) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1500);
      expect(baseY).toBeGreaterThanOrEqual(664);
      expect(baseY).toBeLessThanOrEqual(726);
    });
  });
});

describe("snowScene", () => {
  it("draws the snowmen standing before the runners on the foreground", () => {
    const { background, foreground } = snowScene(() => 0);

    expect(background.match(/fill="url\(#ball\)"/g)).toHaveLength(1 * 3);
    expect(foreground.match(/fill="url\(#ball\)"/g)).toHaveLength(3 * 3);
  });
});
