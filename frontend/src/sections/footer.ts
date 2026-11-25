import { LINKS, NAV, NAV_EXTERNOS, whatsappUrl } from '../data/content';
import { esc, join, ext } from './util';
import { icons } from './icons';

/** Bloque final de CTA (Evox Purple, una sola llamada a la acción). */
export function cierre(): string {
  return `
<section class="section section--tight closing" aria-labelledby="cierre-title">
  <div class="container closing__wrap" data-reveal>
    <img class="closing__visor" src="/max/visor-motivado.webp" width="112" height="99" alt="" loading="lazy" decoding="async" />
    <div class="cta-block">
      <h2 class="h2" id="cierre-title">Tu equipo está listo para despegar</h2>
      <p>Elige tu misión, déjanos tus datos o habla con un especialista. Te respondemos pronto.</p>
      <div class="cta-block__actions">
        <a class="btn btn--light btn--lg" href="${LINKS.inscripcion}" data-inscribir>Inscríbete${icons.arrow}</a>
        <a class="btn btn--on-purple btn--lg" href="${whatsappUrl()}" ${ext}>${icons.chat}<span>WhatsApp</span></a>
      </div>
    </div>
  </div>
</section>`;
}

export function footer(): string {
  return `
<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <!-- Logo principal (vertical a color) sobre negro, con su zona de protección. -->
      <img class="site-footer__logo" src="/brand/logo-principal.webp" width="160" height="119" alt="Campuslands AI Academy" loading="lazy" decoding="async" />
      <p>La academia de inteligencia artificial de Campuslands. Formamos empresas, equipos y profesionales para trabajar con IA.</p>
    </div>
    <nav aria-label="Secciones">
      <p class="site-footer__title">Explora</p>
      <ul>${join(NAV, (n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`)}</ul>
    </nav>
    <nav aria-label="Accesos">
      <p class="site-footer__title">Accesos</p>
      <ul>
        ${join(NAV_EXTERNOS, (n) => `<li><a href="${n.href}" ${ext}>${esc(n.label)}</a></li>`)}
        <li><a href="${LINKS.inscripcion}" data-inscribir>Inscríbete</a></li>
      </ul>
    </nav>
    <div>
      <p class="site-footer__title">Contacto</p>
      <ul>
        <li><a href="${whatsappUrl()}" ${ext}>WhatsApp</a></li>
        <li><a href="${LINKS.instagram}" ${ext}>Instagram ${esc(LINKS.instagramHandle)}</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__legal">
    <p>© 2026 Campuslands AI Academy</p>
    <ul>
      <li><a href="${LINKS.terminos}" ${ext}>Términos y condiciones</a></li>
      <li><a href="${LINKS.privacidad}" ${ext}>Política de privacidad</a></li>
    </ul>
  </div>
</footer>`;
}
