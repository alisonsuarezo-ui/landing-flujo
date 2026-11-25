import { HERRAMIENTAS, TERRITORIOS, type Herramienta, type Territorio } from '../data/content';
import { panelHerramienta } from '../sections/herramientas';
import { $, $$, reducedMotion, wait } from './shared';

/**
 * Pieza 4 · Constelación de herramientas + mini simulador.
 * Tocar una estrella abre su caso práctico; los filtros resaltan un territorio.
 * Flechas del teclado: recorren las estrellas visibles.
 */
export function initTools() {
  const root = $('[data-constellation]');
  const panel = $('[data-tool-panel]');
  if (!root || !panel) return;

  const stars = $$<HTMLButtonElement>('[data-tool]', root);
  const lines = $$<SVGLineElement>('line[data-terr]', root);
  const filters = $$<HTMLButtonElement>('[data-filter]');
  const desc = $('[data-filter-desc]');
  const porId = new Map(HERRAMIENTAS.map((h) => [h.id, h]));

  let filtro: Territorio | 'todas' = 'todas';
  let run = 0; // invalida demos en curso al cambiar de herramienta

  const resaltar = (terr: Territorio | null) =>
    lines.forEach((l) => l.classList.toggle('is-active', terr !== null && l.dataset.terr === terr));

  const seleccionar = (h: Herramienta, { scroll = false } = {}) => {
    run++;
    stars.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.tool === h.id)));
    panel.innerHTML = panelHerramienta(h);
    panel.classList.remove('is-swapping');
    void panel.offsetWidth; // reinicia la animación de entrada
    panel.classList.add('is-swapping');
    resaltar(filtro === 'todas' ? h.territorio : filtro);
    bindDemo(h);
    // En móvil, el panel queda debajo: se acerca suavemente si no está a la vista.
    if (scroll && window.matchMedia('(max-width: 1099px)').matches) {
      const r = panel.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.85) {
        panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      }
    }
  };

  const bindDemo = (h: Herramienta) => {
    const btn = $<HTMLButtonElement>('[data-demo-run]', panel);
    const log = $('[data-demo-log]', panel);
    if (!btn || !log || !h.demo) return;
    btn.addEventListener('click', async () => {
      const id = ++run;
      btn.disabled = true;
      log.innerHTML = '';
      const pasos = h.demo!.pasos;
      for (const paso of pasos) {
        const esUsuario = paso.quien === 'Tú';
        if (!reducedMotion()) {
          const typing = document.createElement('li');
          typing.className = 'demo__typing';
          typing.setAttribute('aria-hidden', 'true');
          typing.innerHTML = '<span></span><span></span><span></span>';
          if (!esUsuario) log.append(typing);
          await wait(esUsuario ? 350 : 750);
          typing.remove();
          if (id !== run) return;
        }
        const li = document.createElement('li');
        li.className = `demo__msg${esUsuario ? ' is-user' : ''}`;
        const who = document.createElement('span');
        who.className = 'demo__who';
        who.textContent = paso.quien;
        const txt = document.createElement('span');
        txt.textContent = paso.texto;
        li.append(who, txt);
        log.append(li);
      }
      if (id !== run) return;
      btn.disabled = false;
      btn.lastElementChild!.textContent = 'Repetir';
    });
  };

  const aplicarFiltro = (f: Territorio | 'todas') => {
    filtro = f;
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    let visibles = 0;
    stars.forEach((s) => {
      const on = f === 'todas' || s.dataset.terr === f;
      s.classList.toggle('is-dim', !on);
      if (on) visibles++;
    });
    if (desc) {
      desc.textContent =
        f === 'todas'
          ? 'Mostrando las 14 herramientas.'
          : `${TERRITORIOS[f].nombre}: ${TERRITORIOS[f].texto} ${visibles} herramientas.`;
    }
    const actual = stars.find((s) => s.getAttribute('aria-pressed') === 'true');
    if (f !== 'todas' && actual?.dataset.terr !== f) {
      const primera = stars.find((s) => s.dataset.terr === f);
      if (primera) seleccionar(porId.get(primera.dataset.tool!)!);
    } else {
      resaltar(f === 'todas' ? (actual ? (actual.dataset.terr as Territorio) : null) : f);
    }
  };

  stars.forEach((s) => s.addEventListener('click', () => seleccionar(porId.get(s.dataset.tool!)!, { scroll: true })));
  filters.forEach((b) => b.addEventListener('click', () => aplicarFiltro(b.dataset.filter as Territorio | 'todas')));

  // Navegación con flechas entre estrellas visibles.
  root.addEventListener('keydown', (e) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(e.key)) return;
    const visibles = stars.filter((s) => !s.classList.contains('is-dim'));
    const i = visibles.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    visibles[(i + step + visibles.length) % visibles.length].focus();
  });

  // Estado inicial: primera herramienta seleccionada y su territorio resaltado.
  resaltar(HERRAMIENTAS[0].territorio);
  bindDemo(HERRAMIENTAS[0]);
}
