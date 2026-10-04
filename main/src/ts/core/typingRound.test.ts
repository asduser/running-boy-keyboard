import { TypingRound } from "./typingRound";

describe("TypingRound", () => {
  it("starts with nothing typed", () => {
    const round = new TypingRound("ab");

    expect(round.progress).toBe(0);
    expect(round.length).toBe(2);
    expect(round.finished).toBe(false);
    expect(round.characters).toEqual([
      { char: "a", typed: false, mistyped: false },
      { char: "b", typed: false, mistyped: false },
    ]);
  });

  it("advances on a correct character", () => {
    const round = new TypingRound("ab");

    expect(round.check("a")).toBe("correct");
    expect(round.progress).toBe(1);
    expect(round.characters[0]).toEqual({ char: "a", typed: true, mistyped: false });
  });

  it("stays on the character after a mistake and keeps it marked as mistyped", () => {
    const round = new TypingRound("ab");

    expect(round.check("x")).toBe("mistake");
    expect(round.progress).toBe(0);
    expect(round.check("a")).toBe("correct");
    expect(round.characters[0]).toEqual({ char: "a", typed: true, mistyped: true });
  });

  it("ignores input that does not reach the current character", () => {
    const round = new TypingRound("ab");
    round.check("a");

    expect(round.check("a")).toBe("ignored");
    expect(round.check("")).toBe("ignored");
    expect(round.progress).toBe(1);
  });

  it("finishes after the last character and ignores further input", () => {
    const round = new TypingRound("ab");
    round.check("a");
    round.check("ab");

    expect(round.finished).toBe(true);
    expect(round.check("abc")).toBe("ignored");
  });

  it("returns copies of the character states", () => {
    const round = new TypingRound("a");
    const before = round.characters;
    round.check("a");

    expect(before[0]?.typed).toBe(false);
  });
});
