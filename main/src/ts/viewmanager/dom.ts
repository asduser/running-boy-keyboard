export function byId(id: string): HTMLElement;
export function byId<T extends HTMLElement>(id: string, type: abstract new () => T): T;
export function byId(id: string, type: abstract new () => HTMLElement = HTMLElement): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Missing element #${id} of type ${type.name}`);
  }
  return element;
}
