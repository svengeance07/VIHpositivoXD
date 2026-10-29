import type { EstadoCertificado } from './enumeraciones';
import type { CentroSalud, Ciudadano, PersonalSalud } from './master';

/**
 * Modelos de presentación para el rol Subregión de Salud (/SRS).
 *
 * Igual que en el master y en /PS, no son contratos de persistencia: reflejan
 * los datos que las vistas necesitan mientras el backend no existe. La vigencia
 * de vacunas y exámenes es una regla provisional del prototipo y debe validarse
 * con el equipo de salud antes de convertirla en una regla de negocio definitiva.
 */

export type EstadoVigencia = 'vigente' | 'vencido';

/** Estado de un requisito dentro de la evaluación del certificado. */
export type EstadoRequisito = 'vigente' | 'vencido' | 'incompleto' | 'ausente';

export type TipoHitoFicha = 'vacuna' | 'examen' | 'perfil' | 'certificado';

export type TonoHito = 'ok' | 'info' | 'warn';

export interface VacunaFicha {
  readonly id: string;
  readonly vacunaId: string;
  readonly nombre: string;
  readonly dosis: number;
  readonly dosisRequeridas: number;
  readonly fecha: string;
  readonly lote: string;
  readonly centroId: string;
  readonly centroNombre: string;
  /** Fecha de vencimiento calculada; `null` cuando la vigencia es permanente. */
  readonly vencimiento: string | null;
  readonly estado: EstadoVigencia;
}

export interface ExamenFicha {
  readonly id: string;
  readonly examenId: string;
  readonly nombre: string;
  readonly fecha: string;
  readonly resultado: string;
  readonly sensible: boolean;
  readonly vencimiento: string;
  readonly estado: EstadoVigencia;
}

export interface RequisitoCertificado {
  readonly id: string;
  readonly tipo: 'vacuna' | 'examen';
  readonly etiqueta: string;
  readonly detalle: string;
  readonly estado: EstadoRequisito;
  readonly cumplido: boolean;
}

export interface HitoLineaTiempo {
  readonly id: string;
  readonly fecha: string;
  readonly tipo: TipoHitoFicha;
  readonly titulo: string;
  readonly detalle: string;
  readonly tono: TonoHito;
}

/** Ficha consolidada de un ciudadano del estado asignado a la subregión. */
export interface FichaCiudadano {
  readonly ciudadano: Ciudadano;
  readonly nombre: string;
  readonly iniciales: string;
  readonly edad: number;
  readonly sexo: string;
  readonly ubicacion: string;
  readonly correo: string;
  readonly telefono: string;
  readonly vacunas: readonly VacunaFicha[];
  readonly examenes: readonly ExamenFicha[];
  readonly requisitos: readonly RequisitoCertificado[];
  readonly requisitosCumplidos: number;
  readonly requisitosTotales: number;
  readonly porcentajeRequisitos: number;
  readonly vacunasVencidas: number;
  readonly examenesVencidos: number;
  readonly aptoCertificado: boolean;
  readonly lineaTiempo: readonly HitoLineaTiempo[];
}

/** Registro de personal tipo 2 visto desde la subregión. */
export interface TrabajadorSubregionVista {
  readonly personal: PersonalSalud;
  readonly centro: CentroSalud;
  readonly estadoNombre: string;
  readonly municipioNombre: string;
  readonly parroquiaNombre: string;
  readonly profesion: string;
  readonly esJefe: boolean;
  readonly aniosServicio: number;
  readonly iniciales: string;
}

export interface CentroSubregionVista {
  readonly centro: CentroSalud;
  readonly municipioNombre: string;
  readonly parroquiaNombre: string;
  readonly jefe: PersonalSalud | null;
  readonly trabajadores: number;
}

/** Solicitud de certificado almacenada por el prototipo. */
export interface SolicitudCertificado {
  readonly id: string;
  readonly codigo: string;
  readonly ciudadanoId: string;
  readonly fechaSolicitud: string;
  readonly estado: EstadoCertificado;
  readonly solicitadoPor: string;
  readonly revisadoPor: string;
  readonly fechaRevision: string | null;
  readonly fechaEmision: string | null;
  readonly motivo: string;
  readonly observaciones: string;
  readonly correoEnviado: boolean;
}

/** Solicitud enriquecida con la ficha y los requisitos vigentes del ciudadano. */
export interface SolicitudCertificadoVista extends SolicitudCertificado {
  readonly ficha: FichaCiudadano;
  readonly nombreCiudadano: string;
  readonly cedula: string;
  readonly correo: string;
}

export type TipoNotificacionSrs = 'esavi' | 'certificado' | 'expediente' | 'sistema';

export type PrioridadNotificacionSrs = 'alta' | 'media' | 'baja';

export interface NotificacionSrs {
  readonly id: string;
  /** Fecha y hora en formato ISO. */
  readonly fecha: string;
  readonly tipo: TipoNotificacionSrs;
  readonly titulo: string;
  readonly mensaje: string;
  readonly personaNombre: string;
  readonly personaCedula?: string;
  readonly centroNombre?: string;
  readonly estadoId: string;
  readonly leida: boolean;
  readonly prioridad: PrioridadNotificacionSrs;
  readonly enlace?: string;
}

export interface ResumenSubregion {
  readonly ciudadanos: number;
  readonly trabajadores: number;
  readonly jefes: number;
  readonly centros: number;
  readonly solicitudesPendientes: number;
  readonly certificadosEmitidos: number;
  readonly noLeidas: number;
  readonly aptos: number;
  readonly vacunasVencidas: number;
}
