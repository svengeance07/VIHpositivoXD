/**
 * Interfaces 1:1 de las 14 tablas relacionales definidas en `docs/referencias/example.sql`.
 */

/** Sexo biológico según `ENUM('masculino','femenino')` en `ciudadano_mayor_edad` y `ciudadano_menor_edad`. */
export type SexoCiudadano = 'masculino' | 'femenino';

/** Tipo de sangre según `ENUM('O+', 'O-','A+','A-','B+','B-','AB+','AB-')` en `example.sql`. */
export type TipoSangreOficial = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

/** Tipo de usuario según `ENUM('master','centro_salud_jefe','subregion')` en `usuarios`. */
export type TipoUsuarioTabla = 'master' | 'centro_salud_jefe' | 'subregion';

/** Nivel de gravedad en base de datos según `ENUM('LEVE','MODERADO','SEVERO')` en `reportes`. */
export type NivelGravedadTabla = 'LEVE' | 'MODERADO' | 'SEVERO';

/** Tabla `usuarios` (`example.sql`). */
export interface UsuarioTabla {
  readonly id_usuarios: number;
  readonly correo_usuario: string | null;
  readonly contrasena?: string | null;
  readonly tipo_usuario: TipoUsuarioTabla;
}

/** Tabla `profesiones` (`example.sql`). */
export interface ProfesionTabla {
  readonly id_profesion: number;
  readonly nombre_profesion: string;
}

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

/** Tabla `etnias` (`example.sql`). */
export interface EtniaTabla {
  readonly id_etnia: number;
  readonly nombre_etnia: string;
}

/** Tabla `vacunas` (`example.sql`). */
export interface VacunaTabla {
  readonly id_vacuna: number;
  readonly nombre_vacuna: string;
  readonly cantidad_dosis: number;
}

/** Tabla `sintomas_comunes` (`example.sql`). */
export interface SintomaComunTabla {
  readonly id_sintoma: number;
  readonly descripcion_sintoma: string | null;
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

/** Tabla `ciudadano_mayor_edad` (`example.sql`). */
export interface CiudadanoMayorEdadTabla {
  readonly id_ciudadano: number;
  readonly primer_nombre: string;
  readonly segundo_nombre: string | null;
  readonly primer_apellido: string;
  readonly segundo_apellido: string | null;
  readonly c_i: number;
  readonly fecha_nacimiento: string;
  readonly sexo: SexoCiudadano;
  readonly tipo_sangre: TipoSangreOficial;
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
  readonly sexo: SexoCiudadano;
  readonly tipo_sangre: TipoSangreOficial;
  readonly estatura: number;
  readonly domicilio: string;
  readonly parroquia_id: number | null;
  readonly municipio_id: number | null;
  readonly estado_id: number | null;
  readonly etnia_id: number | null;
  readonly padre_id: number | null;
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

/** Tabla `reportes` (`example.sql`). */
export interface ReporteTabla {
  readonly id_reportes: number;
  readonly nivel_gravedad: NivelGravedadTabla;
  readonly recomendaciones: string;
  readonly inmunizacion_id: number | null;
  readonly ciudadano_mayor_id: number | null;
  readonly ciudadano_menor_id: number | null;
  readonly sintoma_id: number | null;
}

