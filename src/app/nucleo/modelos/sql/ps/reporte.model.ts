import type { NivelGravedadEsaviSql } from '../tablas-sql.model';

/**
 * Modelo de reporte de evento adverso (ESAVI) en base de datos (`reportes` en `example.sql`).
 */
export interface ReporteEsaviSql {
  readonly idReporte: number;
  readonly gravedad: NivelGravedadEsaviSql;
  readonly recomendaciones: string;
  readonly inmunizacionId: number;
  readonly ciudadanoMayorId?: number | null;
  readonly ciudadanoMenorId?: number | null;
  readonly sintomaId: number;
  readonly descripcionSintoma?: string;
  readonly pacienteNombre: string;
  readonly pacienteCedula?: string;
  readonly vacunaNombre: string;
  readonly lote: string;
  readonly fechaReporte: string;
  readonly centroId: number;
}

/** DTO para crear un nuevo reporte de incidencia en la tabla `reportes` */
export interface CrearReporteEsaviSqlDto {
  readonly gravedad: NivelGravedadEsaviSql;
  readonly recomendaciones: string;
  readonly inmunizacionId: number;
  readonly ciudadanoMayorId?: number;
  readonly ciudadanoMenorId?: number;
  readonly sintomaId: number;
}

