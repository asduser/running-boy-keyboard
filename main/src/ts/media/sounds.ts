export const MEDIA_PATH = "../../media/";

export const MUSIC = {
  menu: "main_sound.ogg",
  game: "fontGameMusic.ogg",
} as const;

export const EFFECTS = {
  hover: "button19.wav",
  click: "click.ogg",
  bark: "dogAgressive.wav",
  gameOver: "gameOver.wav",
  win: "winnerPopup.wav",
} as const;

export type MusicId = keyof typeof MUSIC;
export type EffectId = keyof typeof EFFECTS;
