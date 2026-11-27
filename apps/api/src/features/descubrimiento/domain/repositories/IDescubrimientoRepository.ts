import type {
  BuscarDescubrimientoInput,
  DestacadosPortadaDTO,
  ResultadoBusquedaDTO,
} from '@mi-alberdi/shared';

export interface IDescubrimientoRepository {
  buscar(input: BuscarDescubrimientoInput): Promise<ResultadoBusquedaDTO>;
  getDestacadosPortada(): Promise<DestacadosPortadaDTO>;
  getSemillaRotacion(): Promise<number>;
}

