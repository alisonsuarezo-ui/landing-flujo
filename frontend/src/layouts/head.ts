/** Metadatos compartidos entre el layout de Astro y el build estático de prueba. */

export const META = {
  lang: 'es-CO',
  title: 'Campuslands AI Academy · Formación en IA aplicada para empresas y equipos',
  description:
    'Aprende IA con las tareas que ya haces. Cinco misiones (Ignition, Booster, Liftoff, Odyssey y Nebula) para empresas, líderes de equipo y profesionales.',
  themeColor: '#050507',
};

/** Poppins es la única familia permitida por el manual (400 a 800). */
export const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap';

export function headHtml(): string {
  return `
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${META.title}</title>
<meta name="description" content="${META.description}" />
<meta name="theme-color" content="${META.themeColor}" />
<meta name="color-scheme" content="dark" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${META.title}" />
<meta property="og:description" content="${META.description}" />
<meta property="og:locale" content="es_CO" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="${FONTS_HREF}" />
<link rel="stylesheet" href="${FONTS_HREF}" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="${FONTS_HREF}" /></noscript>
<link rel="preload" as="image" href="/max/presentando.webp" type="image/webp" />
<script>document.documentElement.classList.add('js')</script>`;
}
