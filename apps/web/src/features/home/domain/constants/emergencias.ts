export const EMERGENCIAS = [
  { id: 'policia', nombre: 'Policía', numero: '101' },
  { id: 'bomberos', nombre: 'Bomberos', numero: '100' },
  { id: 'salud', nombre: 'Ambulancia / Salud', numero: '107' },
] as const;

export type EmergenciaId = (typeof EMERGENCIAS)[number]['id'];
