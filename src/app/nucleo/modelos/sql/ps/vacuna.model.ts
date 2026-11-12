/**
 * Modelo de catálogo de biológicos para el Centro de Salud (`vacunas` en `example.sql`).
 */
export interface VacunaCentroSql {
  readonly idVacuna: number;
  readonly nombreVacuna: string;
  readonly cantidadDosis: number;
  readonly lotesDisponibles: readonly string[];
}

/** DTO para incorporar una vacuna al catálogo */
export interface CrearVacunaSqlDto {
  readonly nombreVacuna: string;
  readonly cantidadDosis: number;
}

