import type { RolUsuario, TipoEmpleado } from './enumeraciones';

/** Roles que inician sesión. El ciudadano (0) usa el flujo público. */
export type RolInterno = Exclude<RolUsuario, 0>;

/**
 * Sub-perfil dentro de una cuenta de tipo 2 o 3.
 *
 * La entidad (centro de salud o subregión) inicia sesión primero; después se elige
 * uno de sus perfiles internos y se validan sus credenciales.
 */
export interface PerfilAcceso {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoEmpleado;
  readonly correo: string;
  readonly clave: string;
}

/** Cuenta de acceso: master, centro de salud o subregión. */
export interface CuentaAcceso {
  readonly id: string;
  readonly rol: RolInterno;
  readonly nombre: string;
  /** Solo el master lo usa; el login actual pide correo. */
  readonly nombreUsuario?: string;
  readonly correo: string;
  readonly clave: string;
  /** Vacío en el master; obligatorio en los roles 2 y 3. */
  readonly perfiles: readonly PerfilAcceso[];
}

/** Sesión activa en memoria. */
export interface SesionActiva {
  readonly rol: RolInterno;
  /** Nombre de quien está usando el sistema. */
  readonly nombre: string;
  /** Nombre de la entidad, o `null` si es master. */
  readonly entidad: string | null;
  /** Nombre de usuario de la cuenta; solo lo usa el master para el saludo. */
  readonly nombreUsuario: string | null;
  readonly perfil: Pick<PerfilAcceso, 'id' | 'nombre' | 'tipo'> | null;
}
