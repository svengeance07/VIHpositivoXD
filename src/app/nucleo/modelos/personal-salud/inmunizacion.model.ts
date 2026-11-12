/**
 * Modelos de aplicación de dosis (`inmunizacion`) para el Centro de Salud (/PS).
 */

/**
 * Representa un registro de la tabla `inmunizacion` (`example.sql`) vinculado al paciente.
 */
export interface AplicacionVacuna {
  readonly id: string;
  /** `inmunizacion.id_inmunizacion` */
  readonly idInmunizacion: number;
  readonly pacienteId: string;
  /** `ciudadano_mayor_edad.id_ciudadano` (si `!esMenor`) */
  readonly ciudadanoMayorId?: number;
  /** `ciudadano_menor_edad.id_menor` (`ciudadano_mayor_menor_id`, si `esMenor`) */
  readonly ciudadanoMenorId?: number;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly esMenor: boolean;
  /** `inmunizacion.vacuna_id` (FK → `vacunas.id_vacuna`) */
  readonly vacunaId: string;
  /** `vacunas.nombre_vacuna` */
  readonly vacunaNombre: string;
  /** `inmunizacion.numero_dosis` (INT NOT NULL) */
  readonly dosis: number;
  /** `inmunizacion.numero_lote` (VARCHAR(30)) */
  readonly lote: string;
  /** `inmunizacion.fecha_aplicacion` (DATE) */
  readonly fechaAplicacion: string;
  /** `inmunizacion.observaciones` (VARCHAR(255)) */
  readonly observaciones?: string;
  /** `inmunizacion.centro_salud_aplicacion` (FK → `centro_salud.id_centro`) */
  readonly centroId: string;
  readonly centroNombre?: string;
  readonly enfermeroId: string;
  readonly enfermeroNombre: string;
}

/** DTO de entrada para asentar una nueva dosis en la tabla `inmunizacion`. */
export interface CrearInmunizacionDto {
  readonly pacienteId: string;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly esMenor: boolean;
  readonly vacunaId: string;
  readonly vacunaNombre: string;
  readonly dosis: number;
  readonly lote: string;
  readonly fechaAplicacion?: string;
  readonly enfermeroId: string;
  readonly enfermeroNombre: string;
  readonly centroNombre?: string;
  readonly observaciones?: string;
}

