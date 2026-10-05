import type { Weather } from "../models/weather";
import { ABANDONED_AREA } from "./abandonedArea";
import { planStorm } from "./storm";

const WEATHER: Weather = {
  calmMs: { min: 1_000, max: 2_000 },
  stormMs: { min: 10_000, max: 20_000 },
  drops: { min: 50, max: 150 },
  windDeg: { min: 5, max: 15 },
  lightningStrikes: { min: 1, max: 3 },
};

describe("planStorm", () => {
  it("uses the lower bounds for the lowest random value", () => {
    expect(planStorm(WEATHER, () => 0)).toEqual({
      calmMs: 1_000,
      stormMs: 10_000,
      drops: 50,
      windDeg: 5,
      lightningAtMs: [0],
    });
  });

  it("uses the upper bounds for the highest random value", () => {
    const plan = planStorm(WEATHER, () => 1);

    expect(plan).toMatchObject({ calmMs: 2_000, stormMs: 20_000, drops: 150, windDeg: 15 });
    expect(plan.lightningAtMs).toEqual([20_000, 20_000, 20_000]);
  });

  it("strikes lightning in order while the storm lasts", () => {
    const values = [0.5, 0.5, 0.5, 0.5, 0.9, 0.9, 0.1, 0.6];
    let index = 0;
    const plan = planStorm(WEATHER, () => values[index++] ?? 0);

    expect(plan.lightningAtMs).toEqual([1_500, 9_000, 13_500]);
    plan.lightningAtMs.forEach((at) => {
      expect(at).toBeLessThanOrEqual(plan.stormMs);
    });
  });

  it("gives the abandoned area a stormy sky", () => {
    expect(ABANDONED_AREA.weather).toBeDefined();
  });
});
