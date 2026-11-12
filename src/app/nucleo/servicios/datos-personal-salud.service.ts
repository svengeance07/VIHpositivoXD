import { computed, inject, Injectable, signal } from '@angular/core';

import {
  APLICACIONES_VACUNAS_MOCK,
  CENTRO_ACTUAL_ID,
  CENTRO_ACTUAL_NOMBRE,
  ENFERMEROS_MOCK,
  PACIENTES_CENTRO_MOCK,
  REPORTES_INCIDENCIAS_MOCK,
  VACUNAS_DISPONIBLES_CENTRO,
} from '../datos/personal-salud';
import type {
  AplicacionVacuna,
  Enfermero,
  MetricasCentroSalud,
  MetricasEnfermero,
  OpcionVacunaCentro,
  PacienteCentro,
  PerfilPersonalSalud,
  ReporteIncidenciaVacuna,
} from '../modelos/personal-salud';
import { SesionService } from './sesion.service';

const CLAVE_STORAGE_ENFERMEROS = 'vih_enfermeros_centro_v2';
const CLAVE_STORAGE_PACIENTES_PS = 'vih_pacientes_centro_v2';
const CLAVE_STORAGE_APLICACIONES_PS = 'vih_aplicaciones_centro_v2';
const CLAVE_STORAGE_REPORTES_PS = 'vih_reportes_centro_v2';

function cargarColeccion<T>(clave: string, fallback: readonly T[]): readonly T[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(clave);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // fallback
  }
  return fallback;
}

function guardarColeccion<T>(clave: string, lista: readonly T[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(clave, JSON.stringify(lista));
    }
  } catch {
    // ignorar
  }
}

/**
 * Servicio reactivo basado en Signals para la gestión de datos del Centro de Salud (/PS).
 *
 * Administra el estado en memoria para:
 * 1. Métricas operativas del centro y del personal de enfermería.
 * 2. Catálogo y gestión de enfermeros (altas y rendimiento).
 * 3. Inmunizaciones aplicadas y consulta de pacientes.
 * 4. Reportes de incidencias / efectos adversos de vacunas.
 *
 * Cuando se integre la API REST/GraphQL, los métodos internos llamarán al HttpClient
 * sin alterar la API pública expuesta a los componentes de la interfaz.
 */
@Injectable({ providedIn: 'root' })
export class DatosPersonalSaludService {
  private readonly sesion = inject(SesionService);

  /** Datos del centro activo */
  readonly centroId = CENTRO_ACTUAL_ID;
  readonly centroNombre = CENTRO_ACTUAL_NOMBRE;

  // Estado reactivo interno en Signals
  private readonly _enfermeros = signal<readonly Enfermero[]>(
    cargarColeccion(CLAVE_STORAGE_ENFERMEROS, ENFERMEROS_MOCK),
  );
  private readonly _pacientes = signal<readonly PacienteCentro[]>(
    cargarColeccion(CLAVE_STORAGE_PACIENTES_PS, PACIENTES_CENTRO_MOCK),
  );
  private readonly _aplicaciones = signal<readonly AplicacionVacuna[]>(
    cargarColeccion(CLAVE_STORAGE_APLICACIONES_PS, APLICACIONES_VACUNAS_MOCK),
  );
  private readonly _reportes = signal<readonly ReporteIncidenciaVacuna[]>(
    cargarColeccion(CLAVE_STORAGE_REPORTES_PS, REPORTES_INCIDENCIAS_MOCK),
  );

  /**
   * En el modelo de usuario único por entidad, el centro de salud opera
   * directamente con el perfil del Jefe de Centro.
   */
  readonly perfilEfectivo = computed<PerfilPersonalSalud>(() => 'jefe');

  /** Indica si la vista actual opera con permisos de Jefe del Centro */
  readonly esJefe = computed(() => true);

  /** Listas públicas de solo lectura */
  readonly enfermeros = this._enfermeros.asReadonly();
  readonly pacientes = this._pacientes.asReadonly();
  readonly aplicaciones = this._aplicaciones.asReadonly();
  readonly reportes = this._reportes.asReadonly();
  readonly vacunasDisponibles = signal<readonly OpcionVacunaCentro[]>(
    VACUNAS_DISPONIBLES_CENTRO,
  ).asReadonly();

  /** Jefe de centro asignado a la sesión actual */
  readonly enfermeroActual = computed<Enfermero>(() => {
    const sesionActual = this.sesion.sesion();
    const todos = this._enfermeros();
    const base =
      todos.find((e) => e.id === 'prof-01' || e.correo === 'jefe.centro@vih.gob.ve') ?? todos[0];

    if (sesionActual && sesionActual.rol === 2) {
      const porCorreo = todos.find((e) => e.correo === sesionActual.correo);
      if (porCorreo) return porCorreo;
      return {
        ...base,
        nombre: sesionActual.nombre || base.nombre,
        correo: sesionActual.correo || base.correo,
      };
    }

    return base;
  });

  /**
   * Métricas consolidadas del Centro de Salud (Supervisión de Jefe).
   */
  readonly metricasCentro = computed<MetricasCentroSalud>(() => {
    const apps = this._aplicaciones();
    const hoyStr = '2026-10-27'; // Fecha simulada del sistema
    const appsHoy = apps.filter((a) => a.fechaAplicacion === hoyStr);
    const activos = this._enfermeros().filter((e) => e.activo).length;
    const reportesPendientes = this._reportes().filter(
      (r) => r.estadoSubregion !== 'atendido',
    ).length;

    const dosisMenoresHoy = appsHoy.filter((a) => a.esMenor).length;
    const dosisAdultosHoy = appsHoy.length - dosisMenoresHoy;

    // Pacientes únicos atendidos hoy
    const pacientesIdsHoy = new Set(appsHoy.map((a) => a.pacienteId));

    return {
      vacunasHoy: appsHoy.length,
      vacunasSemana: apps.length,
      pacientesAtendidosHoy: pacientesIdsHoy.size,
      enfermerosActivos: activos,
      reportesActivos: reportesPendientes,
      dosisMenoresHoy,
      dosisAdultosHoy,
    };
  });

  /**
   * Métricas individuales personalizadas del Enfermero activo.
   */
  readonly metricasEnfermero = computed<MetricasEnfermero>(() => {
    const enfermero = this.enfermeroActual();
    const apps = this._aplicaciones();
    const hoyStr = '2026-10-27';

    const misApps = apps.filter((a) => a.enfermeroId === enfermero.id);
    const misAppsHoy = misApps.filter((a) => a.fechaAplicacion === hoyStr);
    const misPacientesHoy = new Set(misAppsHoy.map((a) => a.pacienteId)).size;

    return {
      misVacunasHoy: misAppsHoy.length,
      misVacunasSemana: misApps.length,
      misPacientesHoy,
      misReportesTotal: enfermero.reportesGeneradosTotal,
      turnoActual: enfermero.turno,
    };
  });

  /**
   * Últimas aplicaciones de vacunas en el centro para la tabla en vivo.
   */
  readonly ultimasAplicaciones = computed<readonly AplicacionVacuna[]>(() => {
    return [...this._aplicaciones()].reverse().slice(0, 5);
  });

  /**
   * Reportes de incidencias más recientes para alertas visuales.
   */
  readonly ultimosReportes = computed<readonly ReporteIncidenciaVacuna[]>(() => {
    return [...this._reportes()].reverse().slice(0, 3);
  });

  /**
   * Distribución de vacunas aplicadas en la jornada por categoría para barras visuales.
   */
  readonly distribucionVacunasHoy = computed(() => {
    const apps = this._aplicaciones();
    const conteo = new Map<string, number>();

    for (const app of apps) {
      const actual = conteo.get(app.vacunaNombre) ?? 0;
      conteo.set(app.vacunaNombre, actual + 1);
    }

    const total = apps.length || 1;
    return Array.from(conteo.entries()).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100),
    }));
  });

  /**
   * Mantiene compatibilidad de firma con llamadas existentes; el modo siempre es 'jefe'.
   */
  setModoManual(_modo: PerfilPersonalSalud): void {
    // No-op: en el modelo actual solo existe el usuario Jefe de Centro.
  }

  /**
   * Da de alta un nuevo perfil de enfermero en el centro de salud (Acción del Jefe).
   */
  crearEnfermero(
    datos: Omit<
      Enfermero,
      'id' | 'vacunasAplicadasTotal' | 'vacunasAplicadasHoy' | 'reportesGeneradosTotal' | 'activo'
    >,
  ): Enfermero {
    const nuevo: Enfermero = {
      ...datos,
      id: `enf-${Date.now().toString(36)}`,
      vacunasAplicadasTotal: 0,
      vacunasAplicadasHoy: 0,
      reportesGeneradosTotal: 0,
      activo: true,
    };

    this._enfermeros.update((lista) => {
      const actualizados = [nuevo, ...lista];
      guardarColeccion(CLAVE_STORAGE_ENFERMEROS, actualizados);
      return actualizados;
    });
    return nuevo;
  }

  /**
   * Alterna el estado activo/inactivo (permiso laboral) de un enfermero.
   */
  alternarEstadoEnfermero(id: string): void {
    this._enfermeros.update((lista) => {
      const actualizados = lista.map((enf) =>
        enf.id === id ? { ...enf, activo: !enf.activo } : enf,
      );
      guardarColeccion(CLAVE_STORAGE_ENFERMEROS, actualizados);
      return actualizados;
    });
  }

  /**
   * Obtiene la ficha de un enfermero por su ID.
   */
  enfermeroPorId(id: string): Enfermero | undefined {
    return this._enfermeros().find((e) => e.id === id);
  }

  /**
   * Registra un nuevo paciente en el centro de salud (Adulto o Menor).
   */
  registrarPaciente(
    paciente: Omit<PacienteCentro, 'id' | 'creadoEn' | 'centroRegistroId'>,
  ): PacienteCentro {
    const nuevo: PacienteCentro = {
      ...paciente,
      id: `pac-${Date.now().toString(36)}`,
      creadoEn: '2026-10-27',
      centroRegistroId: this.centroId,
    };

    this._pacientes.update((lista) => {
      const actualizados = [nuevo, ...lista];
      guardarColeccion(CLAVE_STORAGE_PACIENTES_PS, actualizados);
      return actualizados;
    });
    return nuevo;
  }

  /**
   * Registra la aplicación de una vacuna a un paciente.
   */
  aplicarVacuna(
    datos: Omit<AplicacionVacuna, 'id' | 'fechaAplicacion' | 'horaAplicacion' | 'centroId'>,
  ): AplicacionVacuna {
    const ahora = new Date();
    const hora = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    const nueva: AplicacionVacuna = {
      ...datos,
      id: `ap-${Date.now().toString(36)}`,
      fechaAplicacion: '2026-10-27',
      horaAplicacion: hora,
      centroId: this.centroId,
    };

    this._aplicaciones.update((lista) => {
      const actualizadas = [nueva, ...lista];
      guardarColeccion(CLAVE_STORAGE_APLICACIONES_PS, actualizadas);
      return actualizadas;
    });

    // Actualiza métricas del enfermero que la aplicó
    this._enfermeros.update((lista) => {
      const actualizados = lista.map((enf) =>
        enf.id === datos.enfermeroId
          ? {
              ...enf,
              vacunasAplicadasHoy: enf.vacunasAplicadasHoy + 1,
              vacunasAplicadasTotal: enf.vacunasAplicadasTotal + 1,
            }
          : enf,
      );
      guardarColeccion(CLAVE_STORAGE_ENFERMEROS, actualizados);
      return actualizados;
    });

    return nueva;
  }

  /**
   * Aplica una o más vacunas a un paciente en una misma sesión clínica (Punto 4).
   */
  aplicarMultiplesVacunas(
    dosisLista: readonly Omit<
      AplicacionVacuna,
      'id' | 'fechaAplicacion' | 'horaAplicacion' | 'centroId'
    >[],
  ): readonly AplicacionVacuna[] {
    return dosisLista.map((dosis) => this.aplicarVacuna(dosis));
  }

  /**
   * Obtiene el historial cronológico de vacunas aplicadas a un paciente.
   */
  aplicacionesDePaciente(pacienteId: string): readonly AplicacionVacuna[] {
    return this._aplicaciones().filter((a) => a.pacienteId === pacienteId);
  }

  /**
   * Obtiene los reportes de reacciones adversas asociados a un paciente.
   */
  reportesDePaciente(pacienteId: string): readonly ReporteIncidenciaVacuna[] {
    return this._reportes().filter((r) => r.pacienteId === pacienteId);
  }

  /**
   * Notifica un reporte de evento adverso / síntoma por vacuna hacia la subregión estadal.
   */
  registrarReporteIncidencia(
    datos: Omit<
      ReporteIncidenciaVacuna,
      'id' | 'fechaReporte' | 'horaReporte' | 'centroId' | 'estadoSubregion'
    >,
  ): ReporteIncidenciaVacuna {
    const ahora = new Date();
    const hora = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    const nuevo: ReporteIncidenciaVacuna = {
      ...datos,
      id: `rep-${Date.now().toString(36)}`,
      fechaReporte: '2026-10-27',
      horaReporte: hora,
      centroId: this.centroId,
      estadoSubregion: 'enviado',
    };

    this._reportes.update((lista) => {
      const actualizados = [nuevo, ...lista];
      guardarColeccion(CLAVE_STORAGE_REPORTES_PS, actualizados);
      return actualizados;
    });

    // Actualiza contador de reportes del enfermero
    this._enfermeros.update((lista) => {
      const actualizados = lista.map((enf) =>
        enf.id === datos.enfermeroId
          ? { ...enf, reportesGeneradosTotal: enf.reportesGeneradosTotal + 1 }
          : enf,
      );
      guardarColeccion(CLAVE_STORAGE_ENFERMEROS, actualizados);
      return actualizados;
    });

    return nuevo;
  }

  /** Reinicia el estado del centro de salud a los valores iniciales de prueba. */
  limpiarAlmacenamiento(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CLAVE_STORAGE_ENFERMEROS);
        localStorage.removeItem(CLAVE_STORAGE_PACIENTES_PS);
        localStorage.removeItem(CLAVE_STORAGE_APLICACIONES_PS);
        localStorage.removeItem(CLAVE_STORAGE_REPORTES_PS);
      }
    } catch {
      // ignorar
    }
    this._enfermeros.set(ENFERMEROS_MOCK);
    this._pacientes.set(PACIENTES_CENTRO_MOCK);
    this._aplicaciones.set(APLICACIONES_VACUNAS_MOCK);
    this._reportes.set(REPORTES_INCIDENCIAS_MOCK);
  }
}
