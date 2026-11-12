import type { TipoUsuarioSql } from '../tablas-sql.model';

/**
 * Modelos para el padrón nacional de autoridades y personal de salud (/master).
 */

export interface AutoridadNacionalMasterSql {
  readonly idAutoridades: number;
  readonly primerNombre: string;
  readonly segundoNombre: string;
  readonly primerApellido: string;
  readonly segundoApellido: string;
  readonly nombreCompleto: string;
  readonly ci: number;
  readonly nImpre: number;
  readonly telefono: string;
  readonly domicilio: string;
  readonly correo: string;
  readonly profesionId: number;
  readonly nombreProfesion: string;
  readonly tipoUsuario: TipoUsuarioSql;
  readonly entidadAsignadaId: number; // id_subregion o id_centro
  readonly entidadAsignadaNombre: string;
  readonly estadoId: number;
  readonly nombreEstado: string;
  readonly activo: boolean;
}

/** DTO para dar de alta una nueva autoridad a nivel nacional */
export interface CrearAutoridadMasterDto {
  readonly primerNombre: string;
  readonly segundoNombre: string;
  readonly primerApellido: string;
  readonly segundoApellido: string;
  readonly ci: number;
  readonly nImpre: number;
  readonly telefono: string;
  readonly domicilio?: string;
  readonly correo: string;
  readonly contrasenaInicial: string;
  readonly profesionId: number;
  readonly tipoUsuario: TipoUsuarioSql;
  readonly centroId?: number;
  readonly subregionId?: number;
}

/** DTO para reasignar una autoridad a otra sede o centro */
export interface ReasignarAutoridadMasterDto {
  readonly idAutoridades: number;
  readonly nuevoCentroId?: number;
  readonly nuevaSubregionId?: number;
  readonly nuevoTipoUsuario?: TipoUsuarioSql;
}

