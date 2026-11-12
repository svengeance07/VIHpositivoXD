import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SUBREGION_ACTUAL_ID } from '../../../../nucleo/datos/personal-salud';
import type {
  NivelGravedadReporte,
  ReporteIncidenciaVacuna,
} from '../../../../nucleo/modelos/personal-salud';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/**
 * Modelo del formulario para registrar un reporte en la tabla `reportes`
 * junto con `sintomas_comunes` (`docs/referencias/example.sql`).
 */
interface FormNuevoReporte {
  pacienteId: string;
  inmunizacionId: string;
  vacunaId: string;
  vacunaNombre: string;
  lote: string;
  fechaAplicacion: string;
  sintomasSeleccionados: string[];
  otroSintoma: string;
  recomendaciones: string;
  gravedad: NivelGravedadReporte;
}

const FORM_REPORTE_INICIAL: FormNuevoReporte = {
  pacienteId: '',
  inmunizacionId: '',
  vacunaId: '',
  vacunaNombre: '',
  lote: '',
  fechaAplicacion: '2026-10-27',
  sintomasSeleccionados: [],
  otroSintoma: '',
  recomendaciones: '',
  gravedad: 'leve',
};

/**
 * Vista de Registro y Gestión de Reportes de Incidencias ESAVI (/PS/reportes).
 *
 * Adecuada a las tablas `reportes` (`id_reportes`, `nivel_gravedad`, `recomendaciones`,
 * `inmunizacion_id`, `ciudadano_mayor_id`, `ciudadano_menor_id`) y `sintomas_comunes`
 * (`id_sintoma`, `descripcion_sintoma`) de `docs/referencias/example.sql`.
 */
@Component({
  selector: 'app-personal-salud-reportes',
  imports: [FormsModule, TitleCasePipe, UpperCasePipe, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class PersonalSaludReportes {
  protected readonly datosPS = inject(DatosPersonalSaludService);

  /** Datos del centro y catálogo `sintomas_comunes` */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly enfermeroActual = this.datosPS.enfermeroActual;
  protected readonly sintomasComunes = this.datosPS.sintomasComunes;

  /** Filtros de búsqueda */
  protected readonly busqueda = signal('');
  protected readonly filtroGravedad = signal<NivelGravedadReporte | 'todas'>('todas');
  protected readonly filtroEstado = signal<'todos' | 'enviado' | 'en_revision' | 'atendido'>(
    'todos',
  );

  /** Estados de modales */
  protected readonly modalCrearAbierto = signal(false);
  protected readonly modalDetalleAbierto = signal(false);
  protected readonly reporteSeleccionado = signal<ReporteIncidenciaVacuna | null>(null);

  /** Estado del formulario de nuevo reporte */
  protected readonly form = signal<FormNuevoReporte>({ ...FORM_REPORTE_INICIAL });
  protected readonly errorFormulario = signal('');
  protected readonly mensajeExito = signal('');

  /**
   * Registros `inmunizacion` previos aplicados al paciente elegido en el formulario modal.
   */
  protected readonly vacunasDelPacienteElegido = computed(() => {
    const pId = this.form().pacienteId;
    if (!pId) return [];
    return this.datosPS.aplicacionesDePaciente(pId);
  });

  /**
   * Datos del paciente seleccionado en el formulario modal (`ciudadano_mayor_edad` o `ciudadano_menor_edad`).
   */
  protected readonly pacienteElegido = computed(() => {
    const pId = this.form().pacienteId;
    if (!pId) return null;
    return this.datosPS.pacientes().find((p) => p.id === pId) ?? null;
  });

  /**
   * Métricas de vigilancia epidemiológica del centro de salud.
   */
  protected readonly metricasReportes = computed(() => {
    const lista = this.datosPS.reportes();
    const leves = lista.filter((r) => r.gravedad === 'leve').length;
    const moderados = lista.filter((r) => r.gravedad === 'moderado').length;
    const severos = lista.filter((r) => r.gravedad === 'severo').length;
    const enviadosSubregion = lista.filter((r) => r.estadoSubregion === 'enviado').length;
    const atendidos = lista.filter((r) => r.estadoSubregion === 'atendido').length;

    return {
      total: lista.length,
      leves,
      moderados,
      severos,
      enviadosSubregion,
      atendidos,
    };
  });

  /**
   * Lista filtrada de reportes clínicos (`reportes`).
   */
  protected readonly reportesFiltrados = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const gravedad = this.filtroGravedad();
    const estado = this.filtroEstado();

    return this.datosPS.reportes().filter((rep) => {
      const coincideTexto =
        !termino ||
        this.normalizar(rep.pacienteNombre).includes(termino) ||
        this.normalizar(rep.pacienteCedula).includes(termino) ||
        this.normalizar(rep.vacunaNombre).includes(termino) ||
        this.normalizar(rep.lote).includes(termino);

      const coincideGravedad = gravedad === 'todas' || rep.gravedad === gravedad;
      const coincideEstado = estado === 'todos' || rep.estadoSubregion === estado;

      return coincideTexto && coincideGravedad && coincideEstado;
    });
  });

  /**
   * Abre el modal para redactar un nuevo registro en `reportes`.
   */
  protected abrirModalCrear(): void {
    const pacientes = this.datosPS.pacientes();
    const primerPaciente = pacientes[0];

    this.form.set({
      ...FORM_REPORTE_INICIAL,
      pacienteId: primerPaciente ? primerPaciente.id : '',
    });

    if (primerPaciente) {
      const vacs = this.datosPS.aplicacionesDePaciente(primerPaciente.id);
      if (vacs.length > 0) {
        this.seleccionarVacunaCausal(
          vacs[0].id,
          vacs[0].vacunaId,
          vacs[0].vacunaNombre,
          vacs[0].lote,
          vacs[0].fechaAplicacion,
        );
      }
    }

    this.errorFormulario.set('');
    this.modalCrearAbierto.set(true);
  }

  /**
   * Cierra el modal de creación.
   */
  protected cerrarModalCrear(): void {
    this.modalCrearAbierto.set(false);
    this.errorFormulario.set('');
  }

  /**
   * Al cambiar de paciente en el formulario, actualiza los registros `inmunizacion` disponibles.
   */
  protected onCambioPaciente(pacienteId: string): void {
    this.form.update((f) => ({ ...f, pacienteId }));
    const vacs = this.datosPS.aplicacionesDePaciente(pacienteId);
    if (vacs.length > 0) {
      this.seleccionarVacunaCausal(
        vacs[0].id,
        vacs[0].vacunaId,
        vacs[0].vacunaNombre,
        vacs[0].lote,
        vacs[0].fechaAplicacion,
      );
    } else {
      this.form.update((f) => ({
        ...f,
        inmunizacionId: '',
        vacunaId: '',
        vacunaNombre: '',
        lote: '',
        fechaAplicacion: '2026-10-27',
      }));
    }
  }

  /**
   * Establece cuál fila de `inmunizacion` causó el evento adverso (`inmunizacion_id`).
   */
  protected seleccionarVacunaCausal(
    inmunizacionId: string,
    vacunaId: string,
    vacunaNombre: string,
    lote: string,
    fechaAplicacion: string,
  ): void {
    this.form.update((f) => ({
      ...f,
      inmunizacionId,
      vacunaId,
      vacunaNombre,
      lote,
      fechaAplicacion,
    }));
  }

  /**
   * Helper para actualizar campos del formulario en tiempo de tipeo.
   */
  protected actualizarCampo<K extends keyof FormNuevoReporte>(
    campo: K,
    valor: FormNuevoReporte[K],
  ): void {
    this.form.update((form) => ({ ...form, [campo]: valor }));
  }

  /**
   * Alterna la selección de un síntoma en `sintomas_comunes`.
   */
  protected alternarSintoma(sintoma: string): void {
    this.form.update((f) => {
      const existe = f.sintomasSeleccionados.includes(sintoma);
      const nuevaLista = existe
        ? f.sintomasSeleccionados.filter((s) => s !== sintoma)
        : [...f.sintomasSeleccionados, sintoma];
      return { ...f, sintomasSeleccionados: nuevaLista };
    });
  }

  /**
   * Guarda y notifica el reporte en la tabla `reportes` (`example.sql`).
   */
  protected guardarReporte(event: Event): void {
    event.preventDefault();
    const datos = this.form();

    if (!datos.pacienteId) {
      this.errorFormulario.set(
        'Por favor selecciona el ciudadano afectado (ciudadano_mayor_id o ciudadano_menor_id).',
      );
      return;
    }

    if (!datos.vacunaNombre || !datos.lote) {
      this.errorFormulario.set(
        'Por favor selecciona la inmunización sospechosa (inmunizacion_id).',
      );
      return;
    }

    const otroSintoma = datos.otroSintoma.trim();
    const sintomasFinales = [
      ...new Set([...datos.sintomasSeleccionados, ...(otroSintoma ? [otroSintoma] : [])]),
    ];

    if (sintomasFinales.length === 0) {
      this.errorFormulario.set(
        'Debes seleccionar al menos un síntoma de sintomas_comunes o describir el cuadro.',
      );
      return;
    }

    if (!datos.recomendaciones.trim()) {
      this.errorFormulario.set('El campo recomendaciones (VARCHAR(255) NOT NULL) es obligatorio.');
      return;
    }

    const paciente = this.datosPS.pacientes().find((p) => p.id === datos.pacienteId);
    if (!paciente) return;

    const enfermero = this.enfermeroActual();

    const nuevoReporte = this.datosPS.registrarReporteIncidencia({
      inmunizacionId: datos.inmunizacionId || 'app-101',
      pacienteId: paciente.id,
      pacienteCedula: paciente.cedula || `ID-MENOR-${paciente.idRegistro}`,
      pacienteNombre: paciente.nombre,
      vacunaId: datos.vacunaId || 'vac-externa',
      vacunaNombre: datos.vacunaNombre,
      lote: datos.lote.slice(0, 10),
      fechaAplicacion: datos.fechaAplicacion,
      sintomas: sintomasFinales,
      recomendaciones: datos.recomendaciones.trim().slice(0, 255),
      gravedad: datos.gravedad,
      enfermeroId: enfermero.id,
      enfermeroNombre: enfermero.nombre,
      subregionDestinoId: SUBREGION_ACTUAL_ID,
    });

    this.mensajeExito.set(
      `Reporte #${nuevoReporte.idReporte} asentado en la tabla reportes (nivel_gravedad: ${nuevoReporte.gravedad.toUpperCase()}) y notificado a la Subregión.`,
    );

    this.cerrarModalCrear();
  }

  /**
   * Abre el modal de detalle para visualizar la ficha de un reporte.
   */
  protected abrirDetalle(rep: ReporteIncidenciaVacuna): void {
    this.reporteSeleccionado.set(rep);
    this.modalDetalleAbierto.set(true);
  }

  /**
   * Cierra el modal de detalle.
   */
  protected cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.reporteSeleccionado.set(null);
  }

  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroGravedad.set('todas');
    this.filtroEstado.set('todos');
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
