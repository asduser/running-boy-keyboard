import { byId } from "./dom";
import { type BirdFlight, type FlockPlan, planFlock } from "./flock";

const SVG_NS = "http://www.w3.org/2000/svg";
const WING_PATH = "M0 5 Q9 -2 20 9 Q31 -2 40 5 Q32 7 20 17 Q8 7 0 5Z";

export class Birds {
  private readonly sky = byId("birds");
  private flight = 0;
  private flying = false;
  private nextFlock: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly plan: () => FlockPlan = planFlock) {}

  start(): void {
    if (this.flying) {
      return;
    }
    this.flying = true;
    this.flyFlock(++this.flight);
  }

  stop(): void {
    this.flying = false;
    this.flight += 1;
    clearTimeout(this.nextFlock);
    this.sky.replaceChildren();
  }

  private flyFlock(flight: number): void {
    const { birds, pauseAfterMs } = this.plan();
    let airborne = birds.length;
    birds.forEach((plan) => {
      const bird = this.createBird(plan);
      bird.addEventListener("animationend", (event) => {
        if (event.target !== bird) {
          return;
        }
        bird.remove();
        airborne -= 1;
        if (airborne === 0 && flight === this.flight) {
          this.nextFlock = setTimeout(() => {
            this.flyFlock(flight);
          }, pauseAfterMs);
        }
      });
      this.sky.append(bird);
    });
  }

  private createBird(flight: BirdFlight): HTMLElement {
    const bird = document.createElement("div");
    bird.className = "bird";
    bird.style.top = `${flight.topPercent}%`;
    bird.style.width = `${flight.sizePx}px`;
    bird.style.animationDuration = `${flight.durationMs}ms`;
    bird.style.animationDelay = `${flight.delayMs}ms`;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 40 18");
    svg.style.animationDuration = `${flight.flapMs}ms`;
    const wings = document.createElementNS(SVG_NS, "path");
    wings.setAttribute("d", WING_PATH);
    svg.append(wings);
    bird.append(svg);
    return bird;
  }
}
