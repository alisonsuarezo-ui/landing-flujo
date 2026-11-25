import { BENEFICIOS, POR_QUE_AHORA } from '../data/content';
import { destacar, esc, join, etapa } from './util';

export function beneficios(): string {
  return `
<section id="beneficios" class="section" data-stage="1">
  <div class="halo halo--tr halo--soft" aria-hidden="true"></div>
  <div class="container">
    <header class="section__head" data-reveal>
      ${etapa(2, 'Prevuelo')}
      <h2 class="h2">Antes de despegar, esto es lo que <em class="hl">llevas</em></h2>
      <p class="lead">No vendemos cursos de IA: formamos equipos que trabajan con IA. Así se ve cada misión por dentro.</p>
    </header>
    <ol class="benefits">
      ${join(
        BENEFICIOS,
        (b, i) => `
        <li class="card benefit" data-reveal style="--d:${i * 80}ms">
          <span class="step-num" aria-hidden="true">${i + 1}</span>
          <h3 class="h3">${esc(b.titulo)}</h3>
          <p>${esc(b.texto)}</p>
        </li>`,
      )}
    </ol>
  </div>
</section>`;
}

/** ¿Por qué ahora? · calculadora del costo de esperar. */
export function porQueAhora(): string {
  const p = POR_QUE_AHORA;
  return `
<section id="por-que-ahora" class="section section--tight" data-stage="3">
  <div class="halo halo--bl halo--soft" aria-hidden="true"></div>
  <div class="container why">
    <div class="why__copy" data-reveal>
      ${etapa(4, 'Ventana de lanzamiento')}
      <h2 class="h2">${destacar(p.titular, p.palabraDestacada)}</h2>
      <p class="lead">${esc(p.bajada)}</p>
      <ul class="ticks">
        ${join(p.puntos, (t) => `<li>${esc(t)}</li>`)}
      </ul>
    </div>

    <form class="card calc" data-calc data-reveal aria-labelledby="calc-title" onsubmit="return false">
      <div class="calc__head">
        <img src="/max/visor-cansado.webp" width="72" height="63" alt="" loading="lazy" decoding="async" />
        <h3 class="h3" id="calc-title">El costo de esperar</h3>
      </div>

      <div class="range">
        <label for="calc-personas">Personas en tu equipo <output data-out="personas">5</output></label>
        <input type="range" id="calc-personas" name="personas" min="1" max="50" value="5" />
      </div>
      <div class="range">
        <label for="calc-horas">Horas a la semana en tareas repetitivas, por persona <output data-out="horas">5 h</output></label>
        <input type="range" id="calc-horas" name="horas" min="1" max="20" value="5" />
      </div>
      <div class="range">
        <label for="calc-pct">¿Qué parte podría hacer la IA? <output data-out="pct">30 %</output></label>
        <input type="range" id="calc-pct" name="pct" min="10" max="60" step="5" value="30" />
        <p class="hint">Es tu estimación. En la formación la medimos con tus tareas reales.</p>
      </div>

      <div class="calc__result" aria-live="polite">
        <p class="calc__big"><span data-calc-mes>32</span> h</p>
        <p>de trabajo al mes que tu equipo podría dedicar a otra cosa.</p>
        <p class="calc__small">En 6 meses de espera: <strong data-calc-semestre>195 h</strong>, unas <strong data-calc-jornadas>24 jornadas</strong> completas.</p>
      </div>
      <a class="btn btn--primary btn--block" href="#planes">Encuentra tu misión</a>
    </form>
  </div>
</section>`;
}
