import type { Level } from "../models/level";
import { ABANDONED_AREA } from "./adandoned/abandonedArea";
import { SNOW_LEVEL } from "./snowman/level";

export const LEVELS: readonly Level[] = [ABANDONED_AREA, SNOW_LEVEL];

export const FIRST_LEVEL: Level = ABANDONED_AREA;

export { SNOW_LEVEL };
