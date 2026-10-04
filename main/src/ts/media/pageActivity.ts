export function watchPageActivity(onChange: (active: boolean) => void): () => void {
  let focused = true;
  const update = (): void => {
    onChange(!document.hidden && focused);
  };
  const onBlur = (): void => {
    focused = false;
    update();
  };
  const onFocus = (): void => {
    focused = true;
    update();
  };
  document.addEventListener("visibilitychange", update);
  window.addEventListener("blur", onBlur);
  window.addEventListener("focus", onFocus);
  return () => {
    document.removeEventListener("visibilitychange", update);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("focus", onFocus);
  };
}
