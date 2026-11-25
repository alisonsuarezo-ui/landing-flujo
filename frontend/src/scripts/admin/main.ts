import { esc } from '../../sections/util';
import { $, $$ } from '../shared';
import { api, auth, ApiError, SESSION_EXPIRED, type Lead, type Metrics, type Seguimiento } from './api';
import { ESTADOS, nombreEstado } from './estados';

/**
 * Panel administrativo (Reto 4). Todo lo que muestra viene de la API real:
 * métricas, listado con búsqueda y filtros, detalle, cambios de estado, notas e historial.
 */

const ZONA = 'America/Bogota';
const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { timeZone: ZONA, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fechaLarga = (iso: string) => new Date(iso).toLocaleString('es-CO', { timeZone: ZONA, dateStyle: 'long', timeStyle: 'short' });
const num = (n: number) => n.toLocaleString('es-CO');
const badge = (estado: string) => `<span class="badge badge--${estado.toLowerCase()}">${esc(nombreEstado(estado))}</span>`;

const loginView = $('[data-view="login"]')!;
const appView = $('[data-view="app"]')!;
const toastEl = $('[data-toast]')!;
let toastTimer = 0;

function toast(msg: string, tipo: 'ok' | 'error' = 'ok') {
  toastEl.textContent = msg;
  toastEl.dataset.tipo = tipo;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toastEl.hidden = true), 3200);
}

function alerta(el: HTMLElement, msg: string, tipo: 'error' | 'info' = 'error') {
  el.textContent = msg;
  el.dataset.tipo = tipo;
  el.hidden = !msg;
}

/* ------------------------------------------------------------------ */
/* Sesión                                                              */
/* ------------------------------------------------------------------ */

function mostrar(vista: 'login' | 'app') {
  loginView.hidden = vista !== 'login';
  appView.hidden = vista !== 'app';
}

function initLogin() {
  const form = $<HTMLFormElement>('[data-login-form]')!;
  const al = $('[data-login-alert]', form)!;
  const btn = $<HTMLButtonElement>('[data-login-submit]', form)!;
  const label = $('[data-login-label]', form)!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    const fd = new FormData(form);
    const correo = String(fd.get('correo') ?? '').trim();
    const password = String(fd.get('password') ?? '');
    if (!correo || !password) {
      alerta(al, 'Escribe tu correo y tu contraseña.');
      return;
    }
    btn.disabled = true;
    form.classList.add('is-sending');
    label.textContent = 'Verificando…';
    alerta(al, '');
    try {
      const r = await api.login(correo, password);
      auth.save(r.token, r.admin);
      form.reset();
      await entrar();
    } catch (err) {
      alerta(al, err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      btn.disabled = false;
      form.classList.remove('is-sending');
      label.textContent = 'Ingresar';
    }
  });

  $('[data-logout]')!.addEventListener('click', () => salir());
  document.addEventListener(SESSION_EXPIRED, () => salir('Tu sesión expiró. Inicia sesión de nuevo.'));
}

function salir(msg = '') {
  auth.clear();
  cerrarDetalle(false);
  // La siguiente persona que entre no hereda la búsqueda, los filtros ni los datos de la sesión anterior.
  $<HTMLFormElement>('[data-filters]')?.reset();
  Object.assign(filtros, { q: '', estado: '', programa: '', page: 0 });
  $('[data-leads-body]')!.innerHTML = '';
  $('[data-team-list]')!.innerHTML = '';
  $('[data-table-summary]')!.textContent = '';
  mostrar('login');
  const al = $('[data-login-alert]')!;
  alerta(al, msg, 'info');
  $<HTMLInputElement>('#login-correo')?.focus();
}

async function entrar() {
  const admin = auth.admin();
  $('[data-admin-name]')!.textContent = admin ? admin.nombre : '';
  mostrar('app');
  await Promise.all([cargarMetricas(), cargarLeads(), cargarEquipo()]);
  abrirDesdeHash();
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

async function cargarMetricas() {
  try {
    pintarMetricas(await api.metrics());
    $('[data-updated]')!.textContent = `Actualizado ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (err) {
    if (err instanceof ApiError && err.status !== 401) toast(err.message, 'error');
  }
}

function pintarMetricas(m: Metrics) {
  const set = (k: string, v: string) => $$(`[data-kpi="${k}"]`).forEach((el) => (el.textContent = v));
  set('total', num(m.total));
  set('nuevos', num(m.nuevos));
  set('contactados', num(m.contactados));
  set('interesados', num(m.interesados));
  set('inscritos', num(m.inscritos));
  set('semana', num(m.registrosUltimos7Dias));
  $('[data-kpi-sub="total"]')!.textContent = `${num(m.registrosUltimos7Dias)} en los últimos 7 días`;
  $('[data-kpi-sub="inscritos"]')!.textContent = `Conversión ${m.tasaConversion.toLocaleString('es-CO')} %`;

  barrasH($('[data-chart="estado"]')!, ESTADOS.map((e) => ({ label: e.nombre, value: m.porEstado[e.id] ?? 0, filtro: ['estado', e.id] })), m.total);
  barrasH($('[data-chart="programa"]')!, m.porPrograma.map((p) => ({ label: p.nombre, value: p.total, filtro: ['programa', p.programa] })), m.total);
  barrasV($('[data-chart="dias"]')!, m.registrosPorDia);
}

type Barra = { label: string; value: number; filtro: [string, string] };

/** Barras horizontales: una sola serie, valor y porcentaje como etiqueta; clic = filtrar la tabla. */
function barrasH(el: HTMLElement, datos: Barra[], total: number) {
  const max = Math.max(1, ...datos.map((d) => d.value));
  el.innerHTML = datos
    .map((d) => {
      const pct = total ? Math.round((d.value / total) * 100) : 0;
      return `<button type="button" class="bar-row" role="listitem" data-filtro="${d.filtro[0]}:${d.filtro[1]}"
        data-tip="${esc(`${d.label}: ${num(d.value)} (${pct} %) · clic para filtrar`)}">
        <span class="bar-row__label">${esc(d.label)}</span>
        <span class="bar-row__track"><span class="bar-row__fill" style="--w:${(d.value / max) * 100}%"></span></span>
        <span class="bar-row__value">${num(d.value)}<small>${pct} %</small></span>
      </button>`;
    })
    .join('');
}

/** Columnas por día (últimos 14 días). */
function barrasV(el: HTMLElement, dias: Metrics['registrosPorDia']) {
  const max = Math.max(1, ...dias.map((d) => d.total));
  el.innerHTML = dias
    .map((d, i) => {
      const f = new Date(`${d.fecha}T12:00:00`);
      const dia = f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      const corto = f.toLocaleDateString('es-CO', { day: 'numeric' });
      const etiqueta = i === 0 || i === dias.length - 1 || i % 2 === 0;
      return `<div class="col" role="listitem" tabindex="0" data-tip="${esc(`${dia}: ${num(d.total)} registro${d.total === 1 ? '' : 's'}`)}">
        <span class="col__value">${d.total ? num(d.total) : ''}</span>
        <span class="col__bar" style="--h:${(d.total / max) * 100}%"></span>
        <span class="col__label">${etiqueta ? esc(corto) : ''}</span>
        <span class="sr-only">${esc(dia)}: ${num(d.total)}</span>
      </div>`;
    })
    .join('');
}

/** Tooltip compartido de los gráficos (hover y foco con teclado). */
function initTooltip() {
  const tip = $('[data-chart-tip]')!;
  const mostrarTip = (t: HTMLElement) => {
    tip.textContent = t.dataset.tip ?? '';
    tip.hidden = false;
    const r = t.getBoundingClientRect();
    const w = tip.offsetWidth;
    const left = Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2));
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.max(8, r.top - tip.offsetHeight - 8)}px`;
  };
  const ocultar = () => (tip.hidden = true);
  ['mouseover', 'focusin'].forEach((ev) =>
    document.addEventListener(ev, (e) => {
      const t = (e.target as Element).closest<HTMLElement>('.charts [data-tip]');
      if (t) mostrarTip(t);
      else if (ev === 'focusin') ocultar();
    }),
  );
  document.addEventListener('mouseout', (e) => {
    if ((e.target as Element).closest('.charts [data-tip]')) ocultar();
  });
  window.addEventListener('scroll', ocultar, { passive: true });
}

/* ------------------------------------------------------------------ */
/* Listado                                                             */
/* ------------------------------------------------------------------ */

const filtros = { q: '', estado: '', programa: '', page: 0, size: 10 };
let totalPaginas = 1;
let peticion = 0;

async function cargarLeads() {
  const id = ++peticion;
  const body = $('[data-leads-body]')!;
  body.closest('.table-wrap')!.classList.add('is-loading');
  try {
    const page = await api.leads({ ...filtros, sort: 'fechaRegistro,desc' });
    if (id !== peticion) return; // llegó una respuesta más nueva
    totalPaginas = Math.max(1, page.totalPages);
    body.innerHTML = page.content.map(filaLead).join('');
    $('[data-table-empty]')!.hidden = page.content.length > 0;
    const desde = page.totalElements ? page.page * page.size + 1 : 0;
    const hasta = page.page * page.size + page.content.length;
    $('[data-table-summary]')!.textContent = `Mostrando ${desde}–${hasta} de ${num(page.totalElements)} interesados`;
    $('[data-page-info]')!.textContent = `Página ${page.page + 1} de ${totalPaginas}`;
    $<HTMLButtonElement>('[data-page="prev"]')!.disabled = page.page <= 0;
    $<HTMLButtonElement>('[data-page="next"]')!.disabled = page.page + 1 >= totalPaginas;
  } catch (err) {
    if (err instanceof ApiError && err.status !== 401) toast(err.message, 'error');
  } finally {
    if (id === peticion) body.closest('.table-wrap')!.classList.remove('is-loading');
  }
}

function filaLead(l: Lead): string {
  return `<tr>
    <td data-th="Nombre"><button type="button" class="link-btn" data-open="${l.id}">${esc(l.nombre)}</button></td>
    <td data-th="Contacto"><span class="cell-main">${esc(l.correo)}</span><span class="cell-sub">${esc(l.telefono ?? 'Sin teléfono')}</span></td>
    <td data-th="Programa">${esc(l.programaNombre)}</td>
    <td data-th="Estado">${badge(l.estado)}</td>
    <td data-th="Registro"><time datetime="${esc(l.fechaRegistro)}">${esc(fechaCorta(l.fechaRegistro))}</time></td>
    <td class="cell-action"><button type="button" class="btn btn--outline btn--sm" data-open="${l.id}">Ver detalle<span class="sr-only"> de ${esc(l.nombre)}</span></button></td>
  </tr>`;
}

function initListado() {
  const form = $<HTMLFormElement>('[data-filters]')!;
  let debounce = 0;
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (!(t.name in filtros)) return;
    (filtros as Record<string, string | number>)[t.name] = t.value.trim();
    filtros.page = 0;
    clearTimeout(debounce);
    debounce = window.setTimeout(cargarLeads, t.name === 'q' ? 300 : 0);
  });
  $('[data-clear-filters]')!.addEventListener('click', () => {
    form.reset();
    Object.assign(filtros, { q: '', estado: '', programa: '', page: 0 });
    cargarLeads();
  });
  $$('[data-page]').forEach((b) =>
    b.addEventListener('click', () => {
      filtros.page = Math.min(totalPaginas - 1, Math.max(0, filtros.page + (b.dataset.page === 'next' ? 1 : -1)));
      cargarLeads();
    }),
  );
  // Clic en una barra del dashboard = filtrar la tabla por ese estado o programa.
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-filtro]');
    if (b) {
      const [campo, valor] = b.dataset.filtro!.split(':');
      const select = form.querySelector<HTMLSelectElement>(`[name="${campo}"]`)!;
      select.value = valor;
      (filtros as Record<string, string | number>)[campo] = valor;
      filtros.page = 0;
      cargarLeads();
      $('#leads-title')!.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const abrir = (e.target as Element).closest<HTMLElement>('[data-open]');
    if (abrir) abrirDetalle(Number(abrir.dataset.open), abrir);
  });
  $('[data-refresh]')!.addEventListener('click', () => {
    cargarMetricas();
    cargarLeads();
  });
}

/* ------------------------------------------------------------------ */
/* Detalle                                                             */
/* ------------------------------------------------------------------ */

const drawer = $('[data-drawer]')!;
const panel = $('.drawer__panel', drawer)!;
let actual: Lead | null = null;
let origen: HTMLElement | null = null;

async function abrirDetalle(id: number, desde: HTMLElement | null = null) {
  origen = desde;
  drawer.hidden = false;
  document.body.classList.add('has-drawer');
  $('[data-detail-name]')!.textContent = 'Cargando…';
  $('[data-detail-info]')!.innerHTML = '';
  $('[data-timeline]')!.innerHTML = '';
  alerta($('[data-detail-alert]')!, '');
  panel.focus();
  history.replaceState(null, '', `#lead-${id}`);
  try {
    const [lead, hist] = await Promise.all([api.lead(id), api.history(id)]);
    pintarDetalle(lead);
    pintarHistorial(hist);
  } catch (err) {
    $('[data-detail-name]')!.textContent = 'No disponible';
    alerta($('[data-detail-alert]')!, err instanceof ApiError ? err.message : 'No se pudo cargar el interesado.');
  }
}

function cerrarDetalle(devolverFoco = true) {
  if (drawer.hidden) return;
  drawer.hidden = true;
  document.body.classList.remove('has-drawer');
  actual = null;
  history.replaceState(null, '', location.pathname);
  if (devolverFoco) origen?.focus();
}

function abrirDesdeHash() {
  const m = location.hash.match(/^#lead-(\d+)$/);
  if (m) abrirDetalle(Number(m[1]));
}

function pintarDetalle(l: Lead) {
  actual = l;
  $('[data-detail-id]')!.textContent = `#${l.id}`;
  $('[data-detail-name]')!.textContent = l.nombre;
  const tel = l.telefono ? l.telefono.replace(/[^\d+]/g, '') : '';
  const wa = tel ? tel.replace(/^\+/, '') : '';
  $('[data-detail-info]')!.innerHTML = `
    <div><dt>Estado</dt><dd>${badge(l.estado)}</dd></div>
    <div><dt>Programa</dt><dd>${esc(l.programaNombre)}</dd></div>
    <div><dt>Correo</dt><dd><a href="mailto:${esc(l.correo)}">${esc(l.correo)}</a></dd></div>
    <div><dt>Teléfono</dt><dd>${
      l.telefono
        ? `<a href="tel:${esc(tel)}">${esc(l.telefono)}</a> · <a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>`
        : 'No registrado'
    }</dd></div>
    <div><dt>Registro</dt><dd>${esc(fechaLarga(l.fechaRegistro))}</dd></div>
    <div><dt>Última actualización</dt><dd>${esc(fechaLarga(l.fechaActualizacion))}</dd></div>`;

  const edit = $<HTMLFormElement>('[data-edit-form]')!;
  (edit.elements.namedItem('nombre') as HTMLInputElement).value = l.nombre;
  (edit.elements.namedItem('correo') as HTMLInputElement).value = l.correo;
  (edit.elements.namedItem('telefono') as HTMLInputElement).value = l.telefono ?? '';
  (edit.elements.namedItem('programaInteres') as HTMLSelectElement).value = l.programaInteres;
  $$('[data-error-for]', edit).forEach((p) => (p.textContent = ''));

  const status = $<HTMLFormElement>('[data-status-form]')!;
  const select = status.elements.namedItem('estado') as HTMLSelectElement;
  Array.from(select.options).forEach((o) => {
    o.disabled = o.value === l.estado;
    o.textContent = nombreEstado(o.value) + (o.value === l.estado ? ' (actual)' : '');
  });
  const siguiente = ESTADOS.map((e) => e.id).find((id) => id !== l.estado && ESTADOS.findIndex((e) => e.id === id) > ESTADOS.findIndex((e) => e.id === l.estado));
  select.value = siguiente ?? ESTADOS.find((e) => e.id !== l.estado)!.id;
}

function pintarHistorial(items: Seguimiento[]) {
  const ol = $('[data-timeline]')!;
  // Resumen para quien retome el caso: el último movimiento hecho por una persona del equipo.
  const ultimo = [...items].reverse().find((s) => !s.responsable.startsWith('Sistema') && !s.responsable.startsWith('Landing'));
  const resumen = $('[data-detail-last]')!;
  resumen.hidden = !ultimo;
  if (ultimo) {
    const que = ultimo.tipo === 'CAMBIO_ESTADO' ? `pasó a ${nombreEstado(ultimo.estadoNuevo!)}` : 'registró una nota';
    resumen.innerHTML = `<strong>Último seguimiento:</strong> ${esc(ultimo.responsable)} ${esc(que)} el ${esc(fechaLarga(ultimo.fecha))}${
      ultimo.nota ? ` — «${esc(ultimo.nota)}»` : ''
    }`;
  }
  if (!items.length) {
    ol.innerHTML = '<li class="timeline__empty">Sin movimientos todavía.</li>';
    return;
  }
  ol.innerHTML = items
    .map((s) => {
      const titulo =
        s.tipo === 'REGISTRO'
          ? `Registro · ${badge(s.estadoNuevo!)}`
          : s.tipo === 'CAMBIO_ESTADO'
            ? `${badge(s.estadoAnterior!)} <span aria-hidden="true">→</span><span class="sr-only">a</span> ${badge(s.estadoNuevo!)}`
            : s.responsable.startsWith('Sistema') ? 'Evento del sistema' : 'Nota';
      return `<li class="timeline__item timeline__item--${s.tipo.toLowerCase()}${s.responsable.startsWith('Sistema') ? ' timeline__item--sistema' : ''}">
        <span class="timeline__dot" aria-hidden="true"></span>
        <div class="timeline__content">
          <p class="timeline__title">${titulo}</p>
          ${s.nota ? `<p class="timeline__note">${esc(s.nota)}</p>` : ''}
          <p class="timeline__meta"><time datetime="${esc(s.fecha)}">${esc(fechaLarga(s.fecha))}</time> · ${esc(s.responsable)}</p>
        </div>
      </li>`;
    })
    .join('');
}

async function refrescarDetalle() {
  if (!actual) return;
  const [lead, hist] = await Promise.all([api.lead(actual.id), api.history(actual.id)]);
  pintarDetalle(lead);
  pintarHistorial(hist);
  cargarMetricas();
  cargarLeads();
}

function initDetalle() {
  $$('[data-drawer-close]', drawer).forEach((b) => b.addEventListener('click', () => cerrarDetalle()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) cerrarDetalle();
    // Mantiene el foco dentro del panel mientras está abierto.
    if (e.key === 'Tab' && !drawer.hidden) {
      const focusables = $$<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, summary', panel).filter((el) => el.offsetParent !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener('hashchange', abrirDesdeHash);

  const conBoton = async (form: HTMLFormElement, fn: () => Promise<void>) => {
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    if (btn.disabled || !actual) return;
    btn.disabled = true;
    alerta($('[data-detail-alert]')!, '');
    try {
      await fn();
    } catch (err) {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([c, m]) => {
          const p = form.querySelector(`[data-error-for="${c}"]`);
          if (p) p.textContent = m;
        });
        if (err.status !== 401) alerta($('[data-detail-alert]')!, err.message);
      } else alerta($('[data-detail-alert]')!, 'No se pudo completar la operación.');
    } finally {
      btn.disabled = false;
    }
  };

  const status = $<HTMLFormElement>('[data-status-form]')!;
  status.addEventListener('submit', (e) => {
    e.preventDefault();
    conBoton(status, async () => {
      const fd = new FormData(status);
      const estado = String(fd.get('estado'));
      await api.status(actual!.id, estado, String(fd.get('nota') ?? '').trim());
      status.reset();
      toast(`Estado actualizado a ${nombreEstado(estado)}`);
      await refrescarDetalle();
    });
  });

  const note = $<HTMLFormElement>('[data-note-form]')!;
  note.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = String(new FormData(note).get('nota') ?? '').trim();
    const err = $('[data-error-for="nota"]', note)!;
    err.textContent = texto ? '' : 'Escribe la nota antes de guardarla.';
    if (!texto) return;
    conBoton(note, async () => {
      await api.note(actual!.id, texto);
      note.reset();
      toast('Nota registrada');
      await refrescarDetalle();
    });
  });

  const edit = $<HTMLFormElement>('[data-edit-form]')!;
  edit.addEventListener('submit', (e) => {
    e.preventDefault();
    $$('[data-error-for]', edit).forEach((p) => (p.textContent = ''));
    conBoton(edit, async () => {
      const fd = new FormData(edit);
      await api.update(actual!.id, {
        nombre: String(fd.get('nombre') ?? '').trim(),
        correo: String(fd.get('correo') ?? '').trim(),
        telefono: String(fd.get('telefono') ?? '').trim() || null,
        programaInteres: String(fd.get('programaInteres')),
      });
      toast('Datos actualizados');
      $<HTMLDetailsElement>('[data-edit-box]')!.open = false;
      await refrescarDetalle();
    });
  });
}

/* ------------------------------------------------------------------ */
/* Equipo administrador                                                */
/* ------------------------------------------------------------------ */

async function cargarEquipo() {
  try {
    const admins = await api.admins();
    const yo = auth.admin()?.correo;
    $('[data-team-list]')!.innerHTML = admins
      .map(
        (a) => `<li class="team__item">
          <span class="team__avatar" aria-hidden="true">${esc(a.nombre.trim().charAt(0).toUpperCase())}</span>
          <span class="team__who"><strong>${esc(a.nombre)}${a.correo === yo ? ' <span class="pill pill--sm">Tú</span>' : ''}</strong><span class="cell-sub">${esc(a.correo)} · desde ${esc(fechaCorta(a.fechaCreacion))}</span></span>
        </li>`,
      )
      .join('');
  } catch (err) {
    if (err instanceof ApiError && err.status !== 401) toast(err.message, 'error');
  }
}

function initEquipo() {
  const form = $<HTMLFormElement>('[data-team-form]')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    if (btn.disabled) return;
    $$('[data-error-for]', form).forEach((p) => (p.textContent = ''));
    const fd = new FormData(form);
    const body = {
      nombre: String(fd.get('nombre') ?? '').trim(),
      correo: String(fd.get('correo') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
    };
    btn.disabled = true;
    try {
      const nuevo = await api.createAdmin(body);
      form.reset();
      toast(`Cuenta creada para ${nuevo.nombre}`);
      await cargarEquipo();
    } catch (err) {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([c, m]) => {
          const p = form.querySelector(`[data-error-for="${c}"]`);
          if (p) p.textContent = m;
        });
        if (err.status !== 401 && !Object.keys(err.fieldErrors).length) toast(err.message, 'error');
      }
    } finally {
      btn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Arranque                                                            */
/* ------------------------------------------------------------------ */

initLogin();
initListado();
initDetalle();
initEquipo();
initTooltip();

if (auth.token()) {
  // Verifica que el token siga vigente antes de mostrar el panel.
  api
    .me()
    .then(() => entrar())
    .catch(() => salir());
} else {
  mostrar('login');
}
