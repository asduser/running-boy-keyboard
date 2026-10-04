import { DEFAULT_SETTINGS, Settings } from "./settings";

describe("Settings", () => {
  it("starts with the defaults", () => {
    expect(new Settings().current).toEqual(DEFAULT_SETTINGS);
  });

  it("merges updates and notifies subscribers with the new state", () => {
    const settings = new Settings();
    const listener = jest.fn();
    settings.subscribe(listener);

    settings.update({ difficulty: "easy", menuSounds: false });

    const expected = { ...DEFAULT_SETTINGS, difficulty: "easy", menuSounds: false };
    expect(settings.current).toEqual(expected);
    expect(listener).toHaveBeenCalledWith(expected);
  });

  it("does not mutate the previous state", () => {
    const settings = new Settings();
    const before = settings.current;

    settings.update({ hero: "model2" });

    expect(before.hero).toBe(DEFAULT_SETTINGS.hero);
  });

  it("stops notifying after unsubscribe", () => {
    const settings = new Settings();
    const listener = jest.fn();
    const unsubscribe = settings.subscribe(listener);

    unsubscribe();
    settings.update({ gameMusic: false });

    expect(listener).not.toHaveBeenCalled();
  });
});
