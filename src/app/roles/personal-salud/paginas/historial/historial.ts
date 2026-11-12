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
 * fusionando registros de `inmunizacion` y `reportes` (`example.sql`).
 */
export interface ItemHistorialAuditoria {
  tipo: 'vacuna' | 'reporte';
  id: string;
  idNumerico: number;
  fecha: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteCedula: string;
  pacienteEsMenor: boolean;
  vacunaNombre: string;
  lote: string;
  dosis?: number;
  centroNombre: string;
  profesionalNombre: string;
  detalles: string;
  subtipo?: string;
}

/**
 * Vista de Historial y Bitácora de Inmunizaciones (/PS/historial).
 *
 * Adecuada a las tablas `inmunizacion`, `vacunas`, `reportes`, `sintomas_comunes`,
 * `ciudadano_mayor_edad` y `ciudadano_menor_edad` de `docs/referencias/example.sql`.
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

  /** Filtro por pestaña de tipo de registro (`inmunizacion` vs `reportes`) */
  protected readonly tabTipo = signal<'todos' | 'vacunas' | 'reportes'>('todos');

  /** Filtro por vacuna (`vacunas.nombre_vacuna`) */
  protected readonly filtroVacuna = signal<string>('todas');

  /** Modal de comprobante / detalle de registro */
  protected readonly itemSeleccionado = signal<ItemHistorialAuditoria | null>(null);
  protected readonly modalDetalleAbierto = signal<boolean>(false);

  /** Mensaje temporal para exportación */
  protected readonly mensajeExportacion = signal<string>('');

  /** Nombre oficial del centro de salud (`centro_salud.nombre_centro`) */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);

  /** Diccionario de pacientes para verificar rápidamente si pertenecen a `ciudadano_menor_edad` */
  private readonly mapaMenores = computed(() => {
    const mapa = new Map<string, boolean>();
    for (const pac of this.datosPS.pacientes()) {
      mapa.set(pac.id, pac.esMenor);
    }
    return mapa;
  });

  /**
   * Colección adaptada de todos los registros de la tabla `inmunizacion`.
   */
  protected readonly todasLasAplicaciones = computed<ItemHistorialAuditoria[]>(() => {
    const aplicaciones = this.datosPS.aplicaciones();
    const mapaMenores = this.mapaMenores();

    return aplicaciones.map((vac: AplicacionVacuna) => ({
      tipo: 'vacuna' as const,
      id: vac.id,
      idNumerico: vac.idInmunizacion,
      fecha: vac.fechaAplicacion,
      pacienteId: vac.pacienteId,
      pacienteNombre: vac.pacienteNombre,
      pacienteCedula: vac.pacienteCedula,
      pacienteEsMenor: mapaMenores.get(vac.pacienteId) ?? vac.esMenor,
      vacunaNombre: vac.vacunaNombre,
      lote: vac.lote,
      dosis: vac.dosis,
      centroNombre: vac.centroNombre || this.datosPS.centroNombre,
      profesionalNombre: vac.enfermeroNombre,
      detalles: vac.observaciones || 'Aplicación estándar sin eventualidades.',
    }));
  });

  /**
   * Colección adaptada de todos los registros de la tabla `reportes`.
   */
  protected readonly todosLosReportes = computed<ItemHistorialAuditoria[]>(() => {
    const reportes = this.datosPS.reportes();
    const mapaMenores = this.mapaMenores();

    return reportes.map((rep: ReporteIncidenciaVacuna) => ({
      tipo: 'reporte' as const,
      id: rep.id,
      idNumerico: rep.idReporte,
      fecha: rep.fechaReporte,
      pacienteId: rep.pacienteId,
      pacienteNombre: rep.pacienteNombre,
      pacienteCedula: rep.pacienteCedula,
      pacienteEsMenor: mapaMenores.get(rep.pacienteId) ?? rep.esMenor ?? false,
      vacunaNombre: rep.vacunaNombre,
      lote: rep.lote,
      centroNombre: this.datosPS.centroNombre,
      profesionalNombre: rep.enfermeroNombre,
      detalles: `Síntomas (sintomas_comunes): ${rep.sintomas.join(', ')}. Recomendaciones: ${rep.recomendaciones}`,
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
      if (tab === 'vacunas' && item.tipo !== 'vacuna') return false;
      if (tab === 'reportes' && item.tipo !== 'reporte') return false;
      if (filtroVac !== 'todas' && item.vacunaNombre !== filtroVac) return false;
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
      `Bitácora exportada exitosamente (${cantidad} registros de inmunizacion y reportes).`,
    );
    setTimeout(() => {
      this.mensajeExportacion.set('');
    }, 4500);
  }
}
