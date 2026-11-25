import { $, $$ } from './shared';

/** Semanas promedio por mes. */
const SEMANAS_MES = 4.33;

/** Pinta el tramo recorrido del slider (Evox Purple). */
export function pintarRango(input: HTMLInputElement) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--fill', `${pct}%`);
}

/** ¿Por qué ahora? · calculadora del costo de esperar. */
export function initCalc() {
  const form = $<HTMLFormElement>('[data-calc]');
  if (!form) return;
  const inputs = $$<HTMLInputElement>('input[type="range"]', form);
  const out = (k: string) => $(`[data-out="${k}"]`, form);
  const fmt = (n: number) => Math.round(n).toLocaleString('es-CO');

  const update = () => {
    const personas = Number(form.personas.value);
    const horas = Number(form.horas.value);
    const pct = Number(form.pct.value);
    inputs.forEach(pintarRango);

    out('personas')!.textContent = String(personas);
    out('horas')!.textContent = `${horas} h`;
    out('pct')!.textContent = `${pct} %`;

    const mes = personas * horas * SEMANAS_MES * (pct / 100);
    const semestre = mes * 6;
    $('[data-calc-mes]', form)!.textContent = fmt(mes);
    $('[data-calc-semestre]', form)!.textContent = `${fmt(semestre)} h`;
    const jornadas = Math.round(semestre / 8);
    $('[data-calc-jornadas]', form)!.textContent = `${fmt(jornadas)} ${jornadas === 1 ? 'jornada' : 'jornadas'}`;
  };

  form.addEventListener('input', update);
  update();
}
