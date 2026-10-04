import { EFFECTS, MEDIA_PATH, MUSIC, type EffectId, type MusicId } from "./sounds";

export interface AudioManagerOptions {
  readonly basePath?: string;
  readonly onAutoplayBlocked?: () => void;
}

export class AudioManager {
  private readonly music: Record<MusicId, HTMLAudioElement>;
  private readonly effects: Record<EffectId, HTMLAudioElement>;
  private readonly onAutoplayBlocked: () => void;
  private readonly wanted = new Set<HTMLAudioElement>();
  private suspended = false;

  constructor(options: AudioManagerOptions = {}) {
    const basePath = options.basePath ?? MEDIA_PATH + "sounds/";
    this.onAutoplayBlocked = options.onAutoplayBlocked ?? (() => {});
    this.music = createAll(MUSIC, basePath, true);
    this.effects = createAll(EFFECTS, basePath, false);
  }

  playMusic(id: MusicId, fromStart = false): void {
    const track = this.music[id];
    this.wanted.add(track);
    if (fromStart) {
      track.currentTime = 0;
    }
    track.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        this.onAutoplayBlocked();
      }
    });
  }

  pauseMusic(id: MusicId): void {
    const track = this.music[id];
    this.wanted.delete(track);
    track.pause();
  }

  setMusicVolume(id: MusicId, volume: number): void {
    this.music[id].volume = volume;
  }

  playEffect(id: EffectId): void {
    const effect = this.effects[id];
    effect.pause();
    effect.currentTime = 0;
    effect.play().catch(() => {});
  }

  setSuspended(suspended: boolean): void {
    this.suspended = suspended;
    this.all().forEach((sound) => (sound.muted = suspended));
  }

  unlock(): void {
    this.all()
      .filter((sound) => sound.paused)
      .forEach((sound) => this.prime(sound));
  }

  private prime(sound: HTMLAudioElement): void {
    sound.muted = true;
    sound
      .play()
      .then(() => {
        if (!this.wanted.has(sound)) {
          sound.pause();
          sound.currentTime = 0;
        }
      })
      .catch(() => {})
      .finally(() => {
        sound.muted = this.suspended;
      });
  }

  private all(): HTMLAudioElement[] {
    return [...Object.values(this.music), ...Object.values(this.effects)];
  }
}

function createAll<Id extends string>(
  files: Readonly<Record<Id, string>>,
  basePath: string,
  loop: boolean,
): Record<Id, HTMLAudioElement> {
  const entries = Object.entries(files) as [Id, string][];
  return Object.fromEntries(
    entries.map(([id, file]) => {
      const audio = new Audio(basePath + file);
      audio.loop = loop;
      audio.preload = "auto";
      return [id, audio];
    }),
  ) as Record<Id, HTMLAudioElement>;
}
