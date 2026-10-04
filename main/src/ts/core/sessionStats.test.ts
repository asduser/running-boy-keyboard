import { SessionStats } from "./sessionStats";

describe("SessionStats", () => {
  it("reports zeros before any round", () => {
    expect(new SessionStats().summary()).toEqual({
      attempts: 0,
      wins: 0,
      losses: 0,
      aborted: 0,
      totalScore: 0,
      maxScore: 0,
      minScore: 0,
      totalTimeSec: 0,
      maxTimeSec: 0,
      minTimeSec: 0,
    });
  });

  it("summarises the recorded rounds", () => {
    const stats = new SessionStats();
    stats.startAttempt();
    stats.record({ outcome: "won", score: 300, durationSec: 20 });
    stats.startAttempt();
    stats.record({ outcome: "lost", score: -10, durationSec: 5 });
    stats.startAttempt();
    stats.record({ outcome: "aborted", score: 40, durationSec: 2.5 });

    expect(stats.summary()).toEqual({
      attempts: 3,
      wins: 1,
      losses: 1,
      aborted: 1,
      totalScore: 330,
      maxScore: 300,
      minScore: -10,
      totalTimeSec: 27.5,
      maxTimeSec: 20,
      minTimeSec: 2.5,
    });
  });

  it("returns the same totals when asked repeatedly", () => {
    const stats = new SessionStats();
    stats.startAttempt();
    stats.record({ outcome: "won", score: 100, durationSec: 10 });

    stats.summary();

    expect(stats.summary().totalScore).toBe(100);
    expect(stats.summary().totalTimeSec).toBe(10);
  });

  it("counts a started round without a result as aborted", () => {
    const stats = new SessionStats();
    stats.startAttempt();

    expect(stats.summary()).toEqual(expect.objectContaining({ attempts: 1, aborted: 1 }));
  });
});
