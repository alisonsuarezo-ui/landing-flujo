/**
 * Contenido de la landing de Campuslands AI Academy.
 *
 * Todo el texto y los datos viven en este archivo para que el equipo
 * pueda actualizarlos sin tocar el diseño ni la lógica.
 *
 * Convención: lo que tiene `confirmado: false` o el comentario
 * `// POR CONFIRMAR` no vino del reto ni del manual de marca y debe
 * validarse con el equipo antes de publicar (ver README › Pendientes).
 */

/* ------------------------------------------------------------------ */
/* Enlaces                                                             */
/* ------------------------------------------------------------------ */

const SITIO_ACTUAL = 'https://campuslands.aiacademy.com.co/';

export const LINKS = {
  sitioActual: SITIO_ACTUAL,
  // Reto 4: la inscripción ahora es el formulario propio de la landing
  // (sección #inscripcion), conectado a la API de interesados.
  inscripcion: '#inscripcion',
  // POR CONFIRMAR: URLs exactas de las páginas actuales. Mientras tanto
  // apuntan a la landing actual, como permite el reto.
  diagnostico: SITIO_ACTUAL,
  certificado: SITIO_ACTUAL,
  terminos: SITIO_ACTUAL,
  privacidad: SITIO_ACTUAL,
  // CONFIRMADO en el manual de marca.
  instagram: 'https://www.instagram.com/ai.campuslands/',
  instagramHandle: '@ai.campuslands',
};

/**
 * POR CONFIRMAR: número de WhatsApp en formato internacional sin «+»
 * ni espacios (ej. 573001234567). Mientras esté vacío, los botones de
 * WhatsApp llevan a la landing actual.
 */
export const WHATSAPP_NUMERO = '';

export function whatsappUrl(mensaje = 'Hola, quiero información sobre las formaciones de AI Academy.'): string {
  if (!WHATSAPP_NUMERO) return LINKS.sitioActual;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

/* ------------------------------------------------------------------ */
/* Navegación y etapas de la misión                                    */
/* ------------------------------------------------------------------ */

export const NAV = [
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Herramientas', href: '#herramientas' },
  { label: '¿Por qué ahora?', href: '#por-que-ahora' },
  { label: 'Planes', href: '#planes' },
  { label: 'Casos de uso', href: '#casos' },
  { label: 'FAQs', href: '#faqs' },
];

export const NAV_EXTERNOS = [
  { label: 'Diagnóstico', href: LINKS.diagnostico },
  { label: 'Certificado', href: LINKS.certificado },
];

/** Cada etapa corresponde a una sección con `data-stage`. */
export const ETAPAS = [
  { id: 'inicio', nombre: 'Cuenta regresiva' },
  { id: 'beneficios', nombre: 'Prevuelo' },
  { id: 'herramientas', nombre: 'Despegue' },
  { id: 'por-que-ahora', nombre: 'Ventana de lanzamiento' },
  { id: 'planes', nombre: 'Órbita' },
  { id: 'casos', nombre: 'Bitácora' },
  { id: 'faqs', nombre: 'Llegada' },
] as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export type PerfilId = 'empresa' | 'lider' | 'independiente';

export const HERO = {
  etiqueta: 'Formación en IA aplicada',
  titular: 'Evoluciona a la velocidad de la tecnología', // CONFIRMADO (reto)
  palabraDestacada: 'velocidad',
  bajada:
    'En Campuslands AI Academy aprendes IA con las tareas que ya haces. Sales usando ChatGPT, Claude, Gemini o Make en tu trabajo real, no con apuntes.',
  pregunta: '¿Quién va a despegar?',
  cta: 'Ver planes',
};

export const PERFILES: Record<
  PerfilId,
  { boton: string; bajada: string; caso: CasoId; tamano: Tamano; cta: string }
> = {
  empresa: {
    boton: 'Tengo una empresa',
    bajada:
      'Lleva la IA a tus procesos: cotizaciones, reportes y atención al cliente con herramientas que tu equipo sigue usando después de la formación.',
    caso: 'empresario',
    tamano: 'empresa',
    cta: 'Ver planes para empresas',
  },
  lider: {
    boton: 'Lidero un equipo',
    bajada:
      'Tu equipo aprende con sus propias tareas y sale con flujos listos para usar el lunes: menos copiar y pegar, más tiempo para decidir.',
    caso: 'innovacion',
    tamano: 'equipo',
    cta: 'Ver planes para equipos',
  },
  independiente: {
    boton: 'Trabajo por mi cuenta',
    bajada:
      'Recupera horas de tu semana: propuestas, contenido y seguimiento a clientes con IA, a tu ritmo o en vivo con un trainer.',
    caso: 'independiente',
    tamano: 'solo',
    cta: 'Ver planes para ti',
  },
};

/* ------------------------------------------------------------------ */
/* Beneficios                                                          */
/* ------------------------------------------------------------------ */

export const BENEFICIOS = [
  {
    titulo: 'Formación práctica',
    texto: 'Cada ejercicio parte de una tarea que tu equipo ya hace. Se aprende haciendo desde la primera sesión.',
  },
  {
    titulo: 'Entregables listos',
    texto: 'Sales con prompts, asistentes y automatizaciones funcionando, no con una carpeta de diapositivas.',
  },
  {
    titulo: 'Soporte continuo',
    texto: 'Después de la formación sigues contando con nosotros para resolver dudas mientras aplicas lo aprendido.', // POR CONFIRMAR: alcance y duración del soporte
  },
  {
    titulo: 'Rutas flexibles',
    texto: 'Desde 4 horas hasta una ruta a la medida de tu empresa, en vivo o pregrabada.',
  },
];

/* ------------------------------------------------------------------ */
/* Herramientas                                                        */
/* ------------------------------------------------------------------ */

export type Territorio = 'aprender' | 'aplicar' | 'construir' | 'transformar';

/** Los cuatro territorios vienen del manual de marca (01 · Brief). */
export const TERRITORIOS: Record<Territorio, { nombre: string; texto: string }> = {
  aprender: { nombre: 'Aprender', texto: 'Conceptos y habilidades base, sin jerga.' },
  aplicar: { nombre: 'Aplicar', texto: 'Resolver tareas concretas de trabajo con IA.' },
  construir: { nombre: 'Construir', texto: 'Automatizaciones, agentes y proyectos.' },
  transformar: { nombre: 'Transformar', texto: 'Decisiones, procesos y resultados de la empresa.' },
};

export type PasoDemo = { quien: string; texto: string };

export type Herramienta = {
  id: string;
  nombre: string;
  territorio: Territorio;
  /** Órbita interior (true) o exterior (false) en la constelación. */
  interior: boolean;
  caso: string;
  confirmado: boolean;
  demo?: { tipo: 'prompt' | 'flujo'; titulo: string; pasos: PasoDemo[] };
};

export const HERRAMIENTAS: Herramienta[] = [
  {
    id: 'chatgpt',
    nombre: 'ChatGPT',
    territorio: 'aplicar',
    interior: true,
    confirmado: true,
    caso: 'Redacta respuestas a clientes, propuestas y correos con el tono de tu empresa, a partir de tus propios ejemplos.',
    demo: {
      tipo: 'prompt',
      titulo: 'Respuestas a clientes en 20 segundos',
      pasos: [
        { quien: 'Tú', texto: 'Escribe 3 respuestas cortas para clientes que preguntan si hacemos envíos a Girón y Piedecuesta. Tono cercano, sin emojis.' },
        { quien: 'ChatGPT', texto: '1. ¡Sí! Enviamos a Girón y Piedecuesta de lunes a sábado. ¿Te comparto el costo según tu barrio?' },
        { quien: 'ChatGPT', texto: '2. Claro que sí: llegamos a Girón y Piedecuesta. Si pides antes de las 11 a. m., sale el mismo día.' },
        { quien: 'Tú', texto: 'Guárdalo como plantilla en tu asistente y úsalo todos los días.' },
      ],
    },
  },
  {
    id: 'claude',
    nombre: 'Claude',
    territorio: 'aplicar',
    interior: true,
    confirmado: true,
    caso: 'Lee documentos largos (contratos, informes, actas) y te devuelve lo importante en una tabla que puedes revisar.',
    demo: {
      tipo: 'prompt',
      titulo: 'Un contrato de 18 páginas, resumido',
      pasos: [
        { quien: 'Tú', texto: 'Adjunto el contrato de arrendamiento de la bodega. Haz una tabla con obligaciones, fechas clave y multas.' },
        { quien: 'Claude', texto: 'Listo. Encontré 9 obligaciones y 4 fechas clave. Ojo: la renovación es automática si no avisas 60 días antes (cláusula 7).' },
        { quien: 'Tú', texto: 'Revisas la tabla, verificas la cláusula y decides. La IA resume; tú decides.' },
      ],
    },
  },
  {
    id: 'gemini',
    nombre: 'Gemini',
    territorio: 'transformar',
    interior: true,
    confirmado: true,
    caso: 'Dentro de Gmail, Docs y Sheets: resume hilos largos, propone respuestas y analiza hojas de cálculo sin salir de Google Workspace.',
    demo: {
      tipo: 'prompt',
      titulo: 'Un hilo de 23 correos en un párrafo',
      pasos: [
        { quien: 'Tú', texto: 'Resume este hilo con el proveedor: qué se acordó, qué falta y quién debe responder.' },
        { quien: 'Gemini', texto: 'Acordado: entrega el 5 de diciembre. Falta: confirmar el precio del flete. Debe responder: compras (Laura).' },
      ],
    },
  },
  {
    id: 'copilot',
    nombre: 'Copilot',
    territorio: 'transformar',
    interior: true,
    confirmado: true,
    caso: 'En Word, Excel, Outlook y Teams: actas de reunión automáticas, borradores de informes y análisis de datos con Microsoft 365.',
  },
  {
    id: 'notebooklm',
    nombre: 'NotebookLM',
    territorio: 'aprender',
    interior: true,
    confirmado: true,
    caso: 'Sube tus manuales y políticas internas y pregúntales: responde citando la página exacta de tus propios documentos.',
    demo: {
      tipo: 'prompt',
      titulo: 'Tu reglamento interno, con respuestas citadas',
      pasos: [
        { quien: 'Tú', texto: '¿Cuántos días de anticipación se necesitan para pedir vacaciones?' },
        { quien: 'NotebookLM', texto: 'Se solicitan con 15 días hábiles de anticipación a través del jefe inmediato. [Reglamento interno, pág. 12]' },
      ],
    },
  },
  {
    id: 'make',
    nombre: 'Make',
    territorio: 'construir',
    interior: false,
    confirmado: true,
    caso: 'Conecta tus apps sin escribir código: el formulario llega a la hoja de cálculo, se redacta la respuesta y se avisa al vendedor.',
    demo: {
      tipo: 'flujo',
      titulo: 'De formulario a cotización, sin copiar a mano',
      pasos: [
        { quien: 'Disparador', texto: 'Llega una solicitud de cotización desde el formulario web.' },
        { quien: 'Make', texto: 'Guarda los datos del cliente en Google Sheets.' },
        { quien: 'ChatGPT', texto: 'Redacta la cotización con tu lista de precios.' },
        { quien: 'Resultado', texto: 'El borrador llega al correo del vendedor para revisar y enviar.' },
      ],
    },
  },
  {
    id: 'zapier',
    nombre: 'Zapier',
    territorio: 'construir',
    interior: false,
    confirmado: true,
    caso: 'Automatiza el paso a paso que se repite: un cliente nuevo crea su carpeta, su registro y su correo de bienvenida.',
    demo: {
      tipo: 'flujo',
      titulo: 'Bienvenida a clientes en automático',
      pasos: [
        { quien: 'Disparador', texto: 'Se cierra un negocio en el CRM.' },
        { quien: 'Zapier', texto: 'Crea la carpeta del cliente en Google Drive.' },
        { quien: 'Zapier', texto: 'Envía el correo de bienvenida con los siguientes pasos.' },
        { quien: 'Resultado', texto: 'Nadie tuvo que acordarse. El flujo trabaja por ti.' },
      ],
    },
  },
  // POR CONFIRMAR: las 7 herramientas siguientes completan las 14 de la
  // landing actual. Reemplázalas por las que se enseñan realmente.
  {
    id: 'n8n',
    nombre: 'n8n',
    territorio: 'construir',
    interior: false,
    confirmado: false,
    caso: 'Flujos y agentes más avanzados que puedes alojar en tu propia infraestructura cuando los datos no deben salir de la empresa.',
  },
  {
    id: 'perplexity',
    nombre: 'Perplexity',
    territorio: 'aprender',
    interior: false,
    confirmado: false,
    caso: 'Investiga un mercado, un proveedor o una norma con respuestas que citan sus fuentes para que las verifiques.',
  },
  {
    id: 'gamma',
    nombre: 'Gamma',
    territorio: 'aplicar',
    interior: false,
    confirmado: false,
    caso: 'Convierte un documento o unas notas en una presentación ordenada que luego ajustas a tu marca.',
  },
  {
    id: 'canva',
    nombre: 'Canva',
    territorio: 'aplicar',
    interior: false,
    confirmado: false,
    caso: 'Piezas para redes y presentaciones con las funciones de IA de Canva, respetando tu manual de marca.',
  },
  {
    id: 'notion',
    nombre: 'Notion',
    territorio: 'transformar',
    interior: false,
    confirmado: false,
    caso: 'Centraliza procesos y documentación del equipo, y pregúntale a tu base de conocimiento con Notion AI.',
  },
  {
    id: 'lovable',
    nombre: 'Lovable',
    territorio: 'construir',
    interior: false,
    confirmado: false,
    caso: 'Prototipa una herramienta interna (un cotizador, un formulario) describiéndola en español.',
  },
  {
    id: 'aistudio',
    nombre: 'AI Studio',
    territorio: 'construir',
    interior: false,
    confirmado: false,
    caso: 'Prueba modelos de Google, ajusta instrucciones y prepara asistentes antes de llevarlos a tu equipo.',
  },
];

/* ------------------------------------------------------------------ */
/* ¿Por qué ahora?                                                     */
/* ------------------------------------------------------------------ */

export const POR_QUE_AHORA = {
  titular: 'Esperar también cuesta',
  palabraDestacada: 'cuesta',
  bajada:
    'Mientras decides, las tareas repetitivas se siguen haciendo a mano. Calcula cuántas horas se van cada mes con tus propios números.',
  puntos: [
    'Sin un método, cada persona usa la IA a su manera (o no la usa), y lo que funciona no se comparte.',
    'Las tareas que se repiten no esperan: cotizar, reportar y responder lo mismo sigue costando horas.',
    'Empezar con 4 horas cuesta menos que seguir aplazando la decisión.',
  ],
};

/* ------------------------------------------------------------------ */
/* Planes / misiones                                                   */
/* ------------------------------------------------------------------ */

export type MisionId = 'ignition' | 'booster' | 'liftoff' | 'odyssey' | 'nebula';

export type Mision = {
  id: MisionId;
  nombre: string;
  duracion: string; // CONFIRMADO (reto)
  modalidad: string;
  lema: string;
  paraQuien: string;
  incluye: string[]; // POR CONFIRMAR: copiar lo que incluye cada misión en la landing actual
};

export const MISIONES: Mision[] = [
  {
    id: 'ignition',
    nombre: 'Ignition',
    duracion: '4 h',
    modalidad: 'En vivo',
    lema: 'El primer encendido',
    paraQuien: 'Para quien empieza y quiere resultados desde el primer día.',
    incluye: [
      'Cómo escribir buenos prompts para tu rol',
      'ChatGPT, Claude y Gemini en tareas reales',
      'Guía de prompts para seguir practicando',
    ],
  },
  {
    id: 'booster',
    nombre: 'Booster',
    duracion: '8 h',
    modalidad: 'En vivo',
    lema: 'Acelera tu trabajo diario',
    paraQuien: 'Para equipos que ya probaron la IA y quieren usarla en serio.',
    incluye: [
      'Todo lo de Ignition',
      'Tu primer asistente personalizado',
      'NotebookLM y Copilot sobre tus documentos',
      'Plantillas listas para tu área',
    ],
  },
  {
    id: 'liftoff',
    nombre: 'Liftoff',
    duracion: '12 h',
    modalidad: 'En vivo',
    lema: 'Del uso a la automatización',
    paraQuien: 'Para equipos que quieren dejar flujos funcionando.',
    incluye: [
      'Todo lo de Booster',
      'Automatizaciones con Make y Zapier',
      'Un flujo de tu área construido en clase',
      'Acompañamiento para ponerlo en marcha',
    ],
  },
  {
    id: 'odyssey',
    nombre: 'Odyssey',
    duracion: 'Personalizado',
    modalidad: 'A la medida',
    lema: 'Una ruta para toda la empresa',
    paraQuien: 'Para empresas que quieren llevar la IA a varias áreas.',
    incluye: [
      'Diagnóstico de procesos y prioridades',
      'Ruta por áreas y niveles',
      'Proyectos con tus datos y herramientas',
    ],
  },
  {
    id: 'nebula',
    nombre: 'Nebula',
    duracion: 'Pregrabado',
    modalidad: 'A tu ritmo',
    lema: 'Aprende cuando puedas',
    paraQuien: 'Para quien necesita flexibilidad total de horario.',
    incluye: [
      'Módulos en video paso a paso',
      'Ejercicios con herramientas reales',
      'Avanza a tu ritmo, desde cualquier lugar',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Recomendador                                                        */
/* ------------------------------------------------------------------ */

export type Tamano = 'solo' | 'equipo' | 'empresa';
export type Tiempo = '4' | '8' | '12' | 'ritmo';
export type Objetivo = 'empezar' | 'productividad' | 'automatizar' | 'transformar';

export const PREGUNTAS = {
  tamano: {
    pregunta: '¿Quiénes van a formarse?',
    opciones: [
      { valor: 'solo', texto: 'Solo yo' },
      { valor: 'equipo', texto: 'Un equipo (2 a 15 personas)' },
      { valor: 'empresa', texto: 'Varias áreas de la empresa' },
    ],
  },
  tiempo: {
    pregunta: '¿Cuánto tiempo pueden dedicarle?',
    opciones: [
      { valor: '4', texto: 'Media jornada' },
      { valor: '8', texto: 'Una jornada completa' },
      { valor: '12', texto: 'Varias sesiones' },
      { valor: 'ritmo', texto: 'A mi ritmo, sin horario fijo' },
    ],
  },
  objetivo: {
    pregunta: '¿Qué quieren lograr?',
    opciones: [
      { valor: 'empezar', texto: 'Empezar desde cero' },
      { valor: 'productividad', texto: 'Hacer más rápido el trabajo diario' },
      { valor: 'automatizar', texto: 'Automatizar tareas y procesos' },
      { valor: 'transformar', texto: 'Llevar la IA a toda la empresa' },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* Casos de uso                                                        */
/* ------------------------------------------------------------------ */

export type CasoId = 'empresario' | 'innovacion' | 'independiente' | 'rrhh';

// POR CONFIRMAR: ajustar con el antes/después de la landing actual.
export const CASOS: { id: CasoId; perfil: string; antes: string[]; despues: string[]; herramientas: string[] }[] = [
  {
    id: 'empresario',
    perfil: 'Empresario',
    antes: [
      'Respondes cotizaciones por WhatsApp una por una, de noche.',
      'Los reportes de ventas se arman a mano cada viernes.',
      'Las ideas para usar IA se quedan en «algún día».',
    ],
    despues: [
      'Un asistente arma la cotización con tus precios y tú solo la revisas.',
      'El reporte se genera solo desde la hoja de ventas.',
      'Tienes un primer flujo funcionando y sabes cuál sigue.',
    ],
    herramientas: ['ChatGPT', 'Make', 'Gemini'],
  },
  {
    id: 'innovacion',
    perfil: 'Director de innovación',
    antes: [
      'Cada área prueba herramientas por su cuenta y nada se comparte.',
      'Los pilotos de IA no pasan de la demo.',
      'Cuesta mostrar resultados a la gerencia.',
    ],
    despues: [
      'Un método común y un catálogo de prompts por área.',
      'Pilotos con procesos reales y responsables definidos.',
      'Indicadores de tiempo ahorrado para presentar en comité.',
    ],
    herramientas: ['Claude', 'NotebookLM', 'Zapier'],
  },
  {
    id: 'independiente',
    perfil: 'Profesional independiente',
    antes: [
      'Las propuestas comerciales se escriben desde cero cada vez.',
      'El contenido para redes se queda para el fin de semana.',
      'El seguimiento a clientes depende de tu memoria.',
    ],
    despues: [
      'Propuestas con tu estructura, listas para ajustar en minutos.',
      'Un calendario de contenido preparado con IA y tu voz.',
      'Recordatorios y correos de seguimiento automáticos.',
    ],
    herramientas: ['ChatGPT', 'Canva', 'Zapier'],
  },
  {
    id: 'rrhh',
    perfil: 'Líder de RR. HH.',
    antes: [
      'Revisar hojas de vida toma días enteros.',
      'Las mismas preguntas sobre el reglamento llegan cada semana.',
      'La inducción depende de quién esté disponible.',
    ],
    despues: [
      'Criterios claros para filtrar perfiles, con la decisión final en manos humanas.',
      'Un asistente responde con el reglamento y cita la página.',
      'Una inducción ordenada que cualquier persona puede seguir.',
    ],
    herramientas: ['NotebookLM', 'Copilot', 'Claude'],
  },
];

/* ------------------------------------------------------------------ */
/* Reseñas                                                             */
/* ------------------------------------------------------------------ */

/**
 * POR CONFIRMAR: el manual exige testimonios autorizados y marcar los
 * ejemplos simulados. Mientras `autorizado` sea false, la tarjeta se
 * muestra con la etiqueta «Espacio para testimonio».
 */
export const RESENAS: { iniciales: string; nombre: string; cargo: string; texto: string; autorizado: boolean }[] = [
  {
    iniciales: '—',
    nombre: 'Nombre por confirmar',
    cargo: 'Cargo · Empresa',
    texto: 'Aquí va el testimonio autorizado de un equipo formado: qué tarea cambió y qué resultado obtuvo.',
    autorizado: false,
  },
  {
    iniciales: '—',
    nombre: 'Nombre por confirmar',
    cargo: 'Cargo · Empresa',
    texto: 'Aquí va el segundo testimonio: idealmente de una empresa de Santander, con la herramienta que más usa hoy.',
    autorizado: false,
  },
  {
    iniciales: '—',
    nombre: 'Nombre por confirmar',
    cargo: 'Cargo · Empresa',
    texto: 'Aquí va el tercer testimonio: un profesional independiente o un líder de equipo, con su resultado concreto.',
    autorizado: false,
  },
];

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

// POR CONFIRMAR: validar modalidades, fechas y requisitos con el equipo.
export const FAQS: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: '¿En qué modalidades se dictan las misiones?',
    respuesta:
      'Ignition, Booster y Liftoff son en vivo con un trainer. Odyssey se diseña con tu empresa y Nebula es pregrabada para que avances a tu ritmo.',
  },
  {
    pregunta: '¿Cuándo son las próximas fechas?',
    respuesta:
      'Las fechas se programan por grupos y, para empresas, según su disponibilidad. Escríbenos por WhatsApp y te contamos la próxima fecha.',
  },
  {
    pregunta: '¿Necesito saber programar?',
    respuesta:
      'No. Trabajamos con herramientas que no requieren código, como ChatGPT, Claude, Make o Zapier. Si tu equipo es técnico, Odyssey puede ir más profundo.',
  },
  {
    pregunta: '¿Qué necesito para empezar?',
    respuesta:
      'Un computador con internet y una tarea de tu trabajo que quieras mejorar. Antes de la formación te indicamos qué cuentas crear.',
  },
  {
    pregunta: '¿Recibo certificado?',
    respuesta: 'Sí. Al terminar recibes un certificado que puedes consultar en la sección Certificado.',
  },
  {
    pregunta: '¿Cómo sé qué misión me conviene?',
    respuesta:
      'Usa el recomendador de esta página o haz el Diagnóstico. Si prefieres hablar con una persona, escríbenos por WhatsApp.',
  },
];

/* ------------------------------------------------------------------ */
/* Inscripción (Reto 4): formulario de interesados                     */
/* ------------------------------------------------------------------ */

/**
 * URL base de la API. Vacía = mismo origen (Nginx en Docker o el proxy de
 * `astro dev` redirigen /api al backend). Para un backend en otro dominio,
 * define PUBLIC_API_URL al compilar (ej. https://api.midominio.com).
 */
export const API_BASE: string = (import.meta.env?.PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** El backend recibe el programa en mayúsculas: IGNITION, BOOSTER, LIFTOFF, ODYSSEY o NEBULA. */
export const programaApi = (id: MisionId): string => id.toUpperCase();

export const INSCRIPCION = {
  etiqueta: 'Inscripción',
  titular: 'Reserva tu lugar en la misión',
  palabraDestacada: 'misión',
  bajada:
    'Déjanos tus datos y un especialista de AI Academy te contacta para confirmar fechas, modalidad y la misión que mejor encaja contigo o con tu equipo.',
  pasos: [
    { titulo: 'Envías tus datos', texto: 'Solo nombre, correo y la misión que te interesa. El teléfono es opcional.' },
    { titulo: 'Te contactamos', texto: 'Un especialista revisa tu registro y te escribe para resolver tus dudas.' },
    { titulo: 'Despegas', texto: 'Eliges fecha y modalidad, y empiezas a trabajar con IA en tus tareas reales.' },
  ],
  exito: {
    titulo: '¡Registro confirmado!',
    texto: 'Tu solicitud quedó guardada. Un especialista de AI Academy te contactará pronto.',
  },
};

/* ------------------------------------------------------------------ */
/* Pendientes (para el README y revisión del equipo)                   */
/* ------------------------------------------------------------------ */

export const PENDIENTES = [
  'Número de WhatsApp (WHATSAPP_NUMERO)',
  'URLs de Diagnóstico, Certificado y legales',
  '7 de las 14 herramientas (confirmado: false)',
  'Lo que incluye cada misión',
  'Antes/después de los casos de uso',
  'Testimonios autorizados',
  'Respuestas de las FAQs',
];
