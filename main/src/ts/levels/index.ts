import type { Level } from "../models";
import { ABANDONED_AREA } from "./abandoned/level";
import { SNOW_LEVEL } from "./snowman/level";

export const LEVELS: readonly Level[] = [ABANDONED_AREA, SNOW_LEVEL];

export const FIRST_LEVEL: Level = ABANDONED_AREA;

export { SNOW_LEVEL };
