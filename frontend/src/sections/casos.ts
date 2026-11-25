import { CASOS, RESENAS, FAQS, LINKS, whatsappUrl } from '../data/content';
import { esc, join, etapa, ext } from './util';
import { icons } from './icons';

/** Casos de uso: antes/después deslizable por perfil. */
export function casos(): string {
  return `
<section id="casos" class="section" data-stage="5">
  <div class="halo halo--bl halo--soft" aria-hidden="true"></div>
  <div class="container">
    <header class="section__head" data-reveal>
      ${etapa(6, 'Bitácora')}
      <h2 class="h2">Así cambia una semana de <em class="hl">trabajo</em></h2>
      <p class="lead">Elige un perfil y desliza para ver el antes y el después.</p>
    </header>

    <div class="tabs" role="tablist" aria-label="Perfiles">
      ${join(
        CASOS,
        (c, i) =>
          `<button type="button" role="tab" class="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-case-tab="${c.id}">${esc(c.perfil)}</button>`,
      )}
    </div>

    ${join(
      CASOS,
      (c, i) => `
    <div class="case" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" data-case="${c.id}" ${i === 0 ? '' : 'hidden'}>
      <div class="compare is-start" data-compare style="--pos:0%">
        <div class="compare__side compare__side--antes">
          <p class="compare__label">Antes</p>
          <ul>${join(c.antes, (t) => `<li>${esc(t)}</li>`)}</ul>
        </div>
        <div class="compare__side compare__side--despues">
          <p class="compare__label">Después</p>
          <ul>${join(c.despues, (t) => `<li>${esc(t)}</li>`)}</ul>
        </div>
        <div class="compare__handle" aria-hidden="true"><span>${icons.swap}</span></div>
        <input class="compare__range" type="range" min="0" max="100" value="0" step="1"
          aria-label="Deslizar entre antes y después para ${esc(c.perfil.toLowerCase())}" aria-valuetext="Antes" />
      </div>
      <div class="case__foot">
        <div class="case__jump">
          <button type="button" class="chip-btn chip-btn--sm" data-jump="0">Ver antes</button>
          <button type="button" class="chip-btn chip-btn--sm" data-jump="100">Ver después</button>
        </div>
        <p class="case__tools">Con ${join(c.herramientas, (h, j) => `${j ? (j === c.herramientas.length - 1 ? ' y ' : ', ') : ''}<strong>${esc(h)}</strong>`)}</p>
      </div>
    </div>`,
    )}
  </div>
</section>`;
}

export function resenas(): string {
  return `
<section id="resenas" class="section section--tight" aria-labelledby="resenas-title">
  <div class="container">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Reseñas</p>
      <h2 class="h2" id="resenas-title">Lo que cuentan los equipos <em class="hl">formados</em></h2>
    </header>
    <ul class="reviews">
      ${join(
        RESENAS,
        (r, i) => `
      <li class="card review${r.autorizado ? '' : ' review--pending'}" data-reveal style="--d:${i * 80}ms">
        ${r.autorizado ? '' : '<p class="review__flag">Espacio para testimonio autorizado</p>'}
        <blockquote><p>${esc(r.texto)}</p></blockquote>
        <p class="review__who"><span class="review__avatar" aria-hidden="true">${esc(r.iniciales)}</span><span><strong>${esc(r.nombre)}</strong><br />${esc(r.cargo)}</span></p>
      </li>`,
      )}
    </ul>
  </div>
</section>`;
}

export function faqs(): string {
  return `
<section id="faqs" class="section" data-stage="6">
  <div class="halo halo--tr halo--soft" aria-hidden="true"></div>
  <div class="container faq">
    <div class="faq__aside" data-reveal>
      ${etapa(7, 'Llegada')}
      <h2 class="h2">Preguntas <em class="hl">frecuentes</em></h2>
      <p class="lead">Modalidades, fechas y requisitos. Si tu duda no está aquí, escríbenos.</p>
      <img class="faq__max" src="/max/explicando.webp" width="400" height="699" alt="" loading="lazy" decoding="async" />
    </div>
    <div class="faq__list">
      ${join(
        FAQS,
        (f) => `
      <details class="faq-item" data-reveal>
        <summary><span>${esc(f.pregunta)}</span><span class="faq-item__icon" aria-hidden="true">${icons.plus}</span></summary>
        <div class="faq-item__body"><p>${esc(f.respuesta)}</p></div>
      </details>`,
      )}
      <div class="faq__links">
        <a class="btn btn--outline" href="${LINKS.diagnostico}" ${ext}>Haz el diagnóstico${icons.external}</a>
        <a class="btn btn--outline" href="${LINKS.certificado}" ${ext}>Consulta tu certificado${icons.external}</a>
        <a class="btn btn--ghost" href="${whatsappUrl('Hola, tengo una pregunta sobre AI Academy.')}" ${ext}>${icons.chat}<span>Pregunta por WhatsApp</span></a>
      </div>
    </div>
  </div>
</section>`;
}
