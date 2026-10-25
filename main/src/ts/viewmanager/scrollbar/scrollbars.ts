import { byId } from "../dom";

const MIN_THUMB = 24;

export function attachScrollbar(id: string): void {
  const view = byId(id);
  const track = document.createElement("div");
  const thumb = document.createElement("div");
  track.className = "scroll-track";
  thumb.className = "scroll-thumb";
  track.append(thumb);
  view.classList.add("custom-scroll");
  view.after(track);

  const getMetrics = (): { thumbHeight: number; travel: number; range: number } => {
    const thumbHeight = Math.max(MIN_THUMB, (view.clientHeight / view.scrollHeight) * view.clientHeight);
    return {
      thumbHeight,
      travel: view.clientHeight - thumbHeight,
      range: view.scrollHeight - view.clientHeight,
    };
  };

  const update = (): void => {
    const { thumbHeight, travel, range } = getMetrics();
    track.hidden = range <= 0;
    track.style.top = `${view.offsetTop}px`;
    track.style.left = `${view.offsetLeft + view.offsetWidth}px`;
    track.style.height = `${view.clientHeight}px`;
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${range > 0 ? (view.scrollTop / range) * travel : 0}px)`;
  };

  thumb.addEventListener("pointerdown", (event: PointerEvent) => {
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    thumb.classList.add("dragging");
    const startY = event.clientY;
    const startTop = view.scrollTop;
    const move = (moveEvent: PointerEvent): void => {
      const { travel, range } = getMetrics();
      view.scrollTop = startTop + ((moveEvent.clientY - startY) * range) / travel;
    };
    const end = (): void => {
      thumb.classList.remove("dragging");
      thumb.removeEventListener("pointermove", move);
      thumb.removeEventListener("pointerup", end);
      thumb.removeEventListener("pointercancel", end);
    };
    thumb.addEventListener("pointermove", move);
    thumb.addEventListener("pointerup", end);
    thumb.addEventListener("pointercancel", end);
  });

  track.addEventListener("pointerdown", (event) => {
    if (event.target !== track) {
      return;
    }
    const { thumbHeight, travel, range } = getMetrics();
    const offset = event.clientY - track.getBoundingClientRect().top - thumbHeight / 2;
    view.scrollTo({ top: (Math.min(Math.max(offset, 0), travel) / travel) * range, behavior: "smooth" });
  });

  view.addEventListener("scroll", update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(view);
  Array.from(view.children).forEach((child) => {
    observer.observe(child);
  });
  update();
}
