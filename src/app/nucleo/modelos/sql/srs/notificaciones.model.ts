/**
 * Modelos para la bandeja de notificaciones operativas de la Subregión (/SRS).
 * Mapean las alertas de certificados listos y reportes ESAVI recibidos.
 */

export type TipoNotificacionSrsSql = 'solicitud_certificado' | 'reporte_esavi';

export interface NotificacionSubregionSql {
  readonly idNotificacion: number;
  readonly tipo: TipoNotificacionSrsSql;
  readonly fecha: string;
  readonly leida: boolean;
  readonly titulo: string;
  readonly mensaje: string;
  readonly subregionId: number;
  readonly centroId?: number;
  readonly centroNombre?: string;
  readonly ciudadanoNombre?: string;
  readonly ciudadanoCedula?: number;
  readonly referenciaId: number; // id_certificado o id_reportes
  readonly prioridad: 'alta' | 'media' | 'baja';
}

/** DTO para marcar una notificación como leída o atendida */
export interface ActualizarNotificacionSrsDto {
  readonly idNotificacion: number;
  readonly leida: boolean;
}

