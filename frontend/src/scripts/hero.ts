import { PERFILES, HERO, type PerfilId } from '../data/content';
import { $, $$, reducedMotion, store, PERFIL_EVENT } from './shared';

/**
 * Pieza 1 · Hero que reacciona al visitante.
 * - Perfil: adapta la bajada y el botón, y avisa al resto de la página
 *   (recomendador y casos de uso) con el evento `aia:perfil`.
 * - Cursor o dedo: los halos y Max se mueven con el puntero.
 */
export function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;
  const lead = $('[data-hero-lead]', hero);
  const cta = $('[data-hero-cta]', hero);
  const max = $('[data-hero-max]', hero);
  const buttons = $$<HTMLButtonElement>('[data-profile]', hero);

  const elegir = (id: PerfilId, { anunciar = true, animar = true } = {}) => {
    const perfil = PERFILES[id];
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.profile === id)));
    if (cta) cta.firstChild!.textContent = perfil.cta;
    if (lead) {
      const swap = () => {
        lead.textContent = perfil.bajada;
        lead.classList.remove('is-swapping');
      };
      if (animar && !reducedMotion()) {
        lead.classList.add('is-swapping');
        setTimeout(swap, 220);
      } else swap();
    }
    store.set('aia-perfil', id);
    if (anunciar) document.dispatchEvent(new CustomEvent(PERFIL_EVENT, { detail: id }));
  };

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      if (b.getAttribute('aria-pressed') === 'true') {
        // Segundo clic: vuelve al mensaje general.
        b.setAttribute('aria-pressed', 'false');
        if (lead) lead.textContent = HERO.bajada;
        if (cta) cta.firstChild!.textContent = HERO.cta;
        store.set('aia-perfil', '');
        return;
      }
      elegir(b.dataset.profile as PerfilId);
    }),
  );

  // Si la persona ya eligió en una visita anterior, se respeta.
  const previo = store.get('aia-perfil') as PerfilId | null;
  if (previo && previo in PERFILES) {
    // Se anuncia después de que los demás módulos estén escuchando.
    queueMicrotask(() => elegir(previo, { animar: false }));
  }

  // Parallax con el puntero (mouse, lápiz o arrastre táctil).
  if (max) {
    let raf = 0;
    hero.addEventListener(
      'pointermove',
      (e) => {
        if (reducedMotion()) return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top) / r.height - 0.5;
          hero.style.setProperty('--hx', `${(dx * 60).toFixed(1)}px`);
          hero.style.setProperty('--hy', `${(dy * 60).toFixed(1)}px`);
          max.style.setProperty('--mx', `${(dx * 24).toFixed(1)}px`);
          max.style.setProperty('--my', `${(dy * 16).toFixed(1)}px`);
          max.style.setProperty('--mr', `${(dx * 6).toFixed(2)}deg`);
        });
      },
      { passive: true },
    );
    hero.addEventListener('pointerleave', () => {
      for (const v of ['--hx', '--hy']) hero.style.removeProperty(v);
      for (const v of ['--mx', '--my', '--mr']) max.style.removeProperty(v);
    });
  }
}
