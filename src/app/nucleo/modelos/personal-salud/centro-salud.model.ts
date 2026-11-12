import type { TipoUsuarioTabla } from '../comunes/tablas-sql.model';

/**
 * Modelos de entidad y vista para el Centro de Salud y su Autoridad titular (/PS).
 * Mapean `centro_salud`, `autoridades`, `usuarios` y `profesiones` en `example.sql`.
 */

/** Datos de `centro_salud` (`example.sql`). */
export interface DatosCentroSalud {
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
 * Representa al Jefe / Autoridad titular del Centro de Salud.
 * Mapea la tabla `autoridades` unida con `usuarios`, `profesiones` y `centro_salud` en `example.sql`.
 */
export interface Enfermero {
  readonly id: string;
  /** PK numérica `autoridades.id_autoridades` */
  readonly idAutoridades: number;
  /** `autoridades.primer_nombre` (NOT NULL) */
  readonly primerNombre: string;
  /** `autoridades.segundo_nombre` (NOT NULL) */
  readonly segundoNombre: string;
  /** `autoridades.primer_apellido` (NOT NULL) */
  readonly primerApellido: string;
  /** `autoridades.segundo_apellido` (NOT NULL) */
  readonly segundoApellido: string;
  /** Nombre completo formateado para visualización */
  readonly nombre: string;
  /** `autoridades.c_i` (INT NOT NULL) */
  readonly ci: number;
  /** Cédula formateada para visualización */
  readonly cedula: string;
  /** `autoridades.n_impre` (INT NOT NULL — N° de Inpre / Matrícula profesional) */
  readonly nImpre: number;
  /** Matrícula formateada para compatibilidad */
  readonly idProfesional: string;
  /** `usuarios.correo_usuario` */
  readonly correo: string;
  /** `autoridades.domicilio` (VARCHAR(255)) */
  readonly domicilio: string;
  /** `autoridades.telefono` (VARCHAR(20) NOT NULL) */
  readonly telefono: string;
  /** `autoridades.usuario_id` (FK → `usuarios.id_usuarios`) */
  readonly usuarioId: number;
  /** `usuarios.tipo_usuario` (`'centro_salud_jefe'`) */
  readonly tipoUsuario: TipoUsuarioTabla;
  /** `autoridades.profesion_id` (FK → `profesiones.id_profesion`) */
  readonly profesionId: string;
  /** `profesiones.nombre_profesion` */
  readonly nombreProfesion: string;
  /** `centro_salud.id_centro` */
  readonly centroId: string;
  /** `centro_salud.codigo_centro` (VARCHAR(10) NOT NULL) */
  readonly codigoCentro: string;
  /** `centro_salud.ubicacion_centro` (VARCHAR(255) NOT NULL) */
  readonly ubicacionCentro: string;
  readonly activo: boolean;
  readonly vacunasAplicadasHoy: number;
  readonly vacunasAplicadasTotal: number;
}

