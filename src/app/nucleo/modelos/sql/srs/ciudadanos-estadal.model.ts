import type { SexoCiudadanoSql, TipoSangreSql } from '../tablas-sql.model';

/**
 * Modelos para la consulta y fiscalización de ciudadanos del estado (/SRS).
 * Mapean `ciudadano_mayor_edad`, `ciudadano_menor_edad`, `inmunizacion` y `examenes`.
 */

export interface InmunizacionResumenSql {
  readonly idInmunizacion: number;
  readonly vacunaId: number;
  readonly nombreVacuna: string;
  readonly dosis: number;
  readonly lote: string;
  readonly fechaAplicacion: string;
  readonly centroId: number;
  readonly centroNombre: string;
}

export interface ExamenResultadoSql {
  readonly idExamen: number;
  readonly nombreExamen: string;
  readonly fechaRealizacion: string;
  readonly resultado: string;
  readonly esSensible: boolean;
  readonly aprobado: boolean;
}

export interface RequisitoCertificadoSql {
  readonly tipo: 'vacuna' | 'examen';
  readonly descripcion: string;
  readonly cumplido: boolean;
  readonly fechaCumplimiento?: string;
  readonly detalleEstado: string;
}

/** Expediente clínico consolidado de un ciudadano visto desde la Subregión */
export interface ExpedienteCiudadanoEstadalSql {
  readonly idRegistro: number;
  readonly esMenor: boolean;
  readonly nombreCompleto: string;
  readonly cedula?: number;
  readonly sexo: SexoCiudadanoSql;
  readonly tipoSangre: TipoSangreSql;
  readonly fechaNacimiento: string;
  readonly edad: number;
  readonly domicilio: string;
  readonly municipioNombre: string;
  readonly parroquiaNombre: string;
  readonly telefono?: string;
  readonly correo?: string;
  readonly historialInmunizaciones: readonly InmunizacionResumenSql[];
  readonly historialExamenes: readonly ExamenResultadoSql[];
  readonly requisitosCertificado: readonly RequisitoCertificadoSql[];
  readonly requisitosCumplidos: number;
  readonly requisitosTotales: number;
  readonly porcentajeRequisitos: number;
  readonly aptoParaCertificado: boolean;
}

