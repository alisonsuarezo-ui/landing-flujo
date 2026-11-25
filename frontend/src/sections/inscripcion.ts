import { INSCRIPCION, MISIONES, LINKS, whatsappUrl, programaApi } from '../data/content';
import { destacar, esc, join, ext, pill } from './util';
import { icons } from './icons';

/**
 * Reto 4 · Formulario de interesados.
 * Se integra en la etapa «Llegada» con los mismos recursos de marca:
 * píldora, titular con una palabra destacada, pasos numerados en Evox Purple,
 * tarjeta al 10 % de violeta y Max sobre fondo negro.
 *
 * El envío real lo hace src/scripts/lead-form.ts (POST /api/leads).
 */
export function inscripcion(): string {
  const i = INSCRIPCION;
  return `
<section id="inscripcion" class="section enroll" aria-labelledby="inscripcion-title">
  <div class="halo halo--tr" aria-hidden="true"></div>
  <div class="halo halo--bl halo--soft" aria-hidden="true"></div>
  <div class="container enroll__grid">
    <div class="enroll__copy" data-reveal>
      ${pill(i.etiqueta)}
      <h2 class="h2" id="inscripcion-title">${destacar(i.titular, i.palabraDestacada)}</h2>
      <p class="lead">${esc(i.bajada)}</p>
      <ol class="enroll__steps">
        ${join(
          i.pasos,
          (p, n) => `
        <li>
          <span class="step-num" aria-hidden="true">${n + 1}</span>
          <div><p class="enroll__step-title">${esc(p.titulo)}</p><p>${esc(p.texto)}</p></div>
        </li>`,
        )}
      </ol>
      <img class="enroll__visor" src="/max/visor-idea.webp" width="112" height="99" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="card enroll__card" data-reveal>
      <form class="lead-form" data-lead-form novalidate aria-labelledby="lead-form-title" aria-describedby="lead-form-req">
        <div class="lead-form__head">
          <h3 class="h3" id="lead-form-title">Quiero más información</h3>
          <p class="hint" id="lead-form-req">Los campos con <span aria-hidden="true">*</span><span class="sr-only">asterisco</span> son obligatorios.</p>
        </div>

        <div class="field" data-field="nombre">
          <label for="lead-nombre">Nombre completo <span class="field__req" aria-hidden="true">*</span></label>
          <input id="lead-nombre" name="nombre" type="text" autocomplete="name" required minlength="3" maxlength="120"
            placeholder="Ej. Laura Martínez" aria-describedby="lead-nombre-error" />
          <p class="field__error" id="lead-nombre-error" data-error-for="nombre" aria-live="polite"></p>
        </div>

        <div class="field" data-field="correo">
          <label for="lead-correo">Correo electrónico <span class="field__req" aria-hidden="true">*</span></label>
          <input id="lead-correo" name="correo" type="email" inputmode="email" autocomplete="email" required maxlength="160"
            placeholder="tucorreo@empresa.com" aria-describedby="lead-correo-error" spellcheck="false" autocapitalize="off" />
          <p class="field__error" id="lead-correo-error" data-error-for="correo" aria-live="polite"></p>
        </div>

        <div class="field" data-field="telefono">
          <label for="lead-telefono">Teléfono <span class="field__opt">(opcional)</span></label>
          <input id="lead-telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" maxlength="30"
            placeholder="+57 300 123 4567" aria-describedby="lead-telefono-hint lead-telefono-error" />
          <p class="hint field__hint" id="lead-telefono-hint">Si lo dejas, también podemos escribirte por WhatsApp.</p>
          <p class="field__error" id="lead-telefono-error" data-error-for="telefono" aria-live="polite"></p>
        </div>

        <fieldset class="field field--group" data-field="programaInteres" aria-describedby="lead-programa-error">
          <legend>Programa de interés <span class="field__req" aria-hidden="true">*</span></legend>
          <div class="program-options">
            ${join(
              MISIONES,
              (m) => `
            <label class="option program-option">
              <input type="radio" name="programaInteres" value="${programaApi(m.id)}" required />
              <span class="program-option__txt"><strong>${esc(m.nombre)}</strong><small>${esc(m.duracion)} · ${esc(m.modalidad)}</small></span>
            </label>`,
            )}
          </div>
          <p class="field__error" id="lead-programa-error" data-error-for="programaInteres" aria-live="polite"></p>
        </fieldset>

        <!-- Campo trampa para bots: las personas no lo ven ni lo llenan. -->
        <div class="lead-form__hp" aria-hidden="true">
          <label for="lead-web">Sitio web</label>
          <input id="lead-web" name="sitioWeb" type="text" tabindex="-1" autocomplete="off" />
        </div>

        <p class="lead-form__alert" data-lead-alert role="alert" hidden></p>

        <button class="btn btn--primary btn--lg btn--block lead-form__submit" type="submit" data-lead-submit>
          <span class="lead-form__spinner" aria-hidden="true"></span>
          <span data-lead-submit-label>Enviar registro</span>${icons.arrow}
        </button>
        <p class="lead-form__legal">Al enviar autorizas a Campuslands AI Academy a contactarte sobre esta solicitud. Consulta la <a href="${LINKS.privacidad}" ${ext}>política de privacidad</a>.</p>
      </form>

      <div class="lead-success" data-lead-success hidden tabindex="-1" aria-labelledby="lead-success-title">
        <img class="lead-success__max" src="/max/aprobando.webp" width="400" height="749" alt="" loading="lazy" decoding="async" />
        <p class="eyebrow">Misión confirmada</p>
        <h3 class="h3" id="lead-success-title" data-lead-success-title>${esc(i.exito.titulo)}</h3>
        <p data-lead-success-text>${esc(i.exito.texto)}</p>
        <p class="lead-success__meta" data-lead-success-meta></p>
        <div class="lead-success__actions">
          <a class="btn btn--ghost btn--block" href="${whatsappUrl('Hola, acabo de registrarme en la landing de AI Academy y quiero más información.')}" ${ext}>${icons.chat}<span>Escríbenos por WhatsApp</span></a>
          <button class="btn btn--outline btn--block" type="button" data-lead-again>Registrar a otra persona</button>
        </div>
      </div>
    </div>
  </div>
</section>`;
}
