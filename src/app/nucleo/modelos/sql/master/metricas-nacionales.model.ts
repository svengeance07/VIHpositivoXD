/**
 * Modelos de telemetría e indicadores consolidados nacionales (/master).
 */

export interface DosisPorEstadoItem {
  readonly estadoId: number;
  readonly estadoNombre: string;
  readonly totalDosis: number;
  readonly porcentajeNacional: number;
}

export interface DistribucionBiologicoItem {
  readonly vacunaNombre: string;
  readonly dosisAplicadas: number;
  readonly porcentaje: number;
}

export interface MetricasNacionalesMasterSql {
  readonly totalSubregionesActivas: number;
  readonly totalCentrosSaludActivos: number;
  readonly totalAutoridadesSalud: number;
  readonly totalDosisAplicadasNacional: number;
  readonly dosisAplicadasSemana: number;
  readonly rankingDosisPorEstado: readonly DosisPorEstadoItem[];
  readonly distribucionPorBiologico: readonly DistribucionBiologicoItem[];
  readonly lotesPorVencer: number;
  readonly reportesEsaviNacionales: number;
}

