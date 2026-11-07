import type { RolUsuario } from './enumeraciones';

/** Roles que inician sesión. El ciudadano (0) usa el flujo público. */
export type RolInterno = Exclude<RolUsuario, 0>;

/**
 * Cuenta de acceso individual:
 * - Rol 1: Master del sistema.
 * - Rol 2: Jefe encargado del centro de salud.
 * - Rol 3: Jefe encargado de la subregión de salud.
 */
export interface CuentaAcceso {
  readonly id: string;
  readonly rol: RolInterno;
  /** Nombre de la persona titular de la cuenta (jefe o master). */
  readonly nombre: string;
  /** Nombre del centro de salud o subregión asignada, o `null` si es master. */
  readonly entidad: string | null;
  /** Identificador del centro o subregión asignada, o `null` si es master. */
  readonly centroId?: string | null;
  /** Solo el master lo usa; el login actual pide correo. */
  readonly nombreUsuario?: string;
  readonly correo: string;
  readonly clave: string;
}

/** Sesión activa en memoria. */
export interface SesionActiva {
  readonly id: string;
  readonly rol: RolInterno;
  /** Nombre de quien está usando el sistema (jefe o master). */
  readonly nombre: string;
  /** Correo electrónico de la cuenta activa. */
  readonly correo: string;
  /** Nombre de la entidad (centro o subregión), o `null` si es master. */
  readonly entidad: string | null;
  /** Identificador del centro o subregión, o `null` si es master. */
  readonly centroId: string | null;
  /** Nombre de usuario de la cuenta; solo lo usa el master para el saludo. */
  readonly nombreUsuario: string | null;
}
