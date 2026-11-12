/**
 * Modelos de dominio SQL para la sede de la Subregión de Salud (/SRS).
 * Mapean la tabla `subregion` y su autoridad titular (`autoridades`) en `example.sql`.
 */

export interface JefeSubregionSql {
  readonly idAutoridades: number;
  readonly primerNombre: string;
  readonly segundoNombre: string;
  readonly primerApellido: string;
  readonly segundoApellido: string;
  readonly nombreCompleto: string;
  readonly ci: number;
  readonly nImpre: number;
  readonly correo: string;
  readonly telefono: string;
  readonly domicilio: string;
  readonly profesionId: number;
  readonly nombreProfesion: string;
  readonly subregionId: number;
}

export interface SubregionSedeSql {
  readonly idSubregion: number;
  readonly ubicacion: string;
  readonly estadoId: number;
  readonly nombreEstado: string;
  readonly municipioId: number;
  readonly nombreMunicipio: string;
  readonly parroquiaId: number;
  readonly nombreParroquia: string;
  readonly idJefeSubregion: number;
  readonly jefe: JefeSubregionSql;
}

/** DTO para actualizar la información de contacto o ubicación de la sede */
export interface ActualizarSubregionDto {
  readonly idSubregion: number;
  readonly ubicacion?: string;
  readonly idJefeSubregion?: number;
  readonly parroquiaId?: number;
}

