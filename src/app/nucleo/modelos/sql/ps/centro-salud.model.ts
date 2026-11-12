import type { TipoUsuarioSql } from '../tablas-sql.model';

/**
 * Modelo de entidad de un Centro de Salud en SQL (`centro_salud` en `example.sql`).
 */
export interface CentroSaludSql {
  readonly idCentro: number;
  readonly nombreCentro: string;
  readonly ubicacionCentro: string;
  readonly codigoCentro: string;
  readonly idJefeCentro: number;
  readonly parroquiaId?: number;
  readonly municipioId?: number;
  readonly estadoId?: number;
}

/**
 * Jefe / Encargado titular del Centro de Salud (`autoridades` + `usuarios` + `profesiones`).
 */
export interface JefeCentroSql {
  readonly idAutoridades: number;
  readonly primerNombre: string;
  readonly segundoNombre: string;
  readonly primerApellido: string;
  readonly segundoApellido: string;
  readonly nombreCompleto: string;
  readonly ci: number;
  readonly nImpre: number;
  readonly correo: string;
  readonly domicilio: string;
  readonly telefono: string;
  readonly usuarioId: number;
  readonly tipoUsuario: TipoUsuarioSql;
  readonly profesionId: number;
  readonly nombreProfesion: string;
  readonly centroId: number;
  readonly codigoCentro: string;
  readonly activo: boolean;
}

