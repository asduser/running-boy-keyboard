export function watchPageActivity(onChange: (active: boolean) => void): () => void {
  let focused = true;
  const update = () => onChange(!document.hidden && focused);
  const onBlur = () => {
    focused = false;
    update();
  };
  const onFocus = () => {
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
