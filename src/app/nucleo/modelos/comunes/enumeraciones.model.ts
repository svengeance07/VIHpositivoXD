/**
 * Enumeraciones transversales del dominio, tomadas de `docs/diseno/vistas.md`
 * y `docs/diseno/modelo-datos.md`.
 */

/** Rol persistido en el sistema. `0` es el ciudadano, que no inicia sesión. */
export type RolUsuario = 0 | 1 | 2 | 3;

/** Tipo de empleado dentro de una cuenta de centro de salud (rol 2) o subregión (rol 3). */
export type TipoEmpleado = 'jefe' | 'trabajador';

/** Estados posibles de un lote de vacunas. */
export type EstadoLote = 'en_camino' | 'reportado' | 'aceptado';

/** Estados del certificado de salud: la subregión autoriza o descarta la emisión. */
export type EstadoCertificado = 'solicitado' | 'autorizado' | 'descartado' | 'emitido';

/** Sexo registrado del ciudadano en vistas generales y filtros de búsqueda. */
export type Sexo = 'F' | 'M' | 'otro';

