/** Estados del embudo (coinciden con el enum EstadoLead del backend). */
export const ESTADOS = [
  { id: 'NUEVO', nombre: 'Nuevo' },
  { id: 'CONTACTADO', nombre: 'Contactado' },
  { id: 'INTERESADO', nombre: 'Interesado' },
  { id: 'INSCRITO', nombre: 'Inscrito' },
  { id: 'DESCARTADO', nombre: 'Descartado' },
] as const;

export type EstadoId = (typeof ESTADOS)[number]['id'];

export const nombreEstado = (id: string) => ESTADOS.find((e) => e.id === id)?.nombre ?? id;
