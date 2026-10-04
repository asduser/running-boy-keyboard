import type { SettingsState } from "../menu/settings";
import { DIFFICULTIES } from "../models/difficulty";
import type { StatsSummary } from "../models/stats";
import { byId } from "./dom";

export class MenuView {
  renderSettings(settings: SettingsState): void {
    const difficulty = DIFFICULTIES[settings.difficulty];
    const difficultySelect = byId("gameDiff", HTMLSelectElement);
    difficultySelect.value = difficulty.id;
    difficultySelect.dataset.difficulty = difficulty.id;
    byId("optionValueSpeed").textContent = difficulty.typingSpeed;
    byId("optionValueError").textContent = difficulty.errorImpact;
    byId("optionValueTime").textContent = difficulty.totalTime;

    const hero = document.querySelector<HTMLInputElement>(
      `input[name="heroValue"][value="${settings.hero}"]`,
    );
    if (hero) {
      hero.checked = true;
    }

    const musicButton = byId("mybtnBg");
    musicButton.classList.toggle("on", settings.menuMusic);
    musicButton.classList.toggle("off", !settings.menuMusic);
    byId("volume_range", HTMLInputElement).value = String(
      Math.round(settings.menuMusicVolume * 100),
    );
    byId("gameAudio_range", HTMLInputElement).value = String(
      Math.round(settings.gameMusicVolume * 100),
    );

    this.renderToggle("musicInGameOn", "musicInGameOff", settings.gameMusic);
    this.renderToggle("VolumeBtOn", "VolumeBtOff", settings.menuSounds);
    this.renderToggle("VolumeDogOn", "VolumeDogOff", settings.enemySounds);
  }

  renderStartLabel(label: string): void {
    byId("startBtn").textContent = label;
  }

  renderStats(stats: StatsSummary): void {
    const values: Record<string, string> = {
      summaryGS: String(stats.attempts),
      winnerGS: String(stats.wins),
      loserGS: String(stats.losses),
      nonerGS: String(stats.aborted),
      summaryScore: String(stats.totalScore),
      maxScoreVal: String(stats.maxScore),
      minScoreVal: String(stats.minScore),
      allTimeVal: stats.totalTimeSec.toFixed(2),
      maxTimeVal: stats.maxTimeSec.toFixed(2),
      minTimeVal: stats.minTimeSec.toFixed(2),
    };
    Object.entries(values).forEach(([id, value]) => (byId(id).textContent = value));
  }

  private renderToggle(onId: string, offId: string, enabled: boolean): void {
    byId(onId).classList.toggle("selected", enabled);
    byId(offId).classList.toggle("selected", !enabled);
  }
}
