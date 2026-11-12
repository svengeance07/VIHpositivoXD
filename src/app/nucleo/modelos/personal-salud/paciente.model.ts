import type { SexoCiudadano, TipoSangreOficial } from '../comunes/tablas-sql.model';

/**
 * Representa a un paciente (ciudadano adulto o menor de edad) atendido en el Centro de Salud (/PS).
 *
 * Mapea fielmente las dos tablas de `example.sql`:
 * - Cuando `esMenor === false`: tabla `ciudadano_mayor_edad`.
 * - Cuando `esMenor === true`: tabla `ciudadano_menor_edad`.
 */
export interface PacienteCentro {
  readonly id: string;
  /** PK numérica `id_ciudadano` (en `ciudadano_mayor_edad`) o `id_menor` (en `ciudadano_menor_edad`) */
  readonly idRegistro: number;
  /** Indica si pertenece a `ciudadano_menor_edad` (`true`) o `ciudadano_mayor_edad` (`false`) */
  readonly esMenor: boolean;
  /** `primer_nombre VARCHAR(50) NOT NULL` */
  readonly primerNombre: string;
  /** `segundo_nombre VARCHAR(50)` */
  readonly segundoNombre: string;
  /** `primer_apellido VARCHAR(50) NOT NULL` */
  readonly primerApellido: string;
  /** `segundo_apellido VARCHAR(50)` */
  readonly segundoApellido: string;
  /** Nombre completo consolidado (`primer_nombre + segundo_nombre + primer_apellido + segundo_apellido`) */
  readonly nombre: string;
  /** `c_i INT NOT NULL UNIQUE` — Exclusivo de `ciudadano_mayor_edad` */
  readonly cedula?: string;
  /** `fecha_nacimiento DATE NOT NULL` */
  readonly fechaNacimiento: string;
  /** `sexo ENUM('masculino','femenino') NOT NULL` */
  readonly sexo: SexoCiudadano;
  /** `tipo_sangre ENUM('O+', 'O-','A+','A-','B+','B-','AB+','AB-') NOT NULL` */
  readonly tipoSangre: TipoSangreOficial;
  /** `estatura INT NOT NULL` (en centímetros) */
  readonly estatura: number;
  /** `domicilio VARCHAR(255) NOT NULL` */
  readonly domicilio: string;
  /** `estado_id INT` (FK → `estados.id_estado`) */
  readonly estadoId: string;
  readonly estadoNombre: string;
  /** `municipio_id INT` (FK → `municipios.id_municipio`) */
  readonly municipioId: string;
  readonly municipioNombre: string;
  /** `parroquia_id INT` (FK → `parroquias.id_parroquia`) */
  readonly parroquiaId: string;
  readonly parroquiaNombre: string;
  /** `etnia_id INT` (FK → `etnias.id_etnia`) */
  readonly etniaId: string;
  readonly etnia: string;

  // Campos exclusivos de `ciudadano_mayor_edad`:
  /** `correo_electronico VARCHAR(100)` (solo `ciudadano_mayor_edad`) */
  readonly correo?: string;
  /** `telefono_celular VARCHAR(20)` (solo `ciudadano_mayor_edad`) */
  readonly telefonoCelular?: string;
  /** `telefono_domicilio VARCHAR(20)` (solo `ciudadano_mayor_edad`) */
  readonly telefonoDomicilio?: string;
  /** `profesion_id INT` (FK → `profesiones.id_profesion`, solo `ciudadano_mayor_edad`) */
  readonly profesionId?: string;
  readonly ocupacion?: string;

  // Campos exclusivos de `ciudadano_menor_edad`:
  /** `padre_id INT` (FK → `ciudadano_mayor_edad.id_ciudadano`, solo `ciudadano_menor_edad`) */
  readonly padreId?: number;
  readonly padreNombre?: string;
  readonly padreCedula?: string;

  readonly fechaRegistro: string;
}

/** DTO de entrada para crear un nuevo ciudadano mayor o menor de edad en `/PS/pacientes/nuevo`. */
export type CrearPacienteDto = Omit<PacienteCentro, 'id' | 'idRegistro' | 'fechaRegistro'> & {
  readonly idRegistro?: number;
};

