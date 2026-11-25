import { PERFILES, PREGUNTAS, type PerfilId, whatsappUrl, programaApi } from '../data/content';
import { recomendar, type Respuestas } from './recommend';
import { $, $$, reducedMotion, PERFIL_EVENT } from './shared';

/** Pieza 3 · Recomendador de misiones con acceso directo a inscripción o WhatsApp. */
export function initRecommender() {
  const form = $<HTMLFormElement>('[data-recommender]');
  const result = $('[data-result]');
  const list = $('[data-missions]');
  if (!form || !result || !list) return;

  const empty = $('[data-result-empty]', result)!;
  const full = $('[data-result-full]', result)!;
  const progress = $$('[data-q]', result);
  const cards = $$('[data-mission]', list);
  let ultima = '';

  const respuestas = (): Partial<Respuestas> => {
    const data = new FormData(form);
    return {
      tamano: (data.get('tamano') as Respuestas['tamano']) ?? undefined,
      tiempo: (data.get('tiempo') as Respuestas['tiempo']) ?? undefined,
      objetivo: (data.get('objetivo') as Respuestas['objetivo']) ?? undefined,
    };
  };

  const textoOpcion = <K extends keyof typeof PREGUNTAS>(k: K, v: string) =>
    PREGUNTAS[k].opciones.find((o) => o.valor === v)?.texto ?? v;

  const update = () => {
    const r = respuestas();
    progress.forEach((li) => li.classList.toggle('is-done', Boolean(r[li.dataset.q as keyof Respuestas])));
    if (!r.tamano || !r.tiempo || !r.objetivo) return;

    const { principal, alterna, razon } = recomendar(r as Respuestas);
    empty.hidden = true;
    full.hidden = false;
    $('[data-result-name]', full)!.textContent = principal.nombre;
    $('[data-result-meta]', full)!.textContent = `${principal.duracion} · ${principal.modalidad}`;
    $('[data-result-why]', full)!.textContent = `${principal.lema}. ${razon}`;
    const alt = $('[data-result-alt]', full)!;
    alt.innerHTML = '';
    alt.append('También te puede servir ');
    const a = document.createElement('a');
    a.href = `#mision-${alterna.id}`;
    a.textContent = `${alterna.nombre} (${alterna.duracion})`;
    alt.append(a, '.');

    const cta = $<HTMLAnchorElement>('[data-result-cta]', full)!;
    cta.textContent = `Inscribirme en ${principal.nombre}`;
    cta.dataset.programa = programaApi(principal.id);
    const wa = $<HTMLAnchorElement>('[data-result-wa]', full)!;
    wa.href = whatsappUrl(
      `Hola, el recomendador de la landing me sugirió la misión ${principal.nombre} (${principal.duracion}). ` +
        `Quiénes: ${textoOpcion('tamano', r.tamano)}. Tiempo: ${textoOpcion('tiempo', r.tiempo)}. ` +
        `Objetivo: ${textoOpcion('objetivo', r.objetivo)}. ¿Me cuentan las próximas fechas?`,
    );

    cards.forEach((c) => {
      const on = c.dataset.mission === principal.id;
      c.classList.toggle('is-recommended', on);
      $('[data-badge]', c)!.hidden = !on;
    });

    // Lleva la tarjeta recomendada a la vista dentro del carrusel (sin mover la página).
    if (ultima !== principal.id) {
      ultima = principal.id;
      const card = cards.find((c) => c.dataset.mission === principal.id)!;
      if (list.scrollWidth > list.clientWidth) {
        list.scrollTo({
          left: card.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft),
          behavior: reducedMotion() ? 'auto' : 'smooth',
        });
      }
    }
  };

  form.addEventListener('change', update);

  // El perfil elegido en el hero responde la primera pregunta si aún está vacía.
  document.addEventListener(PERFIL_EVENT, (e) => {
    const perfil = PERFILES[(e as CustomEvent<PerfilId>).detail];
    if (!perfil || respuestas().tamano) return;
    const radio = $<HTMLInputElement>(`input[name="tamano"][value="${perfil.tamano}"]`, form);
    if (radio) {
      radio.checked = true;
      update();
    }
  });
}
