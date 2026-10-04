export const ASSETS_PATH = "../../assets/";

export const MENU_BACKGROUND = "bg_font_mini2.jpg";

export function spriteUrl(folder: string, frame: number): string {
  return `${ASSETS_PATH}sprites/${folder}/rb${frame}_mini.png`;
}

export function imageUrl(file: string): string {
  return `${ASSETS_PATH}images/${file}`;
}
