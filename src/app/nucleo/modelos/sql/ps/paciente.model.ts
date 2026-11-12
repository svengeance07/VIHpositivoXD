import type { SexoCiudadanoSql, TipoSangreSql } from '../tablas-sql.model';

/**
 * Modelo de dominio SQL para pacientes (adultos y menores) en el Centro de Salud (/PS).
 * Integra las tablas `ciudadano_mayor_edad` y `ciudadano_menor_edad` de `example.sql`.
 */
export interface PacienteCentroSql {
  readonly id: string;
  readonly idRegistro: number;
  readonly esMenor: boolean;
  readonly primerNombre: string;
  readonly segundoNombre: string;
  readonly primerApellido: string;
  readonly segundoApellido: string;
  readonly nombre: string;
  readonly cedula?: string;
  readonly fechaNacimiento: string;
  readonly sexo: SexoCiudadanoSql;
  readonly tipoSangre: TipoSangreSql;
  readonly estatura: number;
  readonly domicilio: string;
  readonly estadoId: number;
  readonly estadoNombre: string;
  readonly municipioId: number;
  readonly municipioNombre: string;
  readonly parroquiaId: number;
  readonly parroquiaNombre: string;
  readonly etniaId: number;
  readonly etnia: string;

  // Campos exclusivos de ciudadano_mayor_edad:
  readonly correo?: string;
  readonly telefonoCelular?: string;
  readonly telefonoDomicilio?: string;
  readonly profesionId?: number;
  readonly ocupacion?: string;

  // Campos exclusivos de ciudadano_menor_edad:
  readonly padreId?: number;
  readonly padreNombre?: string;
  readonly padreCedula?: string;

  readonly fechaRegistro: string;
}

/** DTO para la creación de un nuevo paciente en la base de datos desde /PS/pacientes/nuevo */
export interface CrearPacienteSqlDto {
  readonly esMenor: boolean;
  readonly primerNombre: string;
  readonly segundoNombre?: string;
  readonly primerApellido: string;
  readonly segundoApellido?: string;
  readonly cedula?: number;
  readonly fechaNacimiento: string;
  readonly sexo: SexoCiudadanoSql;
  readonly tipoSangre: TipoSangreSql;
  readonly estatura: number;
  readonly domicilio: string;
  readonly estadoId: number;
  readonly municipioId: number;
  readonly parroquiaId: number;
  readonly etniaId: number;
  readonly correo?: string;
  readonly telefonoCelular?: string;
  readonly telefonoDomicilio?: string;
  readonly profesionId?: number;
  readonly padreId?: number;
}

