/**
 * Modelos de datos para el rol de Personal de Salud (Centro de Salud - /PS).
 *
 * Diseñados para soportar los dos perfiles del centro:
 * 1. Jefe de Centro: supervisión, métricas globales, generación de perfiles de enfermeros.
 * 2. Enfermero (Operativo): métricas individuales, aplicación de vacunas, registro de pacientes
 *    e informe de incidencias o efectos adversos hacia la subregión.
 */

/** Roles operativos internos dentro del Centro de Salud. */
export type PerfilPersonalSalud = 'jefe' | 'enfermero';

/** Estado de gravedad de un reporte de reacción adversa a una vacuna. */
export type NivelGravedadReporte = 'leve' | 'moderado' | 'severo';

/** Estado de comunicación del reporte hacia la Subregión de Salud estadal. */
export type EstadoReporteSubregion = 'enviado' | 'en_revision' | 'atendido';

/** Turnos de trabajo del personal de enfermería. */
export type TurnoTrabajo = 'manana' | 'tarde' | 'noche' | 'rotativo';

/**
 * Perfil de un enfermero/a perteneciente al centro de salud.
 * Utilizado para la gestión de personal (Punto 1 y 2 del Jefe).
 */
export interface Enfermero {
  readonly id: string;
  readonly nombre: string;
  readonly cedula: string;
  readonly correo: string;
  readonly telefono: string;
  readonly idProfesional: string; // Colegiado / Matrícula profesional
  readonly centroId: string;
  readonly turno: TurnoTrabajo;
  readonly fechaIngreso: string;
  readonly vacunasAplicadasTotal: number;
  readonly vacunasAplicadasHoy: number;
  readonly reportesGeneradosTotal: number;
  readonly activo: boolean;
  readonly clave?: string;
}

/**
 * Paciente atendido en el centro de salud (adulto o menor de edad).
 * Satisface el punto 3 (Registro de pacientes con representante para menores).
 */
export interface PacienteCentro {
  readonly id: string;
  readonly primerNombre: string;
  readonly segundoNombre?: string;
  readonly primerApellido: string;
  readonly segundoApellido?: string;
  readonly nombre: string; // Nombre completo consolidado para visualización rápida
  readonly cedula?: string; // Opcional: no se solicita si es menor de edad
  readonly fechaNacimiento: string;
  readonly tipoSangre?: string;
  readonly etnia?: string;
  readonly estatura?: number; // En centímetros (ej: 172)
  readonly correo?: string;
  readonly ocupacion?: string;
  readonly domicilio: string; // Dirección completa de residencia
  readonly direccion?: string; // Alias de compatibilidad
  readonly telefonoCelular: string;
  readonly telefonoDomicilio?: string;
  readonly telefono?: string; // Alias de compatibilidad
  readonly sexo: 'F' | 'M' | 'otro';
  readonly esMenor: boolean;
  /** En caso de menor de edad, vinculado a la cédula del padre o representante legal. */
  readonly cedulaRepresentante?: string;
  readonly nombreRepresentante?: string;
  readonly parentescoRepresentante?: string;
  readonly creadoEn: string;
  readonly centroRegistroId: string;
}

/**
 * Registro de administración de una vacuna en el centro de salud.
 * Satisface los puntos 4 y 6 (Consulta, aplicación e historial).
 */
export interface AplicacionVacuna {
  readonly id: string;
  readonly pacienteId: string;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly esMenor: boolean;
  readonly vacunaId: string;
  readonly vacunaNombre: string;
  readonly dosis: number; // 1, 2, 3, refuerzo
  readonly lote: string;
  readonly fechaAplicacion: string; // Formato YYYY-MM-DD
  readonly horaAplicacion: string; // Formato HH:mm
  readonly enfermeroId: string;
  readonly enfermeroNombre: string;
  readonly centroId: string;
  readonly observaciones?: string;
}

/**
 * Reporte clínico por eventos supuestamente atribuibles a la vacunación o inmunización (ESAVI).
 * Satisface el punto 5 (Registro de síntomas, indicaciones dictadas y notificación a la subregión).
 */
export interface ReporteIncidenciaVacuna {
  readonly id: string;
  readonly pacienteId: string;
  readonly pacienteCedula: string;
  readonly pacienteNombre: string;
  readonly vacunaId: string;
  readonly vacunaNombre: string;
  readonly lote: string;
  readonly fechaAplicacion: string;
  readonly fechaReporte: string;
  readonly horaReporte: string;
  readonly sintomas: readonly string[]; // Ej: ['Fiebre alta > 39°C', 'Inflamación local', 'Cefalea']
  readonly indicacionesDictadas: string; // Indicaciones y tratamiento médico prescrito
  readonly gravedad: NivelGravedadReporte;
  readonly estadoSubregion: EstadoReporteSubregion;
  readonly enfermeroId: string;
  readonly enfermeroNombre: string;
  readonly centroId: string;
  readonly subregionDestinoId: string;
}

/**
 * Métricas consolidadas para el Dashboard del Centro de Salud.
 * Proporciona los indicadores clave de rendimiento (KPIs) para el Jefe y Enfermeros.
 */
export interface MetricasCentroSalud {
  readonly vacunasHoy: number;
  readonly vacunasSemana: number;
  readonly pacientesAtendidosHoy: number;
  readonly enfermerosActivos: number;
  readonly reportesActivos: number;
  readonly dosisMenoresHoy: number;
  readonly dosisAdultosHoy: number;
}

/**
 * Métricas individuales para la visualización del perfil del Enfermero.
 */
export interface MetricasEnfermero {
  readonly misVacunasHoy: number;
  readonly misVacunasSemana: number;
  readonly misPacientesHoy: number;
  readonly misReportesTotal: number;
  readonly turnoActual: string;
}

/**
 * Opción de vacuna disponible en el stock del Centro de Salud.
 */
export interface OpcionVacunaCentro {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: 'infantil' | 'adulto' | 'universal';
  readonly lotesDisponibles: readonly string[];
  readonly dosisMaximas: number;
}
