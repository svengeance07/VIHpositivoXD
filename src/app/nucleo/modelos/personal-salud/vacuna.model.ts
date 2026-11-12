/**
 * Modelos del catálogo de biológicos (`vacunas`) para el Centro de Salud (/PS).
 */

/**
 * Representa una vacuna del catálogo `vacunas` (`id_vacuna`, `nombre_vacuna`, `cantidad_dosis`).
 */
export interface OpcionVacunaCentro {
  readonly id: string;
  /** `vacunas.id_vacuna` (INT PRIMARY KEY) */
  readonly idVacuna: number;
  /** `vacunas.nombre_vacuna` (VARCHAR(100) NOT NULL) */
  readonly nombre: string;
  /** `vacunas.cantidad_dosis` (INT NOT NULL) */
  readonly dosisMaximas: number;
  /** Lotes activos en el centro (`inmunizacion.numero_lote VARCHAR(30)`) */
  readonly lotesDisponibles: readonly string[];
}

/** DTO de entrada para agregar un nuevo biológico a la tabla `vacunas`. */
export interface CrearVacunaDto {
  readonly nombre: string;
  readonly dosisMaximas: number;
  readonly loteInicial?: string;
}

