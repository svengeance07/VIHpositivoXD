/**
 * Modelos para el inventario nacional de subregiones estadales y centros de salud (/master).
 */

export interface SubregionNacionalMasterSql {
  readonly idSubregion: number;
  readonly ubicacion: string;
  readonly estadoId: number;
  readonly nombreEstado: string;
  readonly municipioId: number;
  readonly nombreMunicipio: string;
  readonly parroquiaId: number;
  readonly nombreParroquia: string;
  readonly idJefeSubregion: number;
  readonly nombreJefe: string;
  readonly ciJefe: number;
  readonly correoJefe: string;
  readonly totalCentros: number;
  readonly totalTrabajadores: number;
}

export interface CentroNacionalMasterSql {
  readonly idCentro: number;
  readonly codigoCentro: string;
  readonly nombreCentro: string;
  readonly ubicacionCentro: string;
  readonly estadoId: number;
  readonly nombreEstado: string;
  readonly municipioId: number;
  readonly nombreMunicipio: string;
  readonly parroquiaId: number;
  readonly nombreParroquia: string;
  readonly idJefeCentro?: number;
  readonly nombreJefe?: string;
  readonly ciJefe?: number;
  readonly activo: boolean;
}

/** DTO para crear o asignar una sede de Subregión de Salud a un estado */
export interface CrearSubregionMasterDto {
  readonly estadoId: number;
  readonly municipioId: number;
  readonly parroquiaId: number;
  readonly ubicacion: string;
  readonly idJefeSubregion: number;
}

/** DTO para dar de alta un nuevo Centro de Salud a nivel nacional */
export interface CrearCentroNacionalMasterDto {
  readonly codigoCentro: string;
  readonly nombreCentro: string;
  readonly ubicacionCentro: string;
  readonly estadoId: number;
  readonly municipioId: number;
  readonly parroquiaId: number;
  readonly idJefeCentro?: number;
}

