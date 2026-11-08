import type { TipoEventoAnalitica } from '../constants/domain.js';

export interface EventoAnaliticaDTO {
  id: string;
  negocioId: string;
  publicacionId: string | null;
  ubicacionId: string | null;
  reelId: string | null;
  tipoEvento: TipoEventoAnalitica;
  origen: string | null;
  creadoEn: string;
}

export interface MetricasNegocioResumenDTO {
  totalVistasNegocio: number;
  totalVistasPublicaciones: number;
  totalClicsWhatsapp: number;
  totalClicsTelefono: number;
  totalClicsRedSocial: number;
  totalEscaneosQr: number;
  totalVistasReel: number;
  totalConversiones: number; // sum of clics_whatsapp + clics_telefono + escaneo_qr
  totalInteracciones: number; // total overall events
}

export interface MetricasPorSucursalDTO {
  ubicacionId: string | null;
  nombreSucursal: string;
  totalVistas: number;
  totalClicsWhatsapp: number;
  totalEscaneosQr: number;
  totalEventos: number;
}

export interface MetricasPorOrigenDTO {
  origen: string;
  total: number;
}

export interface MetricasPuntoTemporalDTO {
  fecha: string; // YYYY-MM-DD
  vistas: number;
  clicsWhatsapp: number;
  escaneosQr: number;
  otros: number;
}

export interface MetricasTopPublicacionDTO {
  publicacionId: string;
  titulo: string;
  vistas: number;
  clicsWhatsapp: number;
}

export interface MetricasNegocioResponseDTO {
  negocioId: string;
  nombreComercial: string;
  periodo: string;
  rango: {
    desde: string;
    hasta: string;
  };
  resumen: MetricasNegocioResumenDTO;
  porSucursal: MetricasPorSucursalDTO[];
  porOrigen: MetricasPorOrigenDTO[];
  serieTemporal: MetricasPuntoTemporalDTO[];
  topPublicaciones: MetricasTopPublicacionDTO[];
}
