# Campuslands AI Academy · Nueva landing

Landing de una sola página para **Campuslands AI Academy**, construida para el reto de ingreso al equipo (noviembre de 2026). Aplica el Manual de marca v1.0 y convierte el recorrido por la página en una misión espacial: cada sección es una etapa del viaje, desde la cuenta regresiva hasta la llegada.

## Reto 4 · Formulario de interesados y panel administrativo

Esta landing ahora incluye:

- La sección **Inscripción** (`src/sections/inscripcion.ts` + `src/scripts/lead-form.ts`), que envía los registros a la API Spring Boot (`POST /api/leads`).
- El **panel administrativo** en `/admin/` (`src/pages/admin/index.astro` + `src/scripts/admin/`).

Todos los botones de inscripción llevan al formulario. La arquitectura completa, Docker, n8n y Telegram están en el [README principal](../README.md).

## Cómo correrlo

Requisitos: Node 18.20.8 o superior.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/ con Astro
npm run preview    # sirve dist/ para revisarlo
```

También hay un build sin Astro, que solo usa esbuild. Sirve de respaldo y para revisiones rápidas:

```bash
npm run build:static   # genera dist-static/
npx serve dist-static
```

## Despliegue

**Vercel** (recomendado)

1. Sube el repositorio a GitHub.
2. En vercel.com, elige *Add New → Project* e importa el repositorio.
3. Vercel detecta Astro solo: build `npm run build`, salida `dist`.

**Netlify**

- Build command: `npm run build`
- Publish directory: `dist`

**GitHub Pages**

Los recursos usan rutas absolutas (`/max/…`, `/brand/…`). Hay dos opciones:

- Usar un dominio propio, que es lo más simple.
- Publicar en `usuario.github.io/repo`: define `site` y `base` en `astro.config.mjs` y despliega con la acción oficial [`withastro/action`](https://docs.astro.build/en/guides/deploy/github/).

## Arquitectura

```
src/
├── data/content.ts        ← TODO el contenido: textos, misiones, herramientas, enlaces
├── sections/*.ts          ← marcado HTML de cada sección (funciones puras)
├── scripts/               ← interacciones (TypeScript sin dependencias)
│   ├── main.ts            ← punto de entrada
│   ├── hero.ts            ← pieza 1: hero que reacciona al visitante
│   ├── journey.ts         ← pieza 2: progreso de la misión y revelado con scroll
│   ├── recommender.ts     ← pieza 3: recomendador (UI)
│   ├── recommend.ts       ← pieza 3: lógica de puntajes (pura, sin DOM)
│   ├── tools.ts           ← pieza 4: constelación + mini simulador
│   ├── calc.ts            ← calculadora «el costo de esperar»
│   ├── cases.ts           ← pestañas + comparador antes/después
│   └── nav.ts             ← menú móvil
├── styles/global.css      ← tokens de marca y estilos (mobile-first)
├── layouts/               ← <head> compartido y layout de Astro
└── pages/index.astro
public/
├── brand/                 ← logos oficiales extraídos del manual, sin modificar
└── max/                   ← poses y expresiones aprobadas de Max
tools/build-static.mjs     ← build alternativo con esbuild
```

Las secciones son funciones que devuelven HTML a partir de `content.ts`. El mismo marcado sirve para Astro y para el build estático, así que el contenido se edita en un solo lugar.

## El recorrido: siete etapas

| Etapa | Sección | Qué hace |
|---|---|---|
| 01 · Cuenta regresiva | Hero | «Evoluciona a la velocidad de la tecnología», elección de perfil y botón **Ver planes** |
| 02 · Prevuelo | Beneficios | Formación práctica, entregables listos, soporte continuo y rutas flexibles |
| 03 · Despegue | Herramientas | Constelación de las 14 herramientas |
| 04 · Ventana de lanzamiento | ¿Por qué ahora? | Calculadora del costo de esperar |
| 05 · Órbita | Planes | Recomendador y comparador de las 5 misiones |
| 06 · Bitácora | Casos de uso + Reseñas | Antes y después de 4 perfiles |
| 07 · Llegada | FAQs + cierre | Preguntas, Diagnóstico, Certificado y CTA final |

«¿Por qué ahora?» va justo antes de los planes a propósito: el costo de esperar es el empujón para elegir misión.

## Las cuatro piezas interactivas

1. **Hero que reacciona al visitante.** La pregunta «¿Quién va a despegar?» (empresa, líder de equipo o independiente) cambia la bajada y el botón. Además deja respondida la primera pregunta del recomendador y abre el caso de uso de ese perfil. Los halos y Max siguen el cursor, o el dedo al arrastrar, y Max «despega» con el scroll mientras la telemetría marca la altitud.
2. **Recorrido narrativo con el scroll.** Una barra de progreso del viaje va bajo el menú. En escritorio hay un riel de etapas navegable con teclado; en móvil, un aviso de etapa aparece al cambiar de sección. Los bloques se revelan al entrar en pantalla.
3. **Recomendador de misiones.** Hace tres preguntas: quiénes se forman, cuánto tiempo hay y qué quieren lograr. Las respuestas suman puntos a cada misión y gana la de mayor puntaje. El resultado muestra la misión ideal, por qué se sugiere y una alternativa, y resalta la tarjeta en el comparador. Los botones llevan a la inscripción y a WhatsApp, con un mensaje que ya incluye las respuestas.
4. **Exploración libre: constelación de herramientas.** Las 14 herramientas están en dos órbitas. Al tocar una se abre su caso práctico. Las que brillan traen un mini simulador del prompt o del flujo en acción (ChatGPT, Claude, Gemini, NotebookLM, Make y Zapier). Se pueden filtrar por los cuatro territorios del manual: Aprender, Aplicar, Construir y Transformar.

Extras: calculadora de horas perdidas al mes (con tus propios supuestos, sin cifras inventadas), comparador antes/después deslizable y acordeón de FAQs.

## Marca

- **Paleta**: solo los colores del manual, como variables CSS. Contrastes según la tabla WCAG del manual: blanco sobre Evox Purple en los CTA, y nunca blanco sobre Soft Violet.
- **Tipografía**: solo Poppins (400 a 800) desde Google Fonts. Las métricas de respaldo están ajustadas para evitar saltos mientras carga.
- **Logo**: los archivos oficiales salen tal cual del PDF del manual, sin redibujar ni recolorear. El menú usa la horizontal blanca a 160–168 px (mínimo 160) y el pie, la principal a color a 160 px (mínimo 120). Ambos llevan zona de protección. El casco solo aparece en el favicon y en el centro de la constelación.
- **Recursos gráficos**: halos en esquinas opuestas (Electric Violet arriba a la derecha, Evox Purple abajo a la izquierda), etiquetas en píldora, una palabra destacada por titular, tarjetas al 10 % de violeta, pasos numerados en Evox Purple y un bloque CTA en Evox Purple.
- **Max**: solo poses y expresiones aprobadas, recortadas de la lámina oficial. Presentando va en el hero, Trabajando en herramientas, Aprobando en el resultado del recomendador y Explicando en las FAQs. Las expresiones del visor son «Cansado, pero listo» para el problema y «Motivado» para el cierre. Max va siempre sobre fondo negro.
- **Nombre**: «Campuslands AI Academy» en la primera mención, «AI Academy» después y «IA» cuando el texto habla de la tecnología.

## Accesibilidad y rendimiento

- Mobile-first, revisado a 375 px y sin desbordes horizontales.
- Navegación con teclado: enlace para saltar al contenido, `focus-visible` en todo, flechas en la constelación y en las pestañas, radios nativos en el recomendador y sliders nativos.
- `prefers-reduced-motion`: sin parallax, sin revelados ni animaciones, y las demos se muestran completas al instante.
- Sin librerías de animación: todo usa IntersectionObserver, requestAnimationFrame y CSS. El JS minificado pesa unos 24 KB, sin comprimir.
- Imágenes en WebP con `width`/`height` (sin CLS) y carga diferida fuera del hero. La fuente carga sin bloquear el render.

## Pendientes antes de publicar

El contenido que no venía en el reto ni en el manual está marcado como `POR CONFIRMAR` en `src/data/content.ts`:

- [ ] `WHATSAPP_NUMERO`: mientras esté vacío, los botones de WhatsApp llevan a la landing actual.
- [x] Inscripción: resuelta en el Reto 4 con el formulario propio (`#inscripcion`).
- [ ] URLs de Diagnóstico, Certificado y legales (hoy apuntan a la landing actual).
- [ ] 7 de las 14 herramientas (`confirmado: false`). Confirmadas: ChatGPT, Claude, Gemini, Make, Zapier, Copilot y NotebookLM.
- [ ] Lo que incluye cada misión. Nombres y duraciones ya están confirmados.
- [ ] Antes/después de los cuatro perfiles.
- [ ] Testimonios autorizados. Mientras `autorizado: false`, la tarjeta se muestra como «Espacio para testimonio autorizado», como pide el manual.
- [ ] Respuestas de las FAQs.

## Uso de IA

El proyecto se construyó con Claude como asistente: análisis del manual y del reto, propuesta de arquitectura, código y pruebas en navegador (Playwright a 375 px y 1440 px, teclado y movimiento reducido). Las decisiones de stack, contenido y piezas interactivas las tomó quien presenta el reto antes de escribir código.
