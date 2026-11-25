import { $ } from './shared';

/** Menú móvil: abre/cierra con botón, Escape, clic fuera o al elegir un enlace. */
export function initNav() {
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const cta = $('[data-mobile-cta]');
  if (!toggle || !menu) return;

  const set = (open: boolean, focusToggle = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.toggleAttribute('data-open', open);
    cta?.classList.toggle('is-hidden', open);
    if (open) menu.querySelector<HTMLAnchorElement>('a')?.focus();
    else if (focusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.hasAttribute('data-open')) set(false, true);
  });
  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (menu.hasAttribute('data-open') && !menu.contains(t) && !toggle.contains(t)) set(false);
  });
  // Si se pasa a escritorio con el menú abierto, se cierra.
  window.matchMedia('(min-width: 1240px)').addEventListener('change', () => set(false));
}
