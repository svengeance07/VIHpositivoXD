import type { EstadoLoteSql } from '../tablas-sql.model';

/**
 * Modelos para el catálogo nacional de vacunas e inventario de lotes (/master).
 */

export interface VacunaCatalogoMasterSql {
  readonly idVacuna: number;
  readonly nombreVacuna: string;
  readonly cantidadDosis: number;
  readonly totalLotesActivos: number;
  readonly dosisEnInventarioNacional: number;
}

export interface LoteVacunaMasterSql {
  readonly idLote: number;
  readonly numeroLote: string;
  readonly vacunaId: number;
  readonly nombreVacuna: string;
  readonly fechaProduccion: string;
  readonly fechaVencimiento: string;
  readonly cantidadRecibida: number;
  readonly cantidadDistribuida: number;
  readonly cantidadDisponible: number;
  readonly estado: EstadoLoteSql;
}

/** DTO para incorporar una nueva vacuna al catálogo oficial */
export interface CrearVacunaMasterDto {
  readonly nombreVacuna: string;
  readonly cantidadDosis: number;
}

/** DTO para registrar un nuevo lote o remesa de vacunas en el sistema nacional */
export interface CrearLoteVacunaMasterDto {
  readonly numeroLote: string;
  readonly vacunaId: number;
  readonly fechaProduccion: string;
  readonly fechaVencimiento: string;
  readonly cantidadRecibida: number;
}

/** DTO para actualizar el estado del lote (cuarentena, vencido, agotado) */
export interface ActualizarEstadoLoteDto {
  readonly idLote: number;
  readonly estado: EstadoLoteSql;
  readonly observaciones?: string;
}

