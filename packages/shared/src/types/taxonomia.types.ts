import type { RubroGrupo, Categoria, MetodoPagoCatalogo } from '../schemas/taxonomia.schema.js';

export interface CategoriaNodoDTO extends Categoria {
  subcategorias?: CategoriaNodoDTO[];
  _count?: {
    publicaciones?: number;
  };
}

export interface RubroGrupoArbolDTO extends RubroGrupo {
  categorias: CategoriaNodoDTO[];
  _count?: {
    negocios?: number;
  };
}

export type { RubroGrupo, Categoria, MetodoPagoCatalogo };

