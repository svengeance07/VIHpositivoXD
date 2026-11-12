/**
 * Interfaces 1:1 con las tablas relacionales de la base de datos de Sistema V.
 *
 * Fuentes de referencia en docs/:
 * - `docs/referencias/example.sql`: Script MySQL de 17 tablas con llaves foráneas.
 * - `docs/referencias/db_schema.sql`: Esquema formal de 16 tablas recibidas + extensiones del prototipo.
 */

/* ------------------------------------------------------------------ */
/* Tipos escalares y enumeraciones nativas de base de datos           */
/* ------------------------------------------------------------------ */

/** ENUM('masculino','femenino') en ciudadano_mayor_edad y ciudadano_menor_edad */
export type SexoCiudadanoSql = 'masculino' | 'femenino';

/** ENUM('O+', 'O-','A+','A-','B+','B-','AB+','AB-') en ciudadanos */
export type TipoSangreSql = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

/** ENUM('master','centro_salud_jefe','subregion') en usuarios */
export type TipoUsuarioSql = 'master' | 'centro_salud_jefe' | 'subregion';

/** ENUM('LEVE','MODERADO','SEVERO') en reportes (ESAVI) */
export type NivelGravedadEsaviSql = 'LEVE' | 'MODERADO' | 'SEVERO';

/** ENUM('RECHAZADO','APROBADO') en certificado */
export type EstatusCertificadoSql = 'RECHAZADO' | 'APROBADO';

/** Tipo de establecimiento en centros_salud (2 = centro, 3 = sede de subregión) */
export type TipoCentroSql = 2 | 3;

/** Estado de un lote de vacunas en inventario nacional/estadal */
export type EstadoLoteSql = 'disponible' | 'por_vencer' | 'agotado' | 'cuarentena';

/** Tipo de movimiento de biológicos entre dependencias */
export type TipoMovimientoSql =
  'despacho_central' | 'recepcion_subregion' | 'entrega_centro' | 'merma' | 'transferencia';

/* ------------------------------------------------------------------ */
/* Tablas de Autenticación, Personal y Autoridades                     */
/* ------------------------------------------------------------------ */

/** Tabla `usuarios` (`example.sql`). */
export interface UsuarioTabla {
  readonly id_usuarios: number;
  readonly correo_usuario: string | null;
  readonly contrasena?: string | null;
  readonly tipo_usuario: TipoUsuarioSql;
}

/** Tabla `autoridades` (`example.sql`). */
export interface AutoridadTabla {
  readonly id_autoridades: number;
  readonly primer_nombre: string;
  readonly segundo_nombre: string;
  readonly primer_apellido: string;
  readonly segundo_apellido: string;
  readonly c_i: number;
  readonly n_impre: number;
  readonly domicilio: string | null;
  readonly telefono: string;
  readonly usuario_id: number | null;
  readonly profesion_id: number | null;
}

/* ------------------------------------------------------------------ */
/* Tablas de Entidades Sanitarias (Centros y Subregiones)              */
/* ------------------------------------------------------------------ */

/** Tabla `centro_salud` (`example.sql`). */
export interface CentroSaludTabla {
  readonly id_centro: number;
  readonly nombre_centro: string;
  readonly ubicacion_centro: string;
  readonly codigo_centro: string;
  readonly id_jefe_centro: number | null;
  readonly parroquia_id: number | null;
  readonly municipio_id: number | null;
  readonly estado_id: number | null;
}

/** Tabla `subregion` (`example.sql`). */
export interface SubregionTabla {
  readonly id_subregion: number;
  readonly ubicacion: string;
  readonly parroquia_id: number | null;
  readonly municipio_id: number | null;
  readonly estado_id: number | null;
  readonly id_jefe_subregion: number | null;
}

/* ------------------------------------------------------------------ */
/* Tablas Geográficas y de Catálogos Comunes                           */
/* ------------------------------------------------------------------ */

/** Tabla `estados` (`example.sql`). */
export interface EstadoTabla {
  readonly id_estado: number;
  readonly nombre_estado: string;
}

/** Tabla `municipios` (`example.sql`). */
export interface MunicipioTabla {
  readonly id_municipio: number;
  readonly nombre_municipio: string;
  readonly estado_id: number | null;
}

/** Tabla `parroquias` (`example.sql`). */
export interface ParroquiaTabla {
  readonly id_parroquia: number;
  readonly nombre_parroquia: string;
  readonly municipio_id: number | null;
  readonly estado_id: number | null;
}

/** Tabla `profesiones` (`example.sql`). */
export interface ProfesionTabla {
  readonly id_profesion: number;
  readonly nombre_profesion: string;
}

/** Tabla `etnias` (`example.sql`). */
export interface EtniaTabla {
  readonly id_etnia: number;
  readonly nombre_etnia: string;
}

/* ------------------------------------------------------------------ */
/* Tablas Ciudadanas (Población mayor y menor de edad)                 */
/* ------------------------------------------------------------------ */

/** Tabla `ciudadano_mayor_edad` (`example.sql`). */
export interface CiudadanoMayorEdadTabla {
  readonly id_ciudadano: number;
  readonly primer_nombre: string;
  readonly segundo_nombre: string | null;
  readonly primer_apellido: string;
  readonly segundo_apellido: string | null;
  readonly c_i: number;
  readonly fecha_nacimiento: string;
  readonly sexo: SexoCiudadanoSql;
  readonly tipo_sangre: TipoSangreSql;
  readonly estatura: number;
  readonly correo_electronico: string | null;
  readonly telefono_celular: string | null;
  readonly telefono_domicilio: string | null;
  readonly domicilio: string;
  readonly profesion_id: number | null;
  readonly parroquia_id: number | null;
  readonly municipio_id: number | null;
  readonly estado_id: number | null;
  readonly etnia_id: number | null;
}

/** Tabla `ciudadano_menor_edad` (`example.sql`). */
export interface CiudadanoMenorEdadTabla {
  readonly id_menor: number;
  readonly primer_nombre: string;
  readonly segundo_nombre: string | null;
  readonly primer_apellido: string;
  readonly segundo_apellido: string | null;
  readonly fecha_nacimiento: string;
  readonly sexo: SexoCiudadanoSql;
  readonly tipo_sangre: TipoSangreSql;
  readonly estatura: number;
  readonly domicilio: string;
  readonly parroquia_id: number | null;
  readonly municipio_id: number | null;
  readonly estado_id: number | null;
  readonly etnia_id: number | null;
  readonly padre_id: number | null;
}

/* ------------------------------------------------------------------ */
/* Tablas Clínicas (Inmunización, Biológicos, Exámenes y Reportes)     */
/* ------------------------------------------------------------------ */

/** Tabla `vacunas` (`example.sql`). */
export interface VacunaTabla {
  readonly id_vacuna: number;
  readonly nombre_vacuna: string;
  readonly cantidad_dosis: number;
}

/** Tabla `inmunizacion` (`example.sql`). */
export interface InmunizacionTabla {
  readonly id_inmunizacion: number;
  readonly numero_dosis: number;
  readonly fecha_aplicacion: string | null;
  readonly numero_lote: string | null;
  readonly observaciones: string | null;
  readonly centro_salud_aplicacion: number | null;
  readonly vacuna_id: number | null;
  readonly ciudadano_mayor_edad_id: number | null;
  readonly ciudadano_mayor_menor_id: number | null;
}

/** Tabla `sintomas_comunes` (`example.sql`). */
export interface SintomaComunTabla {
  readonly id_sintoma: number;
  readonly descripcion_sintoma: string | null;
}

/** Tabla `reportes` (`example.sql` — ESAVI). */
export interface ReporteTabla {
  readonly id_reportes: number;
  readonly nivel_gravedad: NivelGravedadEsaviSql;
  readonly recomendaciones: string;
  readonly inmunizacion_id: number | null;
  readonly ciudadano_mayor_id: number | null;
  readonly ciudadano_menor_id: number | null;
  readonly sintoma_id: number | null;
}

/** Tabla `examenes` (`example.sql`). */
export interface ExamenTabla {
  readonly id_examenes: number;
  readonly nombre_examen: string;
}

/** Tabla `certificado` (`example.sql`). */
export interface CertificadoTabla {
  readonly id_certificado: number;
  readonly fecha_emision: string;
  readonly estatus: EstatusCertificadoSql;
  readonly ciudadano_mayor_id: number | null;
  readonly examen_id: number | null;
}

/* ------------------------------------------------------------------ */
/* Tablas Complementarias (Extensiones de db_schema.sql)               */
/* ------------------------------------------------------------------ */

/** Tabla propuesta `notificaciones_srs` (`db_schema.sql`). */
export interface NotificacionSrsTabla {
  readonly id: number;
  readonly tipo: 'solicitud_certificado' | 'reporte_esavi';
  readonly fecha: string;
  readonly leida: boolean;
  readonly subregion_id: number;
  readonly centro_id: number | null;
  readonly certificado_id: number | null;
  readonly reporte_id: number | null;
  readonly mensaje: string;
}

/** Tabla propuesta `lotes_vacunas` (Gestión de inventario central y estadal). */
export interface LoteVacunaTabla {
  readonly id_lote: number;
  readonly numero_lote: string;
  readonly vacuna_id: number;
  readonly fecha_produccion: string;
  readonly fecha_vencimiento: string;
  readonly cantidad_recibida: number;
  readonly cantidad_disponible: number;
  readonly estado: EstadoLoteSql;
}

/** Tabla propuesta `movimientos_vacunas` (Trazabilidad nacional de despachos). */
export interface MovimientoVacunaTabla {
  readonly id_movimiento: number;
  readonly tipo: TipoMovimientoSql;
  readonly lote_id: number;
  readonly origen_centro_id: number | null;
  readonly destino_centro_id: number | null;
  readonly cantidad_dosis: number;
  readonly fecha_movimiento: string;
  readonly responsable_autoridad_id: number;
  readonly observaciones: string | null;
}

/** Tabla propuesta `auditoria_busquedas` (Auditoría del rol Master). */
export interface AuditoriaBusquedaTabla {
  readonly id_auditoria: number;
  readonly master_usuario_id: number;
  readonly termino_busqueda: string;
  readonly tipo_filtro: string;
  readonly fecha_hora: string;
  readonly resultados_obtenidos: number;
}
