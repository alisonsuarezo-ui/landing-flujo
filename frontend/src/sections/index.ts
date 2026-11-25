import { header, riel, ctaMovil } from './header';
import { hero } from './hero';
import { beneficios, porQueAhora } from './beneficios';
import { herramientas } from './herramientas';
import { planes } from './planes';
import { casos, resenas, faqs } from './casos';
import { cierre, footer } from './footer';
import { inscripcion } from './inscripcion';

/**
 * Orden del recorrido (hilo conductor de la misión):
 * Cuenta regresiva → Prevuelo → Despegue → Ventana de lanzamiento →
 * Órbita → Bitácora → Llegada.
 *
 * «¿Por qué ahora?» va justo antes de los planes: el costo de esperar
 * es el empujón para elegir misión.
 *
 * Reto 4: la inscripción (formulario de interesados) cierra la etapa
 * «Llegada», justo antes del bloque CTA final.
 */
export function renderBody(): string {
  return [
    header(),
    riel(),
    '<main id="contenido">',
    hero(),
    beneficios(),
    herramientas(),
    porQueAhora(),
    planes(),
    casos(),
    resenas(),
    faqs(),
    inscripcion(),
    cierre(),
    '</main>',
    footer(),
    ctaMovil(),
  ].join('\n');
}
