/** Íconos SVG en línea (trazo simple, heredan el color del texto). */

const svg = (path: string, size = 20) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;

export const icons = {
  arrow: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  arrowDown: svg('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
  chat: svg('<path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.5-5.4A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 22),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 22),
  check: svg('<path d="m5 12 5 5 9-10"/>', 18),
  play: svg('<path d="M7 5v14l12-7z"/>', 18),
  external: svg('<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>', 16),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 20),
  swap: svg('<path d="m8 7-4 5 4 5"/><path d="m16 7 4 5-4 5"/>', 20),
};
