/**
 * Modelos de gestión de Centros de Salud adscritos a la Subregión estadal.
 * Mapean la tabla `centro_salud` con su jerarquía de `autoridades`.
 */

export interface JefeCentroResumenSql {
  readonly idAutoridades: number;
  readonly nombreCompleto: string;
  readonly ci: number;
  readonly nImpre: number;
  readonly telefono: string;
  readonly correo: string;
  readonly profesion: string;
}

export interface CentroAdscritoSrsSql {
  readonly idCentro: number;
  readonly codigoCentro: string;
  readonly nombreCentro: string;
  readonly ubicacionCentro: string;
  readonly estadoId: number;
  readonly municipioId: number;
  readonly municipioNombre: string;
  readonly parroquiaId: number;
  readonly parroquiaNombre: string;
  readonly jefe: JefeCentroResumenSql | null;
  readonly totalTrabajadores: number;
  readonly vacunasAplicadasMes: number;
  readonly activo: boolean;
}

/** DTO de entrada para que la Subregión registre un nuevo centro de salud */
export interface CrearCentroSrsDto {
  readonly nombreCentro: string;
  readonly codigoCentro: string;
  readonly ubicacionCentro: string;
  readonly estadoId: number;
  readonly municipioId: number;
  readonly parroquiaId: number;
  readonly idJefeCentro?: number;
}

/** DTO para actualizar los datos del centro o reasignar su jefe titular */
export interface ActualizarCentroSrsDto {
  readonly idCentro: number;
  readonly nombreCentro?: string;
  readonly ubicacionCentro?: string;
  readonly idJefeCentro?: number;
  readonly activo?: boolean;
}

