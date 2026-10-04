import type { CharState } from "../models/round";

export type TypingResult = "correct" | "mistake" | "ignored";

export class TypingRound {
  private readonly chars: { char: string; typed: boolean; mistyped: boolean }[];
  private cursor = 0;

  constructor(readonly text: string) {
    this.chars = text.split("").map((char) => ({ char, typed: false, mistyped: false }));
  }

  get progress(): number {
    return this.cursor;
  }

  get length(): number {
    return this.chars.length;
  }

  get finished(): boolean {
    return this.cursor >= this.chars.length;
  }

  get characters(): readonly CharState[] {
    return this.chars.map((state) => ({ ...state }));
  }

  check(input: string): TypingResult {
    const current = this.chars[this.cursor];
    if (!current || input.length <= this.cursor) {
      return "ignored";
    }
    if (input[this.cursor] !== current.char) {
      current.mistyped = true;
      return "mistake";
    }
    current.typed = true;
    this.cursor++;
    return "correct";
  }
}
