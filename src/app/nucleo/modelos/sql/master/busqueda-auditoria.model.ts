import type { SexoCiudadanoSql } from '../tablas-sql.model';

/**
 * Modelos para la búsqueda global de ciudadanos y auditoría de consultas (/master).
 */

export interface ResultadoBusquedaGlobalSql {
  readonly idCiudadano: number;
  readonly esMenor: boolean;
  readonly nombreCompleto: string;
  readonly cedula?: number;
  readonly fechaNacimiento: string;
  readonly edad: number;
  readonly sexo: SexoCiudadanoSql;
  readonly estadoNombre: string;
  readonly municipioNombre: string;
  readonly totalDosisAplicadas: number;
  readonly ultimoCentroVacunacion?: string;
  readonly ultimaFechaVacunacion?: string;
}

export interface RegistroAuditoriaBusquedaSql {
  readonly idAuditoria: number;
  readonly masterUsuarioId: number;
  readonly terminoBusqueda: string;
  readonly tipoFiltro: string;
  readonly fechaHora: string;
  readonly resultadosObtenidos: number;
}

/** DTO para asentar en auditoría una consulta efectuada por el Master */
export interface RegistrarAuditoriaDto {
  readonly masterUsuarioId: number;
  readonly terminoBusqueda: string;
  readonly tipoFiltro: string;
  readonly resultadosObtenidos: number;
}

