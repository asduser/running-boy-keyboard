import { byId } from "./dom";

const STAGE_WIDTH = 1250;
const STAGE_HEIGHT = 750;
const STAGE_GROUND_Y = 688;
const STAGE_TOP_SPACE = 30;
const BG_WIDTH = 1500;
const BG_HEIGHT = 750;
const BG_GROUND_HEIGHT = BG_HEIGHT - 688;
const POPUP_GAP = 16;

export class Layout {
  private readonly resizeListeners = new Set<() => void>();
  private lastViewportWidth = 0;
  private stageScale = 1;

  init(): void {
    const onResize = (): void => {
      this.fitStage();
      this.resizeListeners.forEach((listener) => {
        listener();
      });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", () => {
      this.fitStage();
    });
    window.visualViewport?.addEventListener("scroll", () => {
      this.fitStage();
    });
    onResize();
  }

  onResize(listener: () => void): void {
    this.resizeListeners.add(listener);
  }

  fitPopup(overlay: HTMLElement): void {
    if (overlay.style.display !== "block") {
      return;
    }
    const box = overlay.firstElementChild as HTMLElement;
    overlay.style.zoom = "1";
    const widthScale = Math.min(1, (window.innerWidth - 2 * POPUP_GAP) / box.offsetWidth);
    const heightScale = (window.innerHeight - 2 * POPUP_GAP) / box.offsetHeight;
    overlay.style.zoom = String(Math.max(Math.min(widthScale, heightScale), widthScale / 2));
  }

  private fitStage(): void {
    const viewport = window.visualViewport;
    const width = window.innerWidth;
    const height = viewport ? viewport.height : window.innerHeight;
    const viewTop = viewport ? viewport.offsetTop : 0;
    const typing = document.activeElement === byId("primerText");
    if (!typing || width !== this.lastViewportWidth) {
      this.lastViewportWidth = width;
      this.stageScale =
        height > width
          ? Math.min(1, width / STAGE_WIDTH)
          : Math.min(1, width / STAGE_WIDTH, height / STAGE_HEIGHT);
    }
    const scale = this.stageScale;
    const bgScale = Math.max(scale, width / BG_WIDTH);
    const body = document.body;
    body.style.backgroundSize = `${BG_WIDTH * bgScale}px ${BG_HEIGHT * bgScale}px`;
    body.style.backgroundPosition = `center ${viewTop + height - BG_HEIGHT * bgScale}px`;

    const groundTop = viewTop + height - BG_GROUND_HEIGHT * bgScale;
    const stageTop = Math.max(
      viewTop - STAGE_TOP_SPACE * scale,
      groundTop - STAGE_GROUND_Y * scale,
    );
    const stage = byId("wrapper");
    stage.style.left = `${(width - STAGE_WIDTH * scale) / 2}px`;
    stage.style.top = `${stageTop}px`;
    stage.style.transform = `scale(${scale})`;
  }
}
