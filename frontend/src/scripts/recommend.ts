/**
 * Lógica del recomendador de misiones (pura, sin DOM).
 * Cada respuesta suma puntos a las misiones que encajan; gana la de
 * mayor puntaje y la segunda se ofrece como alternativa.
 */
import { MISIONES, type MisionId, type Objetivo, type Tamano, type Tiempo, type Mision } from '../data/content';

export type Respuestas = { tamano: Tamano; tiempo: Tiempo; objetivo: Objetivo };

type Puntos = Partial<Record<MisionId, number>>;

const POR_TIEMPO: Record<Tiempo, Puntos> = {
  '4': { ignition: 3 },
  '8': { booster: 3 },
  '12': { liftoff: 3, odyssey: 1 },
  ritmo: { nebula: 4 },
};

const POR_OBJETIVO: Record<Objetivo, Puntos> = {
  empezar: { ignition: 2, nebula: 1 },
  productividad: { booster: 2, ignition: 1 },
  automatizar: { liftoff: 2, odyssey: 1 },
  transformar: { odyssey: 3, liftoff: 1 },
};

const POR_TAMANO: Record<Tamano, Puntos> = {
  solo: { nebula: 1, ignition: 1 },
  equipo: { booster: 1, liftoff: 1 },
  empresa: { odyssey: 2 },
};

const FRASES = {
  objetivo: {
    empezar: 'quieres empezar desde cero',
    productividad: 'buscas hacer más rápido el trabajo diario',
    automatizar: 'quieres dejar tareas automatizadas',
    transformar: 'quieres llevar la IA a toda la empresa',
  } satisfies Record<Objetivo, string>,
  tiempo: {
    '4': 'hay media jornada disponible',
    '8': 'hay una jornada completa',
    '12': 'hay tiempo para varias sesiones',
    ritmo: 'prefieres avanzar a tu ritmo',
  } satisfies Record<Tiempo, string>,
  tamano: {
    solo: 'la formación es para ti',
    equipo: 'se forma un equipo',
    empresa: 'participan varias áreas',
  } satisfies Record<Tamano, string>,
};

/** Orden de desempate: de la misión más corta a la más amplia. */
const ORDEN: MisionId[] = ['ignition', 'booster', 'liftoff', 'odyssey', 'nebula'];

export function puntajes(r: Respuestas): Record<MisionId, number> {
  const total = Object.fromEntries(ORDEN.map((id) => [id, 0])) as Record<MisionId, number>;
  for (const tabla of [POR_TIEMPO[r.tiempo], POR_OBJETIVO[r.objetivo], POR_TAMANO[r.tamano]]) {
    for (const [id, p] of Object.entries(tabla) as [MisionId, number][]) total[id] += p;
  }
  return total;
}

export function recomendar(r: Respuestas): { principal: Mision; alterna: Mision; razon: string } {
  const p = puntajes(r);
  const ranking = [...ORDEN].sort((a, b) => p[b] - p[a] || ORDEN.indexOf(a) - ORDEN.indexOf(b));
  const principal = MISIONES.find((m) => m.id === ranking[0])!;
  const alterna = MISIONES.find((m) => m.id === ranking[1])!;
  const razon = `Te la sugerimos porque ${FRASES.objetivo[r.objetivo]}, ${FRASES.tiempo[r.tiempo]} y ${FRASES.tamano[r.tamano]}.`;
  return { principal, alterna, razon };
}
