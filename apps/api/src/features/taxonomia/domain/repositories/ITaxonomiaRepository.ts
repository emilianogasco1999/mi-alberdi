import type {
  RubroGrupo,
  MetodoPagoCatalogo,
  RubroGrupoArbolDTO,
  CategoriaNodoDTO,
  PlanCatalogo,
} from '@mi-alberdi/shared';

export interface ITaxonomiaRepository {
  getArbolTaxonomia(): Promise<RubroGrupoArbolDTO[]>;
  getRubros(): Promise<RubroGrupo[]>;
  getRubroBySlug(slug: string): Promise<RubroGrupo | null>;
  getCategoriasByRubro(rubroIdOrSlug: string): Promise<CategoriaNodoDTO[]>;
  getMetodosPago(): Promise<MetodoPagoCatalogo[]>;
  getPlanes(): Promise<PlanCatalogo[]>;
}
