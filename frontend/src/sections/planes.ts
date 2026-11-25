import { MISIONES, PREGUNTAS, LINKS, whatsappUrl, programaApi } from '../data/content';
import { esc, join, etapa, ext } from './util';
import { icons } from './icons';

/**
 * Pieza 3 · Recomendador de misiones + comparador de las cinco.
 * Usa radios nativos: funciona con teclado y lectores de pantalla.
 */
export function planes(): string {
  type Pregunta = { pregunta: string; opciones: readonly { valor: string; texto: string }[] };
  const preguntas = Object.entries(PREGUNTAS) as [string, Pregunta][];
  return `
<section id="planes" class="section" data-stage="4">
  <div class="halo halo--tr" aria-hidden="true"></div>
  <div class="halo halo--bl" aria-hidden="true"></div>
  <div class="container">
    <header class="section__head" data-reveal>
      ${etapa(5, 'Órbita')}
      <h2 class="h2">Cinco misiones. Elige tu <em class="hl">órbita</em></h2>
      <p class="lead">Responde tres preguntas y te sugerimos la misión que encaja con tu equipo, tu tiempo y tu objetivo.</p>
    </header>

    <div class="recommender">
      <form class="recommender__form" data-recommender aria-label="Recomendador de misiones" onsubmit="return false">
        ${join(
          preguntas,
          ([clave, q], i) => `
        <fieldset class="question" data-reveal>
          <legend><span class="step-num" aria-hidden="true">${i + 1}</span><span>${esc(q.pregunta)}</span></legend>
          <div class="question__options">
            ${join(
              q.opciones,
              (o) => `
            <label class="option">
              <input type="radio" name="${clave}" value="${o.valor}" />
              <span>${esc(o.texto)}</span>
            </label>`,
            )}
          </div>
        </fieldset>`,
        )}
      </form>

      <div class="result card" data-result aria-live="polite">
        <div class="result__empty" data-result-empty>
          <p class="eyebrow">Tu misión</p>
          <p class="result__placeholder">Responde las tres preguntas y aquí aparece tu recomendación.</p>
          <ol class="result__progress" aria-hidden="true"><li data-q="tamano"></li><li data-q="tiempo"></li><li data-q="objetivo"></li></ol>
        </div>
        <div class="result__full" data-result-full hidden>
          <img class="result__max" src="/max/aprobando.webp" width="400" height="749" alt="" loading="lazy" decoding="async" />
          <p class="eyebrow">Tu misión ideal</p>
          <p class="result__name" data-result-name>Booster</p>
          <p class="result__meta" data-result-meta>8 h · En vivo</p>
          <p class="result__why" data-result-why></p>
          <p class="result__alt" data-result-alt></p>
          <div class="result__ctas">
            <a class="btn btn--primary btn--block" href="${LINKS.inscripcion}" data-inscribir data-result-cta>Inscribirme</a>
            <a class="btn btn--ghost btn--block" href="${whatsappUrl()}" ${ext} data-result-wa>${icons.chat}<span>Hablar por WhatsApp</span></a>
          </div>
        </div>
      </div>
    </div>

    <h3 class="h3 missions__title" id="comparador">Compara las cinco misiones</h3>
    <ul class="missions" data-missions aria-labelledby="comparador">
      ${join(
        MISIONES,
        (m, i) => `
      <li class="mission card" id="mision-${m.id}" data-mission="${m.id}" data-reveal style="--d:${i * 60}ms">
        <p class="mission__badge" data-badge hidden>Tu misión</p>
        <p class="mission__n">Misión ${String(i + 1).padStart(2, '0')}</p>
        <h4 class="mission__name">${esc(m.nombre)}</h4>
        <p class="mission__meta"><span class="pill pill--sm">${esc(m.duracion)}</span><span>${esc(m.modalidad)}</span></p>
        <p class="mission__lema">${esc(m.lema)}</p>
        <p class="mission__para">${esc(m.paraQuien)}</p>
        <ul class="mission__list">
          ${join(m.incluye, (x) => `<li>${icons.check}<span>${esc(x)}</span></li>`)}
        </ul>
        <a class="btn btn--outline btn--block" href="${LINKS.inscripcion}" data-inscribir data-programa="${programaApi(m.id)}">Elegir ${esc(m.nombre)}<span class="sr-only"> (ir al formulario de inscripción)</span></a>
      </li>`,
      )}
    </ul>
    <p class="missions__swipe hint" aria-hidden="true">${icons.swap} Desliza para comparar</p>
  </div>
</section>`;
}
