export interface Range {
  readonly min: number;
  readonly max: number;
}

export interface Snowfall {
  readonly flakes: number;
}

export interface Weather {
  readonly calmMs: Range;
  readonly stormMs: Range;
  readonly drops: Range;
  readonly windDeg: Range;
  readonly lightningStrikes: Range;
}
