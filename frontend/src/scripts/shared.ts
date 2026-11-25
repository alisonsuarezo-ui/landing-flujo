/** Utilidades compartidas por los módulos de interacción. */

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/** true si la persona pidió reducir el movimiento (se consulta en vivo). */
export const reducedMotion = () => motionQuery.matches;

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Almacenamiento tolerante a fallos (modo privado, iframes, etc.). */
export const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* sin almacenamiento: se ignora */
    }
  },
};

/** Evento que conecta la elección del hero con el resto de la página. */
export const PERFIL_EVENT = 'aia:perfil';
