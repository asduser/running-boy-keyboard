import { type StormPlan, planStorm } from "../levels/abandoned/storm";
import type { Snowfall, Weather } from "../models";
import { byId } from "./dom";

const FADE_MS = 2_000;

export class WeatherView {
  private readonly sky = byId("weather");
  private readonly rain = byId("weatherRain");
  private readonly flash = byId("weatherFlash");
  private readonly snow = byId("weatherSnow");
  private weather: Weather | null = null;
  private snowfall: Snowfall | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private readonly plan: (weather: Weather) => StormPlan = planStorm) {}

  public start(weather: Weather | undefined, snowfall?: Snowfall): void {
    if (
      this.sky.classList.contains("sunny") &&
      (weather ?? null) === this.weather &&
      (snowfall ?? null) === this.snowfall
    ) {
      return;
    }
    this.stop();
    this.sky.classList.add("sunny");
    if (snowfall) {
      this.snowfall = snowfall;
      this.startSnow(snowfall);
    }
    if (!weather) {
      return;
    }
    this.weather = weather;
    this.storm(weather, this.plan(weather), true);
  }

  public stop(): void {
    this.weather = null;
    this.snowfall = null;
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timers = [];
    this.sky.classList.remove("sunny", "storm", "snowy");
    this.flash.classList.remove("strike");
    this.rain.replaceChildren();
    this.snow.replaceChildren();
  }

  private startSnow(snowfall: Snowfall): void {
    this.snow.replaceChildren(
      ...Array.from({ length: snowfall.flakes }, () => {
        const flake = document.createElement("i");
        const size = 2 + Math.random() * 5;
        const fallMs = Math.round(16_000 - size * 1_500 + Math.random() * 3_000);
        const swayMs = Math.round(2_000 + Math.random() * 2_500);
        flake.style.left = `${(Math.random() * 110 - 5).toFixed(2)}%`;
        flake.style.width = `${size.toFixed(1)}px`;
        flake.style.height = `${size.toFixed(1)}px`;
        flake.style.opacity = (0.55 + Math.random() * 0.4).toFixed(2);
        flake.style.setProperty("--drift", `${Math.round(Math.random() * 140 - 40)}px`);
        flake.style.animationDuration = `${String(fallMs)}ms, ${String(swayMs)}ms`;
        flake.style.animationDelay = `-${String(Math.round(Math.random() * fallMs))}ms, -${String(Math.round(Math.random() * swayMs))}ms`;
        return flake;
      }),
    );
    this.sky.classList.add("snowy");
  }

  private cycle(weather: Weather): void {
    const storm = this.plan(weather);
    this.later(storm.calmMs, () => {
      this.storm(weather, storm, false);
    });
  }

  private storm(weather: Weather, storm: StormPlan, instant: boolean): void {
    this.beginStorm(storm, instant);
    storm.lightningAtMs.forEach((at) => {
      this.later(at, () => {
        this.strike();
      });
    });
    this.later(storm.stormMs, () => {
      this.sky.classList.remove("storm");
      this.later(FADE_MS, () => {
        this.rain.replaceChildren();
        this.cycle(weather);
      });
    });
  }

  private beginStorm(storm: StormPlan, instant: boolean): void {
    this.rain.style.transform = `rotate(${storm.windDeg}deg)`;
    this.rain.replaceChildren(
      ...Array.from({ length: storm.drops }, () => {
        const drop = document.createElement("i");
        drop.style.left = `${(Math.random() * 130 - 15).toFixed(2)}%`;
        drop.style.height = `${Math.round(40 + Math.random() * 50)}px`;
        drop.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
        drop.style.animationDuration = `${Math.round(450 + Math.random() * 400)}ms`;
        drop.style.animationDelay = `-${Math.round(Math.random() * 1_000)}ms`;
        return drop;
      }),
    );
    this.sky.classList.toggle("instant", instant);
    this.sky.classList.add("storm");
    if (instant) {
      this.sky.getBoundingClientRect();
      this.sky.classList.remove("instant");
    }
  }

  private strike(): void {
    this.flash.classList.remove("strike");
    this.flash.getBoundingClientRect();
    this.flash.classList.add("strike");
  }

  private later(ms: number, task: () => void): void {
    this.timers.push(setTimeout(task, ms));
  }
}
