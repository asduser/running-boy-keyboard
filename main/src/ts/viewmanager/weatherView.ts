import { type StormPlan, planStorm } from "../levels/storm";
import type { Weather } from "../models/weather";
import { byId } from "./dom";

const FADE_MS = 2_000;

export class WeatherView {
  private readonly sky = byId("weather");
  private readonly rain = byId("weatherRain");
  private readonly flash = byId("weatherFlash");
  private weather: Weather | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private readonly plan: (weather: Weather) => StormPlan = planStorm) {}

  start(weather: Weather | undefined): void {
    if (weather === this.weather) {
      return;
    }
    this.stop();
    if (!weather) {
      return;
    }
    this.weather = weather;
    this.storm(weather, this.plan(weather), true);
  }

  stop(): void {
    this.weather = null;
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timers = [];
    this.sky.classList.remove("storm");
    this.flash.classList.remove("strike");
    this.rain.replaceChildren();
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
