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

const CLAVE_STORAGE_ENFERMEROS = 'vih_enfermeros_centro_v1';

function cargarEnfermeros(): readonly Enfermero[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CLAVE_STORAGE_ENFERMEROS);
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
  return ENFERMEROS_MOCK;
}

function guardarEnfermeros(lista: readonly Enfermero[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_STORAGE_ENFERMEROS, JSON.stringify(lista));
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
  private readonly _enfermeros = signal<readonly Enfermero[]>(cargarEnfermeros());
  private readonly _pacientes = signal<readonly PacienteCentro[]>(PACIENTES_CENTRO_MOCK);
  private readonly _aplicaciones = signal<readonly AplicacionVacuna[]>(APLICACIONES_VACUNAS_MOCK);
  private readonly _reportes =
    signal<readonly ReporteIncidenciaVacuna[]>(REPORTES_INCIDENCIAS_MOCK);

  /**
   * Selector manual de modo de vista (Jefe vs Enfermero).
   * Permite alternar la perspectiva en la UI instantáneamente para pruebas de desarrollo.
   */
  private readonly _modoManual = signal<PerfilPersonalSalud | null>(null);

  /**
   * Determina el rol operativo efectivo en curso:
   * Prioridad: modo manual de prueba > sesión activa simulada > fallback 'jefe'.
   */
  readonly perfilEfectivo = computed<PerfilPersonalSalud>(() => {
    const modo = this._modoManual();
    if (modo) return modo;

    const sesionActual = this.sesion.sesion();
    if (sesionActual?.perfil?.tipo === 'trabajador') {
      return 'enfermero';
    }
    return 'jefe';
  });

  /** Indica si la vista actual opera con permisos de Jefe del Centro */
  readonly esJefe = computed(() => this.perfilEfectivo() === 'jefe');

  /** Listas públicas de solo lectura */
  readonly enfermeros = this._enfermeros.asReadonly();
  readonly pacientes = this._pacientes.asReadonly();
  readonly aplicaciones = this._aplicaciones.asReadonly();
  readonly reportes = this._reportes.asReadonly();
  readonly vacunasDisponibles = signal<readonly OpcionVacunaCentro[]>(
    VACUNAS_DISPONIBLES_CENTRO,
  ).asReadonly();

  /** Profesional de salud asignado a la sesión actual (Dra. María Pérez si es perfil Jefe, o el enfermero autenticado) */
  readonly enfermeroActual = computed<Enfermero>(() => {
    const sesionActual = this.sesion.sesion();
    const esJefe = this.esJefe();
    const todos = this._enfermeros();

    // 1. Si la sesión activa es de perfil Jefe (o modo jefe activo)
    if (esJefe || sesionActual?.perfil?.tipo === 'jefe') {
      const jefe = todos.find(
        (e) =>
          e.id === 'prof-01' ||
          e.correo === 'jefe.centro@vih.gob.ve' ||
          e.nombre.toLowerCase().includes('maría'),
      );
      if (jefe) return jefe;
    }

    // 2. Si hay un usuario logueado con perfil específico (ej: Enf. Luis Gómez u otro)
    const perfilSesion = sesionActual?.perfil;
    if (perfilSesion) {
      const porId = todos.find((e) => e.id === perfilSesion.id);
      if (porId) return porId;

      const nombreSesion = perfilSesion.nombre.toLowerCase();
      if (nombreSesion) {
        const encontrado = todos.find(
          (e) =>
            e.nombre.toLowerCase().includes(nombreSesion) ||
            nombreSesion.includes(e.nombre.toLowerCase()),
        );
        if (encontrado) return encontrado;
      }
    }

    // 3. Fallback: Si no es jefe, busca al primer enfermero operativo
    if (!esJefe) {
      const enfermero = todos.find((e) => e.id === 'enf-01' || !e.nombre.startsWith('Dra.'));
      if (enfermero) return enfermero;
    }

    return todos.find((e) => e.activo) ?? todos[0];
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
    const misReportes = this._reportes().filter((r) => r.enfermeroId === enfermero.id).length;

    return {
      misVacunasHoy: misAppsHoy.length,
      misVacunasSemana: misApps.length,
      misPacientesHoy,
      misReportesTotal: misReportes,
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
   * Cambia el modo manual de prueba entre 'jefe' y 'enfermero'.
   */
  setModoManual(modo: PerfilPersonalSalud): void {
    this._modoManual.set(modo);
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
      guardarEnfermeros(actualizados);
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
      guardarEnfermeros(actualizados);
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

    this._pacientes.update((lista) => [nuevo, ...lista]);
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

    this._aplicaciones.update((lista) => [nueva, ...lista]);

    // Actualiza métricas del enfermero que la aplicó
    this._enfermeros.update((lista) =>
      lista.map((enf) =>
        enf.id === datos.enfermeroId
          ? {
              ...enf,
              vacunasAplicadasHoy: enf.vacunasAplicadasHoy + 1,
              vacunasAplicadasTotal: enf.vacunasAplicadasTotal + 1,
            }
          : enf,
      ),
    );

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

    this._reportes.update((lista) => [nuevo, ...lista]);

    // Actualiza contador de reportes del enfermero
    this._enfermeros.update((lista) =>
      lista.map((enf) =>
        enf.id === datos.enfermeroId
          ? { ...enf, reportesGeneradosTotal: enf.reportesGeneradosTotal + 1 }
          : enf,
      ),
    );

    return nuevo;
  }
}
