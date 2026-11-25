import { NAV, NAV_EXTERNOS, ETAPAS, LINKS, whatsappUrl } from '../data/content';
import { esc, join, ext } from './util';
import { icons } from './icons';

/** Logo horizontal blanco: formato ancho sobre fondo oscuro (manual 03 · Logo). */
const logo = `
  <a class="brand" href="#inicio" aria-label="Campuslands AI Academy, volver al inicio">
    <img src="/brand/logo-horizontal-blanco.webp" width="168" height="38" alt="Campuslands AI Academy" decoding="async" />
  </a>`;

export function header(): string {
  return `
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header" data-header>
  <div class="site-header__bar container">
    ${logo}
    <nav class="nav" aria-label="Principal">
      <ul class="nav__list" id="menu" data-menu>
        ${join(NAV, (n) => `<li><a class="nav__link" href="${n.href}">${esc(n.label)}</a></li>`)}
        ${join(NAV_EXTERNOS, (n) => `<li><a class="nav__link nav__link--ext" href="${n.href}" ${ext}>${esc(n.label)}${icons.external}</a></li>`)}
        <li class="nav__mobile-cta"><a class="btn btn--primary btn--block" href="${LINKS.inscripcion}" data-inscribir>Inscríbete</a></li>
        <li class="nav__mobile-cta"><a class="btn btn--ghost btn--block" href="${whatsappUrl()}" ${ext}>${icons.chat}<span>Escríbenos por WhatsApp</span></a></li>
      </ul>
    </nav>
    <div class="site-header__actions">
      <a class="btn btn--primary btn--sm hide-mobile" href="${LINKS.inscripcion}" data-inscribir>Inscríbete</a>
      <button class="btn btn--icon btn--ghost menu-toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="menu-toggle__open">${icons.menu}</span><span class="menu-toggle__close">${icons.close}</span>
        <span class="sr-only">Menú</span>
      </button>
    </div>
  </div>
  ${progreso()}
</header>`;
}

/**
 * Indicador de progreso de la misión (pieza 2).
 * Barra superior en todos los tamaños + riel de etapas en escritorio.
 */
function progreso(): string {
  return `
  <div class="mission-bar" aria-hidden="true"><span class="mission-bar__fill" data-progress-fill></span></div>
  <p class="mission-chip" data-stage-chip aria-hidden="true">
    <span class="mission-chip__n" data-stage-n>01</span><span class="mission-chip__sep">/</span><span>${String(ETAPAS.length).padStart(2, '0')}</span>
    <span class="mission-chip__name" data-stage-name>${esc(ETAPAS[0].nombre)}</span>
  </p>`;
}

/** Riel lateral de etapas (escritorio). Navegable con teclado. */
export function riel(): string {
  return `
<nav class="mission-rail" aria-label="Etapas de la misión">
  <ol>
    ${join(
      ETAPAS,
      (e, i) => `<li><a href="#${e.id}" data-rail="${i}"><span class="mission-rail__dot"></span><span class="mission-rail__label">${esc(e.nombre)}</span></a></li>`,
    )}
  </ol>
</nav>`;
}

/** Barra fija inferior en móvil: inscripción y WhatsApp siempre a mano. */
export function ctaMovil(): string {
  return `
<div class="mobile-cta" data-mobile-cta>
  <a class="btn btn--ghost" href="${whatsappUrl()}" ${ext}>${icons.chat}<span>WhatsApp</span></a>
  <a class="btn btn--primary" href="${LINKS.inscripcion}" data-inscribir>Inscríbete</a>
</div>
<a class="wa-float" href="${whatsappUrl()}" ${ext} aria-label="Escríbenos por WhatsApp">${icons.chat}<span>WhatsApp</span></a>`;
}
