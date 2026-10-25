import { DOG } from "../../models/enemy";
import type { Level } from "../../models/level";
import { ABANDONED_AREA } from "../adandoned/abandonedArea";
import { snowScene } from "./snowScene";

export const SNOW_LEVEL: Level = {
  number: 2,
  title: "Snowman",
  background: snowScene,
  texts: ABANDONED_AREA.texts,
  enemy: DOG,
  birds: false,
  textColor: "#000",
  snowfall: { flakes: 160 },
};
