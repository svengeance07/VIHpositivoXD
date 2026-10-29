/**
 * Enumeraciones del dominio, tomadas de los bocetos y de las decisiones registradas
 * en `docs/diseno/vistas.md` y `docs/diseno/modelo-datos-preliminar.md`.
 *
 * Son tipos, no catálogos: sus opciones no se administran desde la interfaz.
 */

/** Rol persistido en la base de datos. `0` es el ciudadano, que no inicia sesión. */
export type RolUsuario = 0 | 1 | 2 | 3;

/** Tipo de empleado dentro de una cuenta de centro de salud (rol 2) o subregión (rol 3). */
export type TipoEmpleado = 'jefe' | 'trabajador';

/** Estados posibles de un lote de vacunas. No hay más. */
export type EstadoLote = 'en_camino' | 'reportado' | 'aceptado';

/** Estados del certificado de salud: la subregión autoriza o descarta la emisión. */
export type EstadoCertificado = 'solicitado' | 'autorizado' | 'descartado' | 'emitido';

/** Sexo registrado del ciudadano; se usa como filtro de búsqueda. */
export type Sexo = 'F' | 'M' | 'otro';
