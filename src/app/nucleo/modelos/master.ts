import type { EstadoLote, Sexo } from './enumeraciones';

/**
 * Datos de apoyo para las vistas del master.
 *
 * Son tipos de presentación: reflejan el esquema parcial recibido y añaden los
 * campos que el prototipo necesita para poder navegar con mocks. No son modelos
 * de persistencia ni contratos de API.
 */

export type TipoCentro = 2 | 3;

export interface Estado {
  readonly id: string;
  readonly nombre: string;
}

export interface Municipio {
  readonly id: string;
  readonly nombre: string;
  readonly estadoId: string;
}

export interface Parroquia {
  readonly id: string;
  readonly nombre: string;
  readonly municipioId: string;
}

/** Fila de `centros_salud`; `tipo` solo distingue centro (2) de subregión (3). */
export interface CentroSalud {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly tipo: TipoCentro;
  readonly estadoId: string;
  readonly municipioId: string;
  readonly parroquiaId: string;
  readonly encargadoId: string;
  readonly telefono: string;
  readonly direccion: string;
  readonly activo: boolean;
}

/** Fila de `personal`; el jefe se deriva de `centros_salud.encargado_id`. */
export interface PersonalSalud {
  readonly id: string;
  readonly nombre: string;
  readonly cedula: string;
  readonly correo: string;
  readonly telefono: string;
  readonly profesionId: string;
  readonly tipoCuenta: TipoCentro;
  readonly centroId: string;
  readonly idProfesional: string;
  readonly ingreso: string;
  readonly activo: boolean;
}

export interface VacunaAplicada {
  readonly vacunaId: string;
  readonly dosis: number;
  readonly fecha: string;
  readonly lote: string;
  readonly centroId: string;
}

export interface ExamenRealizado {
  readonly examenId: string;
  readonly fecha: string;
  readonly resultado: string;
  readonly sensible: boolean;
}

/** Resumen de `usuarios` con sus vacunas y exámenes para las vistas del master. */
export interface Ciudadano {
  readonly id: string;
  readonly nombre1: string;
  readonly nombre2: string;
  readonly apellido1: string;
  readonly apellido2: string;
  readonly cedula: string;
  readonly sexo: Sexo;
  readonly nacimiento: string;
  readonly correo: string;
  readonly telefono: string;
  readonly etniaId: string | null;
  readonly estadoId: string;
  readonly municipioId: string;
  readonly parroquiaId: string;
  readonly creadoEn: string;
  readonly vacunas: readonly VacunaAplicada[];
  readonly examenes: readonly ExamenRealizado[];
}

export interface LoteVacuna {
  readonly id: string;
  readonly codigo: string;
  readonly vacunaId: string;
  readonly dosis: number;
  readonly estado: EstadoLote;
  readonly origen: string;
  readonly destinoCentroId: string;
  readonly fechaEnvio: string;
  readonly fechaRecepcion: string | null;
  readonly responsableId: string;
  readonly temperatura: string;
  readonly observacion: string;
}

export interface VacunacionSemana {
  readonly estadoId: string;
  readonly total: number;
}

export type TipoMovimiento = 'creacion' | 'actualizacion' | 'acceso' | 'eliminacion';

export interface MovimientoSistema {
  readonly id: string;
  readonly fecha: string;
  readonly actor: string;
  readonly rol: string;
  readonly tipo: TipoMovimiento;
  readonly modulo: string;
  readonly detalle: string;
  readonly entidad: string;
}

export interface BusquedaAuditada {
  readonly id: string;
  readonly fecha: string;
  readonly usuario: string;
  readonly rol: string;
  readonly filtros: string;
  readonly resultados: number;
  readonly origen: string;
}

export interface FiltrosCiudadano {
  readonly nombres: string;
  readonly apellidos: string;
  readonly cedula: string;
  readonly vacunaId: string;
  readonly edadMin: string;
  readonly edadMax: string;
  readonly examenId: string;
  readonly creadoDesde: string;
  readonly creadoHasta: string;
  readonly sexo: string;
  readonly etniaId: string;
  readonly estadoId: string;
  readonly municipioId: string;
  readonly parroquiaId: string;
}

export interface SubregionVista {
  readonly centro: CentroSalud;
  readonly estado: Estado | null;
  readonly jefe: PersonalSalud | null;
  readonly empleados: number;
  readonly centros: number;
}

export interface CentroVista {
  readonly centro: CentroSalud;
  readonly estado: Estado | null;
  readonly municipio: Municipio | null;
  readonly parroquia: Parroquia | null;
  readonly jefe: PersonalSalud | null;
  readonly empleados: number;
}

export interface PersonalVista {
  readonly personal: PersonalSalud;
  readonly centro: CentroSalud | null;
  readonly estado: Estado | null;
  readonly municipio: Municipio | null;
  readonly parroquia: Parroquia | null;
  readonly esJefe: boolean;
  readonly profesion: string;
}

export interface AltaSubregion {
  readonly nombre: string;
  readonly estadoId: string;
  readonly jefeNombre: string;
  readonly jefeCedula: string;
  readonly jefeCorreo: string;
}

export interface AltaCentro {
  readonly nombre: string;
  readonly codigo: string;
  readonly estadoId: string;
  readonly municipioId: string;
  readonly parroquiaId: string;
  readonly jefeNombre: string;
  readonly jefeCedula: string;
  readonly jefeCorreo: string;
}

export interface AltaEmpleado {
  readonly nombre: string;
  readonly cedula: string;
  readonly correo: string;
  readonly telefono: string;
  readonly profesionId: string;
  readonly centroId: string;
  readonly tipo: 'jefe' | 'trabajador';
}
