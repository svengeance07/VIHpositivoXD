import { UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import type {
  AplicacionVacuna,
  ReporteIncidenciaVacuna,
} from '../../../../nucleo/modelos/personal-salud';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/**
 * Representa una entrada en la bitácora unificada de historial,
 * permitiendo fusionar aplicaciones de biológicos y reportes ESAVI.
 */
export interface ItemHistorialAuditoria {
  tipo: 'vacuna' | 'reporte';
  id: string;
  fecha: string;
  hora?: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteCedula: string;
  pacienteEsMenor: boolean;
  vacunaNombre: string;
  lote: string;
  dosis?: number;
  profesionalNombre: string;
  detalles: string;
  subtipo?: string; // Para severidad en reportes ('leve', 'moderado', 'severo')
}

/**
 * ====================================================================
 * Vista de Historial y Bitácora de Inmunizaciones (/PS/historial)
 * ====================================================================
 * Satisface el requerimiento:
 * "6. DEJAR REGISTRO/HISTORIAL DE TODAS LAS VACUNAS Y REPORTES"
 *
 * Funcionalidades clave:
 * 1. Cronología unificada de todas las dosis aplicadas en el centro.
 * 2. Visualización integrada de reportes de reacciones adversas (ESAVI).
 * 3. Filtrado por tipo de evento, vacuna específica, enfermero y texto.
 * 4. Modal de detalle con comprobante de vacunación oficial y folio.
 * 5. KPIs históricos de rendimiento epidemiológico del centro de salud.
 */
@Component({
  selector: 'app-personal-salud-historial',
  imports: [FormsModule, UpperCasePipe, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class PersonalSaludHistorial {
  protected readonly datosPS = inject(DatosPersonalSaludService);

  /** Filtro de búsqueda textual en vivo */
  protected readonly busqueda = signal<string>('');

  /** Filtro por pestaña de tipo de registro */
  protected readonly tabTipo = signal<'todos' | 'vacunas' | 'reportes'>('todos');

  /** Filtro por biológico / vacuna */
  protected readonly filtroVacuna = signal<string>('todas');

  /** Modal de comprobante / detalle de registro */
  protected readonly itemSeleccionado = signal<ItemHistorialAuditoria | null>(null);
  protected readonly modalDetalleAbierto = signal<boolean>(false);

  /** Mensaje temporal para exportación */
  protected readonly mensajeExportacion = signal<string>('');

  /** Nombre oficial del centro de salud */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);

  /** Diccionario de pacientes para verificar rápidamente si son menores de edad */
  private readonly mapaMenores = computed(() => {
    const mapa = new Map<string, boolean>();
    for (const pac of this.datosPS.pacientes()) {
      mapa.set(pac.id, pac.esMenor);
    }
    return mapa;
  });

  /**
   * Colección adaptada y enriquecida de todas las dosis aplicadas en el centro.
   */
  protected readonly todasLasAplicaciones = computed<ItemHistorialAuditoria[]>(() => {
    const aplicaciones = this.datosPS.aplicaciones();
    const mapaMenores = this.mapaMenores();

    return aplicaciones.map((vac: AplicacionVacuna) => ({
      tipo: 'vacuna' as const,
      id: vac.id,
      fecha: vac.fechaAplicacion,
      pacienteId: vac.pacienteId,
      pacienteNombre: vac.pacienteNombre,
      pacienteCedula: vac.pacienteCedula,
      pacienteEsMenor: mapaMenores.get(vac.pacienteId) ?? false,
      vacunaNombre: vac.vacunaNombre,
      lote: vac.lote,
      dosis: vac.dosis,
      profesionalNombre: vac.enfermeroNombre,
      detalles: vac.observaciones || 'Aplicación intramuscular estándar sin eventualidades.',
    }));
  });

  /**
   * Colección adaptada de todos los reportes de incidentes / eventos adversos.
   */
  protected readonly todosLosReportes = computed<ItemHistorialAuditoria[]>(() => {
    const reportes = this.datosPS.reportes();
    const mapaMenores = this.mapaMenores();

    return reportes.map((rep: ReporteIncidenciaVacuna) => ({
      tipo: 'reporte' as const,
      id: rep.id,
      fecha: rep.fechaReporte,
      hora: rep.horaReporte,
      pacienteId: rep.pacienteId,
      pacienteNombre: rep.pacienteNombre,
      pacienteCedula: rep.pacienteCedula,
      pacienteEsMenor: mapaMenores.get(rep.pacienteId) ?? false,
      vacunaNombre: rep.vacunaNombre,
      lote: rep.lote,
      profesionalNombre: rep.enfermeroNombre,
      detalles: `Síntomas: ${rep.sintomas.join(', ')}. Indicaciones: ${rep.indicacionesDictadas}`,
      subtipo: rep.gravedad,
    }));
  });

  /**
   * Cronología total unificada y clasificada en orden cronológico descendente.
   */
  protected readonly cronologiaCompleta = computed<ItemHistorialAuditoria[]>(() => {
    const todos = [...this.todasLasAplicaciones(), ...this.todosLosReportes()];
    return todos.sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  /**
   * Catálogo de vacunas únicas disponibles en el historial para el selector de filtro.
   */
  protected readonly vacunasEnHistorial = computed<string[]>(() => {
    const setVacunas = new Set<string>();
    this.cronologiaCompleta().forEach((item) => setVacunas.add(item.vacunaNombre));
    return Array.from(setVacunas).sort();
  });

  /**
   * Métricas estadísticas agregadas del historial del centro de salud.
   */
  protected readonly metricasHistorial = computed(() => {
    const aplicaciones = this.todasLasAplicaciones();
    const reportes = this.todosLosReportes();
    const pacientes = this.datosPS.pacientes();

    const lotesUnicos = new Set(aplicaciones.map((a) => a.lote)).size;
    const tasaIncidencia =
      aplicaciones.length > 0 ? ((reportes.length / aplicaciones.length) * 100).toFixed(1) : '0.0';

    return {
      totalDosis: aplicaciones.length,
      totalReportes: reportes.length,
      totalPacientes: pacientes.length,
      lotesUtilizados: lotesUnicos,
      tasaIncidencia,
    };
  });

  /**
   * Filtro reactivo aplicado sobre la bitácora según el tab, vacuna y término de búsqueda.
   */
  protected readonly historialFiltrado = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const tab = this.tabTipo();
    const filtroVac = this.filtroVacuna();

    return this.cronologiaCompleta().filter((item) => {
      // 1. Filtro de tab
      if (tab === 'vacunas' && item.tipo !== 'vacuna') return false;
      if (tab === 'reportes' && item.tipo !== 'reporte') return false;

      // 2. Filtro de vacuna
      if (filtroVac !== 'todas' && item.vacunaNombre !== filtroVac) return false;

      // 3. Búsqueda por texto
      if (!q) return true;

      const coincidePaciente =
        item.pacienteNombre.toLowerCase().includes(q) ||
        (item.pacienteCedula ? item.pacienteCedula.toLowerCase().includes(q) : false);
      const coincideVacuna =
        item.vacunaNombre.toLowerCase().includes(q) || item.lote.toLowerCase().includes(q);
      const coincideProfesional = item.profesionalNombre.toLowerCase().includes(q);
      const coincideDetalles = item.detalles.toLowerCase().includes(q);

      return coincidePaciente || coincideVacuna || coincideProfesional || coincideDetalles;
    });
  });

  /**
   * Abre el modal de detalle para un registro seleccionado.
   */
  protected abrirDetalle(item: ItemHistorialAuditoria): void {
    this.itemSeleccionado.set(item);
    this.modalDetalleAbierto.set(true);
  }

  /**
   * Cierra el modal de detalle.
   */
  protected cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.itemSeleccionado.set(null);
  }

  /**
   * Restablece los filtros aplicados a su estado inicial.
   */
  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.tabTipo.set('todos');
    this.filtroVacuna.set('todas');
  }

  /**
   * Simula la exportación de la bitácora clínica para informes sanitarios.
   */
  protected exportarBitacora(): void {
    const cantidad = this.historialFiltrado().length;
    this.mensajeExportacion.set(
      `Bitácora exportada exitosamente (${cantidad} registros en formato oficial MPPS/SVI).`,
    );
    setTimeout(() => {
      this.mensajeExportacion.set('');
    }, 4500);
  }
}
