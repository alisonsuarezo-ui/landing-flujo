/** Utilidades para generar el HTML de las secciones. */

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para insertarlo en HTML. */
export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ESC[c]);

/** Une un arreglo de fragmentos HTML. */
export const join = <T>(items: readonly T[], fn: (item: T, i: number) => string): string => items.map(fn).join('');

/**
 * Pinta la palabra destacada del titular en Soft Violet.
 * Regla del manual: una sola palabra destacada por titular, sin subrayados.
 */
export function destacar(titular: string, palabra: string): string {
  const t = esc(titular);
  const p = esc(palabra);
  return t.replace(p, `<em class="hl">${p}</em>`);
}

/** Etiqueta en píldora: Soft Violet con texto Black en mayúsculas. */
export const pill = (texto: string, extra = ''): string => `<p class="pill ${extra}">${esc(texto)}</p>`;

/** Etiqueta de etapa de la misión (encabeza cada sección). */
export function etapa(n: number, nombre: string): string {
  return `<p class="stage-tag"><span class="stage-tag__n">${String(n).padStart(2, '0')}</span><span>${esc(nombre)}</span></p>`;
}

/** Atributos de enlace externo. */
export const ext = 'target="_blank" rel="noopener"';
