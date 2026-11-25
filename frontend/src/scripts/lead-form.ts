import { API_BASE, MISIONES, programaApi } from '../data/content';
import { $, $$, store } from './shared';

/**
 * Reto 4 · Formulario de interesados.
 * - Validación en el navegador (la misma regla que aplica el backend).
 * - Envío real: POST /api/leads → Spring Boot → PostgreSQL → n8n → Telegram.
 * - Control de envíos repetidos: botón bloqueado mientras envía, aviso si este
 *   navegador ya registró ese correo para la misma misión y respuesta 409 del backend.
 * - Los botones «Inscríbete» y «Elegir misión» de toda la página llevan aquí
 *   y preseleccionan la misión cuando la conocen (data-programa).
 */

type Campo = 'nombre' | 'correo' | 'telefono' | 'programaInteres';
type Datos = Record<Campo, string>;

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const NOMBRE_RE = /^[\p{L}][\p{L} .'-]*$/u;
const TELEFONO_RE = /^\+?[0-9 ()-]{7,20}$/;
const TIMEOUT_MS = 15000;
const CLAVE_ENVIADOS = 'aia:leads-enviados';

const nombrePrograma = (valor: string) => MISIONES.find((m) => programaApi(m.id) === valor)?.nombre ?? valor;

/** Reglas de validación. Devuelve el mensaje de error o '' si el campo es válido. */
export function validarCampo(campo: Campo, valor: string): string {
  const v = valor.trim();
  switch (campo) {
    case 'nombre':
      if (!v) return 'Escribe tu nombre completo.';
      if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      if (v.length > 120) return 'El nombre no puede superar 120 caracteres.';
      if (!NOMBRE_RE.test(v)) return 'Usa solo letras, espacios, puntos, apóstrofos o guiones.';
      return '';
    case 'correo':
      if (!v) return 'Escribe tu correo electrónico.';
      if (v.length > 160 || !EMAIL_RE.test(v)) return 'Ingresa un correo válido, por ejemplo nombre@empresa.com.';
      return '';
    case 'telefono': {
      if (!v) return '';
      const digitos = v.replace(/\D/g, '').length;
      if (!TELEFONO_RE.test(v) || digitos < 7 || digitos > 15) return 'Ingresa un teléfono válido (7 a 15 dígitos, puede iniciar con +).';
      return '';
    }
    case 'programaInteres':
      return v ? '' : 'Elige la misión que te interesa.';
  }
}

const enviados = (): string[] => {
  try {
    return JSON.parse(store.get(CLAVE_ENVIADOS) ?? '[]');
  } catch {
    return [];
  }
};
const claveEnvio = (d: Datos) => `${d.correo.trim().toLowerCase()}|${d.programaInteres}`;

export function initLeadForm() {
  const form = $<HTMLFormElement>('[data-lead-form]');
  if (!form) return;
  const success = $('[data-lead-success]')!;
  const alerta = $('[data-lead-alert]', form)!;
  const boton = $<HTMLButtonElement>('[data-lead-submit]', form)!;
  const etiquetaBoton = $('[data-lead-submit-label]', form)!;
  const campos: Campo[] = ['nombre', 'correo', 'telefono', 'programaInteres'];
  let enviando = false;
  const tocados = new Set<Campo>();

  const datos = (): Datos => {
    const fd = new FormData(form);
    return {
      nombre: String(fd.get('nombre') ?? ''),
      correo: String(fd.get('correo') ?? ''),
      telefono: String(fd.get('telefono') ?? ''),
      programaInteres: String(fd.get('programaInteres') ?? ''),
    };
  };

  const marcarError = (campo: Campo, mensaje: string) => {
    const caja = $(`[data-field="${campo}"]`, form)!;
    const p = $(`[data-error-for="${campo}"]`, form)!;
    p.textContent = mensaje;
    caja.classList.toggle('is-invalid', Boolean(mensaje));
    $$<HTMLInputElement>('input', caja).forEach((i) => {
      if (mensaje) i.setAttribute('aria-invalid', 'true');
      else i.removeAttribute('aria-invalid');
    });
  };

  const mostrarAlerta = (texto: string, tipo: 'error' | 'info' = 'error') => {
    alerta.textContent = texto;
    alerta.dataset.tipo = tipo;
    alerta.hidden = !texto;
  };

  const validarTodo = (): Campo[] => {
    const d = datos();
    const invalidos: Campo[] = [];
    for (const c of campos) {
      const msg = validarCampo(c, d[c]);
      marcarError(c, msg);
      if (msg) invalidos.push(c);
    }
    return invalidos;
  };

  const enfocar = (campo: Campo, preventScroll = false) => {
    const input = form.querySelector<HTMLInputElement>(`[name="${campo}"]`);
    input?.focus({ preventScroll });
  };

  const setEnviando = (on: boolean) => {
    enviando = on;
    boton.disabled = on;
    form.setAttribute('aria-busy', String(on));
    form.classList.toggle('is-sending', on);
    etiquetaBoton.textContent = on ? 'Enviando registro…' : 'Enviar registro';
  };

  // Validación en vivo: al salir del campo y, después del primer error, mientras se escribe.
  form.addEventListener('focusout', (e) => {
    const t = e.target as HTMLInputElement;
    const c = t.name as Campo;
    if (!campos.includes(c) || c === 'programaInteres') return;
    tocados.add(c);
    marcarError(c, validarCampo(c, t.value));
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    const c = t.name as Campo;
    if (campos.includes(c) && (tocados.has(c) || c === 'programaInteres')) marcarError(c, validarCampo(c, t.value));
    if (!alerta.hidden && alerta.dataset.tipo === 'error') mostrarAlerta('');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return; // evita dobles clics o Enter repetido
    mostrarAlerta('');

    const invalidos = validarTodo();
    if (invalidos.length) {
      mostrarAlerta('Revisa los campos marcados para continuar.');
      enfocar(invalidos[0]);
      return;
    }

    const d = datos();
    // Campo trampa lleno → probablemente un bot: se simula el éxito sin enviar nada.
    if (String(new FormData(form).get('sitioWeb') ?? '').trim()) {
      mostrarExito(d, false);
      return;
    }
    if (enviados().includes(claveEnvio(d))) {
      marcarError('correo', `Este correo ya está registrado para ${nombrePrograma(d.programaInteres)}.`);
      mostrarAlerta('Ya recibimos este registro. Si quieres otra misión, elígela y vuelve a enviar.', 'info');
      enfocar('correo');
      return;
    }

    setEnviando(true);
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          nombre: d.nombre.trim(),
          correo: d.correo.trim(),
          telefono: d.telefono.trim() || null,
          programaInteres: d.programaInteres,
        }),
        signal: ctrl.signal,
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 201) {
        store.set(CLAVE_ENVIADOS, JSON.stringify([...enviados(), claveEnvio(d)].slice(-20)));
        mostrarExito(d, true, body);
        return;
      }
      const errores: Record<string, string> = body?.fieldErrors ?? {};
      Object.entries(errores).forEach(([c, msg]) => campos.includes(c as Campo) && marcarError(c as Campo, msg));
      if (res.status === 409) {
        store.set(CLAVE_ENVIADOS, JSON.stringify([...enviados(), claveEnvio(d)].slice(-20)));
        mostrarAlerta('Ya teníamos tu registro para esta misión. Pronto te contactaremos.', 'info');
        enfocar('correo');
      } else if (res.status === 400) {
        mostrarAlerta(body?.message ?? 'Revisa los datos del formulario.');
        const primero = campos.find((c) => errores[c]);
        if (primero) enfocar(primero);
      } else {
        mostrarAlerta('No pudimos guardar tu registro en este momento. Inténtalo de nuevo en unos minutos.');
      }
    } catch {
      mostrarAlerta(
        ctrl.signal.aborted
          ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
          : 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      clearTimeout(timer);
      setEnviando(false);
    }
  });

  const mostrarExito = (d: Datos, real: boolean, body?: { fechaRegistro?: string }) => {
    const primerNombre = d.nombre.trim().split(/\s+/)[0];
    $('[data-lead-success-title]', success)!.textContent = `¡Listo, ${primerNombre}! Registro confirmado`;
    $('[data-lead-success-text]', success)!.textContent =
      `Guardamos tu interés en la misión ${nombrePrograma(d.programaInteres)}. Un especialista de AI Academy te escribirá a ${d.correo.trim().toLowerCase()}.`;
    const fecha = real && body?.fechaRegistro ? new Date(body.fechaRegistro) : new Date();
    $('[data-lead-success-meta]', success)!.textContent =
      `Registrado el ${fecha.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}`;
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  $('[data-lead-again]', success)?.addEventListener('click', () => {
    form.reset();
    tocados.clear();
    campos.forEach((c) => marcarError(c, ''));
    mostrarAlerta('');
    success.hidden = true;
    form.hidden = false;
    enfocar('nombre');
  });

  // Todos los botones de inscripción de la página llevan al formulario.
  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('[data-inscribir]');
    if (!link) return;
    const programa = link.dataset.programa;
    if (programa) {
      const radio = form.querySelector<HTMLInputElement>(`input[name="programaInteres"][value="${programa}"]`);
      if (radio) {
        radio.checked = true;
        marcarError('programaInteres', '');
      }
    }
    if (!success.hidden) return;
    // Con mouse se enfoca el primer campo; en táctil no, para no abrir el teclado de golpe.
    if (window.matchMedia('(pointer: fine)').matches) {
      window.setTimeout(() => enfocar('nombre', true), 450);
    }
  });
}
