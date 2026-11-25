import { ETAPAS } from '../data/content';
import { $, $$, reducedMotion } from './shared';

/**
 * Pieza 2 · Recorrido narrativo ligado al scroll.
 * - Barra de progreso del viaje y etapa actual (chip en móvil, riel en escritorio).
 * - Revelado progresivo de bloques al entrar en pantalla.
 * - Telemetría del hero: altitud según el scroll.
 */
export function initJourney() {
  const fill = $('[data-progress-fill]');
  const chip = $('[data-stage-chip]');
  const chipN = $('[data-stage-n]');
  const chipName = $('[data-stage-name]');
  const telemetry = $('[data-telemetry]');
  const heroMax = $('[data-hero-max]');
  const sections = $$('[data-stage]');
  const rail = $$<HTMLAnchorElement>('[data-rail]');
  const navLinks = $$<HTMLAnchorElement>('.nav__link[href^="#"]');

  let current = -1;
  let ticking = false;
  let chipTimer = 0;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    fill?.style.setProperty('--p', p.toFixed(4));

    // Etapa actual: la última sección cuyo borde superior pasó el 40 % de la pantalla.
    let stage = 0;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= vh * 0.4) stage = Number(s.dataset.stage);
    }
    if (stage !== current) {
      current = stage;
      const n = String(stage + 1).padStart(2, '0');
      if (chipN) chipN.textContent = n;
      if (chipName) chipName.textContent = ETAPAS[stage].nombre;
      rail.forEach((a, i) => {
        a.classList.toggle('is-current', i === stage);
        a.classList.toggle('is-past', i < stage);
        if (i === stage) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });
      // En móvil, el chip de etapa aparece unos segundos al cambiar de etapa.
      if (chip && y > vh * 0.5) {
        chip.classList.add('is-visible');
        clearTimeout(chipTimer);
        chipTimer = window.setTimeout(() => chip.classList.remove('is-visible'), 2200);
      }
      const id = ETAPAS[stage].id;
      navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));
    }

    // Telemetría y despegue de Max en el hero.
    if (y < vh * 1.2) {
      if (telemetry) {
        telemetry.textContent =
          y < 24 ? 'T-00:03 · En plataforma' : `Altitud ${Math.round(y * 0.6).toLocaleString('es-CO')} km · Despegando`;
      }
      if (heroMax && !reducedMotion()) heroMax.style.setProperty('--lift', `${-Math.min(y * 0.35, 220)}px`);
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  initReveal();
}

function initReveal() {
  const items = $$('[data-reveal]');
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}
