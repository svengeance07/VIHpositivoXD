import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { ESTADOS, MUNICIPIOS, PARROQUIAS } from '../datos/master';
import {
  APLICACIONES_VACUNAS_MOCK,
  CENTRO_ACTUAL_ID,
  CENTRO_ACTUAL_INFO,
  CENTRO_ACTUAL_NOMBRE,
  ENFERMEROS_MOCK,
  PACIENTES_CENTRO_MOCK,
  REPORTES_INCIDENCIAS_MOCK,
  SINTOMAS_COMUNES_MOCK,
  SUBREGION_ACTUAL_ID,
  VACUNAS_DISPONIBLES_CENTRO,
} from '../datos/personal-salud';
import type {
  AplicacionVacuna,
  DatosCentroSalud,
  Enfermero,
  NivelGravedadReporte,
  OpcionVacunaCentro,
  PacienteCentro,
  ReporteIncidenciaVacuna,
  SintomaComun,
} from '../modelos/personal-salud';
import { SesionService } from './sesion.service';

const CLAVE_STORAGE = 'svi-personal-salud-estado-v3';
const FECHA_ACTUAL_SIMULADA = '2026-10-27';
const API_BASE_URL = 'http://localhost:3000/api/ps';

interface EstadoPersistidoPS {
  readonly enfermeros: readonly Enfermero[];
  readonly pacientes: readonly PacienteCentro[];
  readonly aplicaciones: readonly AplicacionVacuna[];
  readonly reportes: readonly ReporteIncidenciaVacuna[];
  readonly vacunasDisponibles?: readonly OpcionVacunaCentro[];
}

interface ContextoMySQLResponse {
  readonly centroInfo?: DatosCentroSalud;
  readonly enfermeros?: readonly Enfermero[];
  readonly pacientes?: readonly PacienteCentro[];
  readonly aplicaciones?: readonly AplicacionVacuna[];
  readonly reportes?: readonly ReporteIncidenciaVacuna[];
  readonly vacunasDisponibles?: readonly OpcionVacunaCentro[];
  readonly sintomasComunes?: readonly SintomaComun[];
}

/**
 * Servicio de datos reactivo para el módulo de Centro de Salud (/PS).
 *
 * Se conecta al backend Express + MySQL (`vacunas` en `localhost:3306`) a través de
 * `http://localhost:3000/api/ps` y mantiene respaldo reactivo con Signals para pruebas unitarias.
 */
@Injectable({ providedIn: 'root' })
export class DatosPersonalSaludService {
  private readonly sesion = inject(SesionService);
  private readonly http = inject(HttpClient, { optional: true });

  private readonly _enfermeros = signal<readonly Enfermero[]>(ENFERMEROS_MOCK);
  private readonly _pacientes = signal<readonly PacienteCentro[]>(PACIENTES_CENTRO_MOCK);
  private readonly _aplicaciones = signal<readonly AplicacionVacuna[]>(APLICACIONES_VACUNAS_MOCK);
  private readonly _reportes =
    signal<readonly ReporteIncidenciaVacuna[]>(REPORTES_INCIDENCIAS_MOCK);
  private readonly _vacunasDisponibles = signal<readonly OpcionVacunaCentro[]>(
    VACUNAS_DISPONIBLES_CENTRO,
  );
  private readonly _sintomasComunes = signal<readonly SintomaComun[]>(SINTOMAS_COMUNES_MOCK);

  /** Estado de conexión en vivo con la base de datos MySQL (`vacunas`). */
  private readonly _conectadoMySQL = signal<boolean>(false);
  readonly conectadoMySQL = this._conectadoMySQL.asReadonly();

  readonly centroId = CENTRO_ACTUAL_ID;
  readonly centroNombre = CENTRO_ACTUAL_NOMBRE;
  readonly centroInfo: DatosCentroSalud = CENTRO_ACTUAL_INFO;
  readonly subregionId = SUBREGION_ACTUAL_ID;

  readonly estados = signal(ESTADOS).asReadonly();
  readonly municipios = signal(MUNICIPIOS).asReadonly();
  readonly parroquias = signal(PARROQUIAS).asReadonly();

  readonly enfermeros = this._enfermeros.asReadonly();
  readonly pacientes = this._pacientes.asReadonly();
  readonly aplicaciones = this._aplicaciones.asReadonly();
  readonly reportes = this._reportes.asReadonly();
  readonly vacunasDisponibles = this._vacunasDisponibles.asReadonly();
  readonly sintomasComunes = this._sintomasComunes.asReadonly();

  readonly perfilEfectivo = computed<'jefe' | 'enfermero'>(() => 'jefe');
  readonly esJefe = computed(() => true);

  /**
   * Obtiene los datos del Jefe de Centro autenticado (`autoridades` en `example.sql`).
   */
  readonly enfermeroActual = computed<Enfermero>(() => {
    const s = this.sesion.sesion();
    const lista = this._enfermeros();
    if (s) {
      const encontrado = lista.find((e) => e.correo.toLowerCase() === s.correo.toLowerCase());
      if (encontrado) return encontrado;
    }
    return lista[0];
  });

  /**
   * Métricas globales del Centro de Salud.
   */
  readonly metricasCentro = computed(() => {
    const aplicaciones = this._aplicaciones();
    const enfermeros = this._enfermeros();
    const reportes = this._reportes();

    const aplicacionesHoy = aplicaciones.filter((a) => a.fechaAplicacion === FECHA_ACTUAL_SIMULADA);
    const pacientesHoyIds = new Set(aplicacionesHoy.map((a) => a.pacienteId));

    const enfermerosActivos = enfermeros.filter((e) => e.activo).length;
    const totalHistoricoCentro = enfermeros.reduce((acc, e) => acc + e.vacunasAplicadasTotal, 0);

    const dosisMenoresHoy = aplicacionesHoy.filter((a) => a.esMenor).length;
    const dosisAdultosHoy = aplicacionesHoy.filter((a) => !a.esMenor).length;

    return {
      vacunasHoy: aplicacionesHoy.length,
      vacunasSemana: aplicaciones.length + 34,
      vacunasTotalCentro: totalHistoricoCentro,
      pacientesAtendidosHoy: pacientesHoyIds.size,
      enfermerosActivos,
      enfermerosTotal: enfermeros.length,
      reportesActivos: reportes.length,
      reportesPendientesSubregion: reportes.filter((r) => r.estadoSubregion !== 'atendido').length,
      dosisMenoresHoy,
      dosisAdultosHoy,
    };
  });

  /**
   * Métricas específicas del Jefe de Centro en sesión.
   */
  readonly metricasEnfermero = computed(() => {
    const enf = this.enfermeroActual();
    const misAplicaciones = this._aplicaciones().filter((a) => a.enfermeroId === enf.id);
    const misAplicacionesHoy = misAplicaciones.filter(
      (a) => a.fechaAplicacion === FECHA_ACTUAL_SIMULADA,
    );
    const misPacientesHoy = new Set(misAplicacionesHoy.map((a) => a.pacienteId)).size;
    const misReportes = this._reportes().filter((r) => r.enfermeroId === enf.id);

    return {
      misVacunasHoy: misAplicacionesHoy.length,
      misVacunasTotal: enf.vacunasAplicadasTotal,
      misPacientesHoy,
      misReportesTotal: misReportes.length,
      ultimasAplicacionesMias: misAplicaciones.slice(0, 6),
    };
  });

  /**
   * Distribución de biológicos aplicados recientemente.
   */
  readonly distribucionVacunas = computed(() => {
    const conteo = new Map<string, number>();
    for (const app of this._aplicaciones()) {
      conteo.set(app.vacunaNombre, (conteo.get(app.vacunaNombre) ?? 0) + 1);
    }
    const total = this._aplicaciones().length || 1;
    return Array.from(conteo.entries())
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        porcentaje: Math.round((cantidad / total) * 100),
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  readonly ultimasAplicaciones = computed(() => this._aplicaciones().slice(0, 8));

  constructor() {
    this.cargarDesdeStorage();
    this.sincronizarDesdeMySQL();
  }

  /**
   * Consulta el estado real desde el servidor Express conectado a MySQL (`vacunas`).
   */
  sincronizarDesdeMySQL(): void {
    if (!this.http) return;

    this.http.get<ContextoMySQLResponse>(`${API_BASE_URL}/contexto`).subscribe({
      next: (res) => {
        this._conectadoMySQL.set(true);
        if (Array.isArray(res.enfermeros) && res.enfermeros.length > 0) {
          this._enfermeros.set(res.enfermeros);
        }
        if (Array.isArray(res.pacientes) && res.pacientes.length > 0) {
          this._pacientes.set(res.pacientes);
        }
        if (Array.isArray(res.aplicaciones) && res.aplicaciones.length > 0) {
          this._aplicaciones.set(res.aplicaciones);
        }
        if (Array.isArray(res.reportes) && res.reportes.length > 0) {
          this._reportes.set(res.reportes);
        }
        if (Array.isArray(res.vacunasDisponibles) && res.vacunasDisponibles.length > 0) {
          this._vacunasDisponibles.set(res.vacunasDisponibles);
        }
        if (Array.isArray(res.sintomasComunes) && res.sintomasComunes.length > 0) {
          this._sintomasComunes.set(res.sintomasComunes);
        }
        this.guardarEnStorage();
      },
      error: () => {
        this._conectadoMySQL.set(false);
      },
    });
  }

  buscarPacientesPorCedulaONombre(termino: string): readonly PacienteCentro[] {
    const limpio = this.normalizar(termino);
    if (!limpio) return this._pacientes();

    const soloDigitos = limpio.replace(/\./g, '');

    return this._pacientes().filter((p) => {
      const cedulaNorm = this.normalizar(p.cedula ?? '').replace(/\./g, '');
      const idMenorNorm = this.normalizar(`id-${p.idRegistro}`);
      const nombreNorm = this.normalizar(p.nombre);

      return (
        (cedulaNorm && cedulaNorm.includes(soloDigitos)) ||
        idMenorNorm.includes(limpio) ||
        String(p.idRegistro) === soloDigitos ||
        nombreNorm.includes(limpio)
      );
    });
  }

  aplicacionesDePaciente(pacienteId: string): readonly AplicacionVacuna[] {
    return this._aplicaciones().filter((a) => a.pacienteId === pacienteId);
  }

  reportesDePaciente(pacienteId: string): readonly ReporteIncidenciaVacuna[] {
    return this._reportes().filter((r) => r.pacienteId === pacienteId);
  }

  /**
   * Registra un nuevo paciente y lo inserta en MySQL (`ciudadano_mayor_edad` o `ciudadano_menor_edad`).
   */
  registrarPaciente(
    datos: Omit<PacienteCentro, 'id' | 'idRegistro' | 'fechaRegistro'> & {
      idRegistro?: number;
    },
  ): PacienteCentro {
    const maxIdActual = this._pacientes()
      .filter((p) => p.esMenor === datos.esMenor)
      .reduce((max, p) => Math.max(max, p.idRegistro), datos.esMenor ? 200 : 100);
    const idRegistroLocal = datos.idRegistro ?? maxIdActual + 1;
    const idLocal = `${datos.esMenor ? 'menor' : 'mayor'}-${idRegistroLocal}`;

    const nuevo: PacienteCentro = {
      ...datos,
      id: idLocal,
      idRegistro: idRegistroLocal,
      fechaRegistro: FECHA_ACTUAL_SIMULADA,
    };

    this._pacientes.update((lista) => [nuevo, ...lista]);
    this.guardarEnStorage();

    if (this.http) {
      this.http
        .post<{ id: string; idRegistro: number }>(`${API_BASE_URL}/pacientes`, nuevo)
        .subscribe({
          next: () => this.sincronizarDesdeMySQL(),
          error: () => {
            // Mantiene el registro local si el backend no está activo
          },
        });
    }

    return nuevo;
  }

  /**
   * Registra una nueva vacuna en el catálogo `vacunas` (`nombre_vacuna`, `cantidad_dosis`) y la inserta en MySQL.
   */
  registrarVacuna(datos: {
    nombre: string;
    dosisMaximas: number;
    loteInicial?: string;
  }): OpcionVacunaCentro {
    const nombreLimpio = datos.nombre.trim().slice(0, 100);
    const existente = this._vacunasDisponibles().find(
      (v) => v.nombre.toLowerCase() === nombreLimpio.toLowerCase(),
    );
    if (existente) {
      return existente;
    }

    const maxVacId = this._vacunasDisponibles().reduce((max, v) => Math.max(max, v.idVacuna), 0);
    const nuevoIdVacuna = maxVacId + 1;
    const prefijo = nombreLimpio
      .slice(0, 4)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'V');
    const lotePersonalizado = (datos.loteInicial ?? '').trim().toUpperCase().slice(0, 10);
    const lotesDisponibles = lotePersonalizado
      ? [lotePersonalizado, `${prefijo}-261${nuevoIdVacuna}`]
      : [`${prefijo}-260${nuevoIdVacuna}`, `${prefijo}-261${nuevoIdVacuna}`];

    const nuevaVacuna: OpcionVacunaCentro = {
      id: `vac-${nuevoIdVacuna}`,
      idVacuna: nuevoIdVacuna,
      nombre: nombreLimpio,
      dosisMaximas: Math.max(1, Math.min(10, Math.round(datos.dosisMaximas || 1))),
      lotesDisponibles,
    };

    this._vacunasDisponibles.update((lista) => [...lista, nuevaVacuna]);
    this.guardarEnStorage();

    if (this.http) {
      this.http
        .post<OpcionVacunaCentro>(`${API_BASE_URL}/vacunas`, {
          nombre: nuevaVacuna.nombre,
          dosisMaximas: nuevaVacuna.dosisMaximas,
          loteInicial: lotePersonalizado || undefined,
        })
        .subscribe({
          next: () => this.sincronizarDesdeMySQL(),
          error: () => {
            // Mantiene el registro local si el backend no está activo
          },
        });
    }

    return nuevaVacuna;
  }

  /**
   * Aplica una vacuna y la inserta en MySQL (`inmunizacion`).
   */
  aplicarVacuna(datos: {
    pacienteId: string;
    pacienteCedula: string;
    pacienteNombre: string;
    esMenor: boolean;
    vacunaId: string;
    vacunaNombre: string;
    dosis: number;
    lote: string;
    fechaAplicacion?: string;
    enfermeroId: string;
    enfermeroNombre: string;
    centroNombre?: string;
    observaciones?: string;
  }): AplicacionVacuna {
    const id = `app-${Date.now().toString().slice(-5)}`;
    const maxInmId = this._aplicaciones().reduce((max, a) => Math.max(max, a.idInmunizacion), 100);
    const paciente = this._pacientes().find((p) => p.id === datos.pacienteId);

    const nuevaAplicacion: AplicacionVacuna = {
      id,
      idInmunizacion: maxInmId + 1,
      pacienteId: datos.pacienteId,
      ciudadanoMayorId: !datos.esMenor ? (paciente?.idRegistro ?? 101) : undefined,
      ciudadanoMenorId: datos.esMenor ? (paciente?.idRegistro ?? 201) : undefined,
      pacienteCedula: datos.pacienteCedula,
      pacienteNombre: datos.pacienteNombre,
      esMenor: datos.esMenor,
      vacunaId: datos.vacunaId,
      vacunaNombre: datos.vacunaNombre,
      dosis: datos.dosis,
      lote: datos.lote.slice(0, 30),
      fechaAplicacion: datos.fechaAplicacion || FECHA_ACTUAL_SIMULADA,
      enfermeroId: datos.enfermeroId,
      enfermeroNombre: datos.enfermeroNombre,
      centroId: CENTRO_ACTUAL_ID,
      centroNombre: datos.centroNombre?.trim() || CENTRO_ACTUAL_NOMBRE,
      observaciones: datos.observaciones?.trim() || 'Dosis aplicada sin eventualidades.',
    };

    this._aplicaciones.update((lista) => [nuevaAplicacion, ...lista]);

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

    this.guardarEnStorage();

    if (this.http) {
      this.http.post(`${API_BASE_URL}/inmunizaciones`, nuevaAplicacion).subscribe({
        next: () => this.sincronizarDesdeMySQL(),
        error: () => {
          // Mantiene el registro local si el backend no está activo
        },
      });
    }

    return nuevaAplicacion;
  }

  /**
   * Registra un reporte en `reportes` y lo inserta en MySQL.
   */
  registrarReporteIncidencia(datos: {
    inmunizacionId?: string;
    pacienteId: string;
    pacienteCedula: string;
    pacienteNombre: string;
    vacunaId: string;
    vacunaNombre: string;
    lote: string;
    fechaAplicacion: string;
    sintomas: readonly string[];
    recomendaciones?: string;
    indicacionesDictadas?: string;
    gravedad: NivelGravedadReporte;
    enfermeroId: string;
    enfermeroNombre: string;
    subregionDestinoId?: string;
  }): ReporteIncidenciaVacuna {
    const id = `rep-${Date.now().toString().slice(-5)}`;
    const maxRepId = this._reportes().reduce((max, r) => Math.max(max, r.idReporte), 0);
    const paciente = this._pacientes().find((p) => p.id === datos.pacienteId);
    const esMenor = paciente?.esMenor ?? false;
    const textoRecomendaciones = (datos.recomendaciones ?? datos.indicacionesDictadas ?? '').trim();

    const nuevoReporte: ReporteIncidenciaVacuna = {
      id,
      idReporte: maxRepId + 1,
      inmunizacionId: datos.inmunizacionId || 'app-101',
      pacienteId: datos.pacienteId,
      ciudadanoMayorId: !esMenor ? (paciente?.idRegistro ?? 101) : null,
      ciudadanoMenorId: esMenor ? (paciente?.idRegistro ?? 201) : null,
      esMenor,
      pacienteCedula: datos.pacienteCedula,
      pacienteNombre: datos.pacienteNombre,
      vacunaId: datos.vacunaId,
      vacunaNombre: datos.vacunaNombre,
      lote: datos.lote,
      fechaAplicacion: datos.fechaAplicacion,
      sintomas: datos.sintomas,
      recomendaciones: textoRecomendaciones,
      indicacionesDictadas: textoRecomendaciones,
      gravedad: datos.gravedad,
      fechaReporte: FECHA_ACTUAL_SIMULADA,
      enfermeroId: datos.enfermeroId,
      enfermeroNombre: datos.enfermeroNombre,
      centroId: CENTRO_ACTUAL_ID,
      subregionDestinoId: datos.subregionDestinoId ?? SUBREGION_ACTUAL_ID,
      estadoSubregion: 'enviado',
    };

    this._reportes.update((lista) => [nuevoReporte, ...lista]);
    this.guardarEnStorage();

    if (this.http) {
      this.http.post(`${API_BASE_URL}/reportes`, nuevoReporte).subscribe({
        next: () => this.sincronizarDesdeMySQL(),
        error: () => {
          // Mantiene el registro local si el backend no está activo
        },
      });
    }

    return nuevoReporte;
  }

  limpiarAlmacenamiento(): void {
    try {
      localStorage.removeItem(CLAVE_STORAGE);
    } catch {
      // Ignorado en entornos sin localStorage
    }
    this._enfermeros.set(ENFERMEROS_MOCK);
    this._pacientes.set(PACIENTES_CENTRO_MOCK);
    this._aplicaciones.set(APLICACIONES_VACUNAS_MOCK);
    this._reportes.set(REPORTES_INCIDENCIAS_MOCK);
    this._vacunasDisponibles.set(VACUNAS_DISPONIBLES_CENTRO);
  }

  private cargarDesdeStorage(): void {
    try {
      const crudo = localStorage.getItem(CLAVE_STORAGE);
      if (!crudo) return;
      const datos = JSON.parse(crudo) as Partial<EstadoPersistidoPS>;
      if (Array.isArray(datos.enfermeros) && datos.enfermeros.length > 0) {
        this._enfermeros.set(datos.enfermeros);
      }
      if (Array.isArray(datos.pacientes) && datos.pacientes.length > 0) {
        this._pacientes.set(datos.pacientes);
      }
      if (Array.isArray(datos.aplicaciones) && datos.aplicaciones.length > 0) {
        this._aplicaciones.set(datos.aplicaciones);
      }
      if (Array.isArray(datos.reportes) && datos.reportes.length > 0) {
        this._reportes.set(datos.reportes);
      }
      if (Array.isArray(datos.vacunasDisponibles) && datos.vacunasDisponibles.length > 0) {
        this._vacunasDisponibles.set(datos.vacunasDisponibles);
      }
    } catch {
      // Ignorado si el JSON es inválido
    }
  }

  private guardarEnStorage(): void {
    try {
      const estado: EstadoPersistidoPS = {
        enfermeros: this._enfermeros(),
        pacientes: this._pacientes(),
        aplicaciones: this._aplicaciones(),
        reportes: this._reportes(),
        vacunasDisponibles: this._vacunasDisponibles(),
      };
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
    } catch {
      // Ignorado si localStorage no está disponible
    }
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
