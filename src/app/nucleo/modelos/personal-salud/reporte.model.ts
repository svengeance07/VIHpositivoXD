/**
 * Modelos de vigilancia farmacológica (`reportes` y `sintomas_comunes`) para el Centro de Salud (/PS).
 */

/** Nivel de gravedad normalizado en minúsculas para el frontend (`'leve' | 'moderado' | 'severo'`). */
export type NivelGravedadReporte = 'leve' | 'moderado' | 'severo';

/** Estado de seguimiento del reporte enviado a la Subregión estadal. */
export type EstadoReporteSubregion = 'enviado' | 'en_revision' | 'atendido';

/** Catálogo `sintomas_comunes` (`id_sintoma`, `descripcion_sintoma` en `example.sql`). */
export interface SintomaComun {
  readonly idSintoma: number;
  readonly descripcionSintoma: string;
}

/**
 * Representa un registro de la tabla `reportes` (`example.sql`) junto con `sintomas_comunes`.
 */
export interface ReporteIncidenciaVacuna {
  readonly id: string;
  /** `reportes.id_reportes` */
  readonly idReporte: number;
  /** `reportes.inmunizacion_id` (FK → `inmunizacion.id_inmunizacion`) */
  readonly inmunizacionId: string;
  readonly pacienteId: string;
  /** `reportes.ciudadano_mayor_id` (nullable FK → `ciudadano_mayor_edad.id_ciudadano`) */
  readonly ciudadanoMayorId?: number | null;
  /** `reportes.ciudadano_menor_id` (nullable FK → `ciudadano_menor_edad.id_menor`) */
  readonly ciudadanoMenorId?: number | null;
  readonly esMenor?: boolean;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly vacunaId: string;
  readonly vacunaNombre: string;
  readonly lote: string;
  readonly fechaAplicacion: string;
  /** Lista de `sintomas_comunes.descripcion_sintoma` asociados */
  readonly sintomas: readonly string[];
  /** `reportes.recomendaciones` (VARCHAR(255) NOT NULL) */
  readonly recomendaciones: string;
  /** Alias de compatibilidad hacia `recomendaciones` */
  readonly indicacionesDictadas: string;
  /** `reportes.nivel_gravedad` (`'leve' | 'moderado' | 'severo'`, almacenado como `LEVE | MODERADO | SEVERO`) */
  readonly gravedad: NivelGravedadReporte;
  readonly fechaReporte: string;
  readonly enfermeroId: string;
  readonly enfermeroNombre: string;
  readonly centroId: string;
  readonly subregionDestinoId: string;
  readonly estadoSubregion: EstadoReporteSubregion;
}

/** DTO de entrada para registrar un nuevo evento adverso en la tabla `reportes`. */
export interface CrearReporteDto {
  readonly inmunizacionId?: string;
  readonly pacienteId: string;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly vacunaId: string;
  readonly vacunaNombre: string;
  readonly lote: string;
  readonly fechaAplicacion: string;
  readonly sintomas: readonly string[];
  readonly recomendaciones?: string;
  readonly indicacionesDictadas?: string;
  readonly gravedad: NivelGravedadReporte;
  readonly enfermeroId: string;
  readonly enfermeroNombre: string;
  readonly subregionDestinoId?: string;
}

