import { HERRAMIENTAS, TERRITORIOS, type Herramienta, type Territorio } from '../data/content';
import { esc, join, etapa } from './util';
import { icons } from './icons';

/**
 * Pieza 4 · Exploración libre: constelación de las 14 herramientas.
 * Cada estrella abre un caso práctico; las que tienen demo muestran un
 * mini simulador del prompt o del flujo en acción.
 */

const R_INTERIOR = 24; // % del contenedor
const R_EXTERIOR = 41.5;

type Pos = { x: number; y: number };

function posiciones(): Map<string, Pos> {
  const map = new Map<string, Pos>();
  const anillo = (items: Herramienta[], r: number, offset: number) =>
    items.forEach((h, i) => {
      const a = ((i / items.length) * 360 + offset - 90) * (Math.PI / 180);
      map.set(h.id, { x: +(50 + r * Math.cos(a)).toFixed(2), y: +(50 + r * Math.sin(a)).toFixed(2) });
    });
  anillo(HERRAMIENTAS.filter((h) => h.interior), R_INTERIOR, 0);
  anillo(HERRAMIENTAS.filter((h) => !h.interior), R_EXTERIOR, 20);
  return map;
}

/** Líneas que unen las herramientas de un mismo territorio. */
function lineas(pos: Map<string, Pos>): string {
  const out: string[] = [];
  (Object.keys(TERRITORIOS) as Territorio[]).forEach((t) => {
    const grupo = HERRAMIENTAS.filter((h) => h.territorio === t);
    for (let i = 1; i < grupo.length; i++) {
      const a = pos.get(grupo[i - 1].id)!;
      const b = pos.get(grupo[i].id)!;
      out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" data-terr="${t}" />`);
    }
  });
  return out.join('');
}

export function panelHerramienta(h: Herramienta): string {
  return `
      <div class="tool-panel__head">
        <p class="pill pill--sm">${esc(TERRITORIOS[h.territorio].nombre)}</p>
        <h3 class="h3" id="tool-name">${esc(h.nombre)}</h3>
      </div>
      <p class="eyebrow">Caso práctico</p>
      <p class="tool-panel__case">${esc(h.caso)}</p>
      ${
        h.demo
          ? `<div class="demo" data-demo>
          <div class="demo__bar">
            <span class="demo__title">${esc(h.demo.titulo)}</span>
            <button type="button" class="btn btn--primary btn--sm" data-demo-run>${icons.play}<span>Ver en acción</span></button>
          </div>
          <ol class="demo__log demo__log--${h.demo.tipo}" data-demo-log aria-live="polite"></ol>
        </div>`
          : `<p class="hint">Esta herramienta se trabaja con ejercicios de tu área durante la misión.</p>`
      }`;
}

export function herramientas(): string {
  const pos = posiciones();
  const primera = HERRAMIENTAS[0];
  return `
<section id="herramientas" class="section" data-stage="2">
  <div class="halo halo--tr" aria-hidden="true"></div>
  <div class="container">
    <header class="section__head" data-reveal>
      ${etapa(3, 'Despegue')}
      <h2 class="h2">14 herramientas, una <em class="hl">constelación</em></h2>
      <p class="lead">Toca una estrella para ver qué resuelve en tu trabajo. Las que brillan tienen una demo corta.</p>
    </header>

    <div class="filters" role="group" aria-label="Filtrar por territorio">
      <button type="button" class="chip-btn chip-btn--sm" aria-pressed="true" data-filter="todas">Todas</button>
      ${join(
        Object.entries(TERRITORIOS) as [Territorio, { nombre: string }][],
        ([id, t]) =>
          `<button type="button" class="chip-btn chip-btn--sm" aria-pressed="false" data-filter="${id}">${esc(t.nombre)}</button>`,
      )}
    </div>
    <p class="filters__desc" data-filter-desc aria-live="polite">Mostrando las 14 herramientas.</p>

    <div class="tools">
      <div class="constellation" data-constellation>
        <svg class="constellation__svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <circle cx="50" cy="50" r="${R_INTERIOR}" class="orbit" />
          <circle cx="50" cy="50" r="${R_EXTERIOR}" class="orbit" />
          ${lineas(pos)}
        </svg>
        <div class="constellation__core" aria-hidden="true">
          <img src="/brand/casco-blanco.webp" width="40" height="32" alt="" loading="lazy" decoding="async" />
        </div>
        <ul class="constellation__list" aria-label="Herramientas">
          ${join(HERRAMIENTAS, (h, i) => {
            const p = pos.get(h.id)!;
            return `<li style="--x:${p.x}%;--y:${p.y}%;--i:${i}">
              <button type="button" class="star${h.demo ? ' star--demo' : ''}" data-tool="${h.id}" data-terr="${h.territorio}"
                aria-pressed="${i === 0}" aria-controls="tool-panel">
                <span class="star__dot" aria-hidden="true"></span>
                <span class="star__label">${esc(h.nombre)}</span>
                ${h.demo ? '<span class="sr-only">(con demo)</span>' : ''}
              </button>
            </li>`;
          })}
        </ul>
      </div>

      <div class="tool-card card" data-reveal>
        <div class="tool-panel" id="tool-panel" data-tool-panel aria-labelledby="tool-name">
          ${panelHerramienta(primera)}
        </div>
        <img class="tool-card__max" src="/max/trabajando.webp" width="400" height="604" alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  </div>
</section>`;
}
