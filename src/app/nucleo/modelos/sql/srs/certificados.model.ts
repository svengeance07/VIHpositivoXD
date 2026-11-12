import type { EstatusCertificadoSql } from '../tablas-sql.model';
import type { ExpedienteCiudadanoEstadalSql } from './ciudadanos-estadal.model';

/**
 * Modelos para la revisión, autorización y emisión de certificados de salud (/SRS).
 * Mapean la tabla `certificado` unida con `ciudadano_mayor_edad` y `examenes`.
 */

export interface CertificadoSrsSql {
  readonly idCertificado: number;
  readonly fechaEmision: string;
  readonly estatus: EstatusCertificadoSql;
  readonly ciudadanoId: number;
  readonly ciudadanoNombre: string;
  readonly ciudadanoCedula: number;
  readonly examenId: number;
  readonly nombreExamen: string;
  readonly cumpleInmunizaciones: boolean;
  readonly cumpleExamenes: boolean;
  readonly expedienteCompleto?: ExpedienteCiudadanoEstadalSql;
  readonly observaciones?: string;
  readonly autorizadoPorAutoridadId?: number;
}

/** DTO para dictaminar (aprobar o rechazar) un certificado de salud */
export interface RevisarCertificadoSrsDto {
  readonly idCertificado: number;
  readonly estatus: EstatusCertificadoSql;
  readonly observaciones: string;
  readonly autoridadRevisoraId: number;
}

/** DTO para expedir formalmente el certificado y registrar simulación de entrega */
export interface EmitirCertificadoSrsDto {
  readonly idCertificado: number;
  readonly fechaEmision: string;
  readonly autoridadEmisoraId: number;
  readonly correoDestinatario?: string;
}

