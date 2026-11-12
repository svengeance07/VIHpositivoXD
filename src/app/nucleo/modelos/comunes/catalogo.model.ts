/**
 * Catálogos transversales del sistema (`CatalogosService`).
 */

/** Opción simple de un catálogo (`id`, `nombre`). */
export interface ItemCatalogo {
  readonly id: string;
  readonly nombre: string;
}

/** Vacuna del esquema general de inmunización. */
export interface VacunaCatalogo extends ItemCatalogo {
  readonly dosisRequeridas: number;
  /** Meses de vigencia; `null` significa vigencia de por vida. */
  readonly vigenciaMeses: number | null;
  /** Forma parte de los requisitos del certificado de salud. */
  readonly obligatoriaCertificado: boolean;
}

/** Rol del sistema. Se persiste como número (`0`–`3`). */
export interface RolSistema {
  readonly id: 0 | 1 | 2 | 3;
  readonly nombre: string;
  /** Prefijo de ruta; vacío en el rol `0`, que no inicia sesión. */
  readonly prefijo: string;
}

