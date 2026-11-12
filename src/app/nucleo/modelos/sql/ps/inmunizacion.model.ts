/**
 * Modelo de dominio SQL para aplicaciones de biológicos en el Centro de Salud (/PS).
 * Mapea la tabla `inmunizacion` de `example.sql`.
 */
export interface InmunizacionSql {
  readonly id: string;
  readonly idInmunizacion: number;
  readonly pacienteId: string;
  readonly ciudadanoMayorId?: number;
  readonly ciudadanoMenorId?: number;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly esMenor: boolean;
  readonly vacunaId: number;
  readonly vacunaNombre: string;
  readonly dosis: number;
  readonly lote: string;
  readonly fechaAplicacion: string;
  readonly observaciones?: string;
  readonly centroId: number;
  readonly centroNombre?: string;
  readonly autoridadId: number;
  readonly autoridadNombre: string;
}

/** DTO para registrar una nueva dosis en la tabla `inmunizacion` */
export interface RegistrarInmunizacionSqlDto {
  readonly dosis: number;
  readonly fechaAplicacion: string;
  readonly numeroLote: string;
  readonly observaciones?: string;
  readonly centroSaludId: number;
  readonly vacunaId: number;
  readonly ciudadanoMayorEdadId?: number;
  readonly ciudadanoMenorId?: number;
  readonly autoridadAplicadoraId: number;
}

