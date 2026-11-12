import type { TipoMovimientoSql } from '../tablas-sql.model';

/**
 * Modelos de trazabilidad y movimientos de vacunas a nivel nacional (/master).
 */

export interface MovimientoDistribucionMasterSql {
  readonly idMovimiento: number;
  readonly tipoMovimiento: TipoMovimientoSql;
  readonly loteId: number;
  readonly numeroLote: string;
  readonly vacunaNombre: string;
  readonly origenCentroId?: number | null;
  readonly origenNombre: string;
  readonly destinoCentroId?: number | null;
  readonly destinoNombre: string;
  readonly cantidadDosis: number;
  readonly fechaMovimiento: string;
  readonly responsableAutoridadId: number;
  readonly responsableNombre: string;
  readonly observaciones?: string | null;
}

/** DTO para asentar un despacho, recepción o traslado de biológicos */
export interface RegistrarMovimientoMasterDto {
  readonly tipoMovimiento: TipoMovimientoSql;
  readonly loteId: number;
  readonly origenCentroId?: number;
  readonly destinoCentroId?: number;
  readonly cantidadDosis: number;
  readonly fechaMovimiento: string;
  readonly responsableAutoridadId: number;
  readonly observaciones?: string;
}

