/**
 * Modelo de telemetría y resumen estadístico estadal para la Subregión de Salud (/SRS).
 */
export interface MetricasEstadalesSrsSql {
  readonly subregionId: number;
  readonly nombreEstado: string;
  readonly totalCentrosActivos: number;
  readonly totalTrabajadores: number;
  readonly totalJefesCentro: number;
  readonly totalCiudadanosCensados: number;
  readonly solicitudesCertificadosPendientes: number;
  readonly certificadosAprobadosMes: number;
  readonly certificadosRechazadosMes: number;
  readonly notificacionesNoLeidas: number;
  readonly reportesEsaviActivos: number;
  readonly vacunasAplicadasMes: number;
  readonly promedioCoberturaRequisitos: number;
}

