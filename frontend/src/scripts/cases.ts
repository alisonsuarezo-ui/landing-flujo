import { PERFILES, type PerfilId } from '../data/content';
import { $, $$, reducedMotion, PERFIL_EVENT } from './shared';

/** Casos de uso: pestañas accesibles + comparador antes/después deslizable. */
export function initCases() {
  const tabs = $$<HTMLButtonElement>('[data-case-tab]');
  if (!tabs.length) return;

  const activar = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`)!.hidden = !on;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activar(t));
    t.addEventListener('keydown', (e) => {
      let j = -1;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j < 0) return;
      e.preventDefault();
      activar(tabs[j], true);
    });
  });

  // El perfil del hero abre el caso correspondiente.
  document.addEventListener(PERFIL_EVENT, (e) => {
    const caso = PERFILES[(e as CustomEvent<PerfilId>).detail]?.caso;
    const tab = tabs.find((t) => t.dataset.caseTab === caso);
    if (tab) activar(tab);
  });

  $$('[data-compare]').forEach(initCompare);
}

function initCompare(box: HTMLElement) {
  const range = $<HTMLInputElement>('.compare__range', box)!;
  const caseEl = box.closest('[data-case]')!;
  let anim = 0;

  const set = (v: number) => {
    range.value = String(v);
    box.style.setProperty('--pos', `${v}%`);
    box.classList.toggle('is-start', v <= 6);
    box.classList.toggle('is-end', v >= 94);
    range.setAttribute('aria-valuetext', v <= 5 ? 'Antes' : v >= 95 ? 'Después' : `${v} % después`);
  };

  const animarA = (to: number, ms = 500) => {
    cancelAnimationFrame(anim);
    if (reducedMotion()) return set(to);
    const from = Number(range.value);
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      set(Math.round(from + (to - from) * e));
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };

  range.addEventListener('input', () => {
    cancelAnimationFrame(anim);
    set(Number(range.value));
  });
  $$<HTMLButtonElement>('[data-jump]', caseEl).forEach((b) =>
    b.addEventListener('click', () => animarA(Number(b.dataset.jump))),
  );

  // Pista: la primera vez que el comparador aparece, «asoma» el después.
  if (!reducedMotion() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (Number(range.value) !== 0) return;
        animarA(35, 700);
        setTimeout(() => Number(range.value) === 35 && animarA(0, 600), 1300);
      },
      { threshold: 0.6 },
    );
    io.observe(box);
  }
}
