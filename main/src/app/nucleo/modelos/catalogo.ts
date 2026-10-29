/**
 * Catálogos del sistema.
 *
 * Temporales: cuando exista la base de datos, estas listas pasan a ser tablas propias
 * (`vacuna`, `profesion`, `grado_instruccion`, `grupo_etnico`, `tipo_establecimiento`).
 * Las vistas solo deben consumirlas a través de `CatalogosService`, nunca importando
 * los arrays directamente.
 */

/** Opción simple de un catálogo. */
export interface ItemCatalogo {
  readonly id: string;
  readonly nombre: string;
}

/** Vacuna del esquema de inmunización. */
export interface VacunaCatalogo extends ItemCatalogo {
  readonly dosisRequeridas: number;
  /** Meses de vigencia; `null` significa vigencia de por vida. */
  readonly vigenciaMeses: number | null;
  /** Forma parte de los requisitos del certificado de salud. */
  readonly obligatoriaCertificado: boolean;
}

/** Rol del sistema. Se persiste como número (0–3). */
export interface RolSistema {
  readonly id: 0 | 1 | 2 | 3;
  readonly nombre: string;
  /** Prefijo de ruta; vacío en el rol 0, que no inicia sesión. */
  readonly prefijo: string;
}
