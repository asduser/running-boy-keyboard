type Random = () => number;

export interface SnowmanPlan {
  readonly x: number;
  readonly baseY: number;
  readonly scale: number;
  readonly flip: boolean;
  readonly scarf: string;
  readonly hat: boolean;
}

const WIDTH = 1500;
const HEIGHT = 750;
const GROUND_Y = 688;
const SCARF_COLORS = ["#d62828", "#2a9d8f", "#f4a261", "#6a4c93", "#1d70b8"];

const FAR_RANGE =
  "M0 520 L90 400 L170 450 L260 300 L340 390 L420 340 L520 250 L610 380 L700 330 L790 420 L880 290 L980 240 L1080 360 L1170 310 L1260 400 L1350 280 L1440 370 L1500 330 V640 H0Z";
const FAR_SNOWLINE =
  "M0 0 H1500 V360 L1450 372 L1400 350 L1340 366 L1290 345 L1230 362 L1170 342 L1110 366 L1050 335 L990 352 L930 330 L870 350 L810 338 L750 362 L690 344 L630 368 L570 340 L510 330 L450 356 L390 348 L330 370 L270 342 L210 362 L150 350 L90 368 L40 352 L0 362Z";
const MID_RANGE =
  "M0 560 L110 450 L200 520 L300 420 L400 500 L470 460 L560 540 L660 430 L760 510 L850 470 L950 550 L1050 440 L1150 520 L1240 460 L1330 530 L1420 450 L1500 500 V690 H0Z";
const MID_SNOWLINE =
  "M0 0 H1500 V478 L1460 486 L1420 470 L1380 488 L1330 476 L1270 490 L1220 474 L1160 486 L1100 470 L1050 484 L1000 472 L940 488 L880 478 L820 490 L760 474 L700 486 L650 470 L600 486 L540 478 L480 490 L420 474 L360 486 L300 470 L240 488 L180 476 L120 488 L60 472 L0 484Z";
const HILLS =
  "M0 640 C120 600 220 610 330 632 C450 656 540 596 680 604 C800 611 880 650 1000 636 C1120 622 1200 590 1320 606 C1410 618 1460 640 1500 630 V700 H0Z";
const GROUND = "M0 690 C150 682 300 694 450 688 C600 682 750 692 900 687 C1050 682 1200 693 1350 688 C1420 686 1470 690 1500 688 V750 H0Z";
const PINES = [
  [70, 648, 1],
  [110, 652, 0.8],
  [560, 612, 0.9],
  [600, 618, 0.7],
  [1210, 606, 1],
  [1250, 610, 0.75],
  [1440, 636, 0.85],
] as const;

function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min);
}

export function planSnowmen(random: Random = Math.random): SnowmanPlan[] {
  const near = Math.round(between(random, 3, 5));
  const far = Math.round(between(random, 1, 3));
  const place = (count: number, baseY: [number, number], scale: [number, number]): SnowmanPlan[] =>
    Array.from({ length: count }, (_, slot) => {
      const slotWidth = WIDTH / count;
      return {
        x: Math.round(slot * slotWidth + between(random, 0.2, 0.8) * slotWidth),
        baseY: Math.round(between(random, ...baseY)),
        scale: Number(between(random, ...scale).toFixed(2)),
        flip: random() < 0.5,
        scarf: SCARF_COLORS[Math.floor(random() * SCARF_COLORS.length)] ?? "#d62828",
        hat: random() < 0.6,
      };
    });
  return [...place(far, [664, 674], [0.35, 0.5]), ...place(near, [694, 704], [0.75, 1.05])];
}

function snowman({ x, baseY, scale, flip, scarf, hat }: SnowmanPlan): string {
  const hatShape = hat
    ? '<rect x="-11" y="-118" width="22" height="18" rx="2" fill="#222"/><rect x="-11" y="-106" width="22" height="4" fill="#b22"/><rect x="-16" y="-102" width="32" height="4" rx="2" fill="#222"/>'
    : "";
  return `<g transform="translate(${String(x)} ${String(baseY)}) scale(${String(flip ? -scale : scale)} ${String(scale)})">
<ellipse cx="4" cy="0" rx="32" ry="6" fill="#5a7894" opacity=".25"/>
<path d="M-17 -66 L-38 -84 M-30 -77 L-36 -71 M17 -66 L38 -86 M31 -80 L39 -76" stroke="#6b4a2b" stroke-width="3" stroke-linecap="round" fill="none"/>
<circle cy="-26" r="27" fill="url(#ball)"/>
<circle cy="-64" r="19" fill="url(#ball)"/>
<circle cy="-91" r="13" fill="url(#ball)"/>
<path d="M-13 -79 Q0 -71 13 -79 L13 -75 Q0 -67 -13 -75Z M6 -76 L11 -60 L4 -60 L2 -74Z" fill="${scarf}"/>
<circle cx="-4" cy="-94" r="1.8" fill="#222"/><circle cx="5" cy="-94" r="1.8" fill="#222"/>
<path d="M1 -90 L16 -87 L1 -85Z" fill="#f28c28"/>
<circle cy="-60" r="2.2" fill="#333"/><circle cy="-50" r="2.2" fill="#333"/><circle cy="-34" r="2.4" fill="#333"/>
${hatShape}
</g>`;
}

function pine(x: number, baseY: number, scale: number): string {
  return `<g transform="translate(${String(x)} ${String(baseY)}) scale(${String(scale)})">
<rect x="-3" y="-10" width="6" height="12" fill="#5b3b22"/>
<path d="M0 -70 L-16 -40 L-8 -40 L-22 -12 L22 -12 L8 -40 L16 -40Z" fill="#2f5d50"/>
<path d="M0 -70 L-8 -55 L-2 -57 L0 -52 L3 -57 L8 -55Z M-14 -38 L-6 -42 L0 -38 L6 -42 L14 -38 L8 -40 L0 -46 L-8 -40Z" fill="#f4f9fd"/>
</g>`;
}

export function snowScene(random: Random = Math.random): string {
  const snowmen = planSnowmen(random).map(snowman).join("");
  const pines = PINES.map(([x, y, scale]) => pine(x, y, scale)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(WIDTH)}" height="${String(HEIGHT)}" viewBox="0 0 ${String(WIDTH)} ${String(HEIGHT)}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb0e8"/><stop offset=".55" stop-color="#a9d6f3"/><stop offset=".85" stop-color="#e3f2fb"/></linearGradient>
<linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="#9db7d1"/><stop offset="1" stop-color="#d4e4f1"/></linearGradient>
<linearGradient id="mid" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#6f8fb0"/><stop offset="1" stop-color="#a9c1d8"/></linearGradient>
<linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfdff"/><stop offset="1" stop-color="#dbe8f3"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#e8f1f8"/><stop offset="1" stop-color="#c3d7e8"/></linearGradient>
<radialGradient id="ball" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef4fa"/><stop offset="1" stop-color="#c2d4e6"/></radialGradient>
<clipPath id="farClip"><path d="${FAR_RANGE}"/></clipPath>
<clipPath id="midClip"><path d="${MID_RANGE}"/></clipPath>
</defs>
<rect width="${String(WIDTH)}" height="${String(HEIGHT)}" fill="url(#sky)"/>
<path d="${FAR_RANGE}" fill="url(#far)"/>
<path d="${FAR_SNOWLINE}" fill="#f7fbfe" clip-path="url(#farClip)"/>
<path d="${MID_RANGE}" fill="url(#mid)"/>
<path d="${MID_SNOWLINE}" fill="#f4f9fd" clip-path="url(#midClip)"/>
<path d="${HILLS}" fill="url(#hill)"/>
${pines}
<path d="${GROUND}" fill="url(#ground)"/>
<path d="M0 ${String(GROUND_Y + 2)} H${String(WIDTH)}" stroke="#ffffff" stroke-width="3" opacity=".8"/>
${snowmen}
</svg>`;
}
