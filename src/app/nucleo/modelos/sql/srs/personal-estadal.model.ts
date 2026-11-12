/**
 * Modelos de gestión de Personal de Salud y Autoridades adscritos a los centros del estado.
 * Mapean la tabla `autoridades` vinculada a `centro_salud` y `profesiones`.
 */

export interface TrabajadorEstadalSrsSql {
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
  readonly centroId: number;
  readonly nombreCentro: string;
  readonly codigoCentro: string;
  readonly municipioNombre: string;
  readonly esJefe: boolean;
  readonly vacunasAplicadasTotal: number;
  readonly activo: boolean;
}

/** DTO de entrada para dar de alta un nuevo profesional o autoridad en un centro del estado */
export interface CrearTrabajadorEstadalDto {
  readonly primerNombre: string;
  readonly segundoNombre: string;
  readonly primerApellido: string;
  readonly segundoApellido: string;
  readonly ci: number;
  readonly nImpre: number;
  readonly correo: string;
  readonly contrasenaInicial: string;
  readonly telefono: string;
  readonly domicilio?: string;
  readonly profesionId: number;
  readonly centroId: number;
  readonly esJefeCentro: boolean;
}

