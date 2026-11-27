// DRAFT copy: pending review by the project team. Replace with the final texts.

export const QUIENES_SOMOS = {
  intro:
    'Mi Alberdi es la guía digital de Juan Bautista Alberdi, Tucumán. Reúne en un solo lugar a los comercios, oficios, profesionales y emprendimientos de nuestra ciudad.',
  mision:
    'Acercar a los vecinos con quienes ofrecen productos y servicios en el barrio, con contacto directo por WhatsApp y sin comisiones ni intermediarios.',
  vision:
    'Ser la referencia de consulta de la comunidad de Alberdi: una ciudad donde el comercio local se encuentra fácil, crece y se apoya entre vecinos.',
} as const;

export interface PreguntaFrecuente {
  id: string;
  pregunta: string;
  respuesta: string;
}

export const PREGUNTAS_FRECUENTES: readonly PreguntaFrecuente[] = [
  {
    id: 'que-es',
    pregunta: '¿Qué es Mi Alberdi?',
    respuesta:
      'Es una guía digital con los comercios, oficios, profesionales y emprendimientos de Juan Bautista Alberdi, Tucumán.',
  },
  {
    id: 'costo',
    pregunta: '¿Tiene costo contactar a un comercio u oficio?',
    respuesta:
      'No. Hablás directo con el comerciante o especialista, sin intermediarios y sin comisiones.',
  },
  {
    id: 'contacto',
    pregunta: '¿Cómo contacto a un comercio o profesional?',
    respuesta:
      'Cada publicación tiene un acceso directo a su WhatsApp. Lo tocás y coordinás con ellos.',
  },
  {
    id: 'publicar',
    pregunta: '¿Cómo publico mi negocio u oficio?',
    respuesta:
      'Las cuentas de comerciantes las da de alta el equipo de Mi Alberdi. Una vez que tengas tus credenciales, ingresás y cargás tu negocio.',
  },
  {
    id: 'emergencias',
    pregunta: '¿Para qué sirven los números de emergencia de la página principal?',
    respuesta:
      'Son accesos directos para llamar rápido a Policía (101), Bomberos (100) y Ambulancia/Salud (107) desde tu celular.',
  },
];
