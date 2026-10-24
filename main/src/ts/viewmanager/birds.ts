import { byId } from "./dom";
import { type BirdFlight, type FlockPlan, planFlock } from "./flock";

const SVG_NS = "http://www.w3.org/2000/svg";
const BAT_PATH = "M0 5 Q9 -2 20 9 Q31 -2 40 5 Q32 7 20 17 Q8 7 0 5Z";
const BIRD_BODY_PATH =
  "M1.5 8.6 L4 7.7 Q5.5 5.8 7.6 6.6 Q9 7.2 10 7.6 Q18 7.4 26 8.4 L36 6 L31 9.2 L36 12.4 L25.5 10.4 Q17 11.6 10 10.2 Q7 10.4 5.2 9.8 Q4 9.4 3.8 9.2 Z";
const BIRD_WING_PATH = "M11 8 Q14 1 27 0 Q21 3.5 19.5 8 Z";

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

    const svg = svgElement("svg", { viewBox: "0 0 40 18" });
    svg.style.setProperty("--flap", `${flight.flapMs}ms`);
    const songbird = svgElement("g", { class: "bird-shape" });
    songbird.append(
      svgElement("path", { d: BIRD_BODY_PATH }),
      svgElement("path", { class: "bird-wing", d: BIRD_WING_PATH }),
    );
    svg.append(songbird, svgElement("path", { class: "bat-shape", d: BAT_PATH }));
    bird.append(svg);
    return bird;
  }
}

function svgElement(name: string, attributes: Record<string, string>): SVGElement {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}
