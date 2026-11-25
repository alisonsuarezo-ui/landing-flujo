import { HERO, PERFILES, type PerfilId, whatsappUrl } from '../data/content';
import { destacar, esc, join, ext, pill } from './util';
import { icons } from './icons';

/**
 * Pieza 1 · Hero que reacciona al visitante.
 * - Elección de perfil: cambia la bajada, el botón y prepara el
 *   recomendador y los casos de uso.
 * - Cursor / dedo: los halos y Max se desplazan levemente.
 * - Scroll: Max «despega» y la telemetría marca la altitud.
 */
export function hero(): string {
  const perfiles = Object.entries(PERFILES) as [PerfilId, (typeof PERFILES)[PerfilId]][];
  return `
<section id="inicio" class="hero" data-stage="0" data-hero>
  <div class="halo halo--tr" data-halo="tr" aria-hidden="true"></div>
  <div class="halo halo--bl" data-halo="bl" aria-hidden="true"></div>
  <div class="stars" aria-hidden="true"></div>

  <div class="container hero__grid">
    <div class="hero__copy">
      ${pill(HERO.etiqueta)}
      <h1 class="display">${destacar(HERO.titular, HERO.palabraDestacada)}</h1>
      <p class="lead hero__lead" data-hero-lead>${esc(HERO.bajada)}</p>

      <div class="profile-picker" role="group" aria-labelledby="perfil-q">
        <p class="profile-picker__q" id="perfil-q">${esc(HERO.pregunta)}</p>
        <div class="profile-picker__options">
          ${join(
            perfiles,
            ([id, p]) =>
              `<button type="button" class="chip-btn" aria-pressed="false" data-profile="${id}">${esc(p.boton)}</button>`,
          )}
        </div>
      </div>

      <div class="hero__ctas">
        <a class="btn btn--primary btn--lg" href="#planes" data-hero-cta>${esc(HERO.cta)}${icons.arrow}</a>
        <a class="btn btn--ghost btn--lg" href="${whatsappUrl()}" ${ext} data-wa="hero">${icons.chat}<span>Habla con un especialista</span></a>
      </div>
    </div>

    <div class="hero__visual">
      <div class="hero__orbit" aria-hidden="true"><span></span><span></span></div>
      <div class="hero__max" data-hero-max>
        <img src="/max/presentando.webp" width="560" height="816" alt="Max, el astronauta de AI Academy, presentando la misión" fetchpriority="high" decoding="async" />
      </div>
      <p class="telemetry" aria-hidden="true">
        <span class="telemetry__dot"></span><span data-telemetry>T-00:03 · En plataforma</span>
      </p>
    </div>
  </div>

  <a class="scroll-cue" href="#beneficios"><span>Empieza el recorrido</span>${icons.arrowDown}</a>
</section>`;
}
