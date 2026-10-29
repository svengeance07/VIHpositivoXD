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

import type {
  NivelGravedadReporte,
  PacienteCentro,
  ReporteIncidenciaVacuna,
} from '../../../../nucleo/modelos/personal-salud';
import { SUBREGION_ACTUAL_ID } from '../../../../nucleo/datos/personal-salud';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/** Modelo del formulario para notificar un nuevo evento adverso / reporte. */
interface FormNuevoReporte {
  pacienteId: string;
  vacunaId: string;
  vacunaNombre: string;
  lote: string;
  fechaAplicacion: string;
  sintomasSeleccionados: string[];
  otroSintoma: string;
  indicacionesDictadas: string;
  gravedad: NivelGravedadReporte;
}

const FORM_REPORTE_INICIAL: FormNuevoReporte = {
  pacienteId: '',
  vacunaId: '',
  vacunaNombre: '',
  lote: '',
  fechaAplicacion: '2026-10-27',
  sintomasSeleccionados: [],
  otroSintoma: '',
  indicacionesDictadas: '',
  gravedad: 'leve',
};

/** Catálogo de síntomas frecuentes para selección rápida (chips/checkboxes). */
const SINTOMAS_FRECUENTES: readonly string[] = [
  'Fiebre moderada o alta (> 38.5°C)',
  'Dolor e inflamación local mayor a 5 cm',
  'Cefalea intensa',
  'Mialgias o dolor articular generalizado',
  'Eritema o erupción cutánea / Prurito',
  'Náuseas, vómitos o malestar gastrointestinal',
  'Mareo o sensación lipotímica',
  'Edema local o induración',
];

/**
 * Vista de Registro y Gestión de Reportes de Incidencias ESAVI (/PS/reportes).
 *
 * Satisface los puntos requeridos para el Centro de Salud y Enfermeros:
 * 5 (Centro de Salud): REGISTRAR REPORTES POR PROBLEMAS CON UNA VACUNA, TANTO SÍNTOMAS,
 *    ADEMÁS DE DEJAR SENTADA LAS INDICACIONES DICTADAS Y VISUALIZAR LA FICHA.
 * 4 (Enfermero): GENERAR REPORTES POR PROBLEMAS CON LAS VACUNAS, TANTO SÍNTOMAS,
 *    CUÁL VACUNA FUE DE LAS QUE SE APLICÓ, PARA GENERAR EL REPORTE Y HACERLO LLEGAR
 *    A LA SUBREGIÓN DE SU ESTADO, Y DEJAR DICHO REPORTE EN EL HISTORIAL DEL PACIENTE.
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

  /** Datos del centro y catálogo de síntomas */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly enfermeroActual = this.datosPS.enfermeroActual;
  protected readonly sintomasDisponibles = SINTOMAS_FRECUENTES;

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
   * Vacunas previas aplicadas al paciente elegido en el formulario modal.
   * Permite seleccionar exactamente cuál vacuna causó el síntoma adverso.
   */
  protected readonly vacunasDelPacienteElegido = computed(() => {
    const pId = this.form().pacienteId;
    if (!pId) return [];
    return this.datosPS.aplicacionesDePaciente(pId);
  });

  /**
   * Datos del paciente seleccionado en el formulario modal.
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
   * Lista filtrada de reportes clínicos.
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
   * Abre el modal para redactar un nuevo reporte ESAVI.
   */
  protected abrirModalCrear(): void {
    const pacientes = this.datosPS.pacientes();
    const primerPaciente = pacientes[0];

    this.form.set({
      ...FORM_REPORTE_INICIAL,
      pacienteId: primerPaciente ? primerPaciente.id : '',
    });

    // Si el paciente tiene vacunas previas, selecciona la primera por defecto
    if (primerPaciente) {
      const vacs = this.datosPS.aplicacionesDePaciente(primerPaciente.id);
      if (vacs.length > 0) {
        this.seleccionarVacunaCausal(
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
   * Al cambiar de paciente en el formulario, actualiza las vacunas disponibles.
   */
  protected onCambioPaciente(pacienteId: string): void {
    this.form.update((f) => ({ ...f, pacienteId }));
    const vacs = this.datosPS.aplicacionesDePaciente(pacienteId);
    if (vacs.length > 0) {
      this.seleccionarVacunaCausal(
        vacs[0].vacunaId,
        vacs[0].vacunaNombre,
        vacs[0].lote,
        vacs[0].fechaAplicacion,
      );
    } else {
      this.form.update((f) => ({
        ...f,
        vacunaId: '',
        vacunaNombre: '',
        lote: '',
        fechaAplicacion: '2026-10-27',
      }));
    }
  }

  /**
   * Establece cuál vacuna de las aplicadas causó el evento adverso.
   */
  protected seleccionarVacunaCausal(
    vacunaId: string,
    vacunaNombre: string,
    lote: string,
    fechaAplicacion: string,
  ): void {
    this.form.update((f) => ({
      ...f,
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
   * Alterna la selección de un síntoma en la lista de chips.
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
   * Guarda y notifica el reporte de reacción adversa a la Subregión estadal (Punto 5 y Punto 4 Enf).
   */
  protected guardarReporte(event: Event): void {
    event.preventDefault();
    const datos = this.form();

    if (!datos.pacienteId) {
      this.errorFormulario.set('Por favor selecciona el paciente afectado.');
      return;
    }

    if (!datos.vacunaNombre || !datos.lote) {
      this.errorFormulario.set(
        'Por favor indica cuál vacuna fue la que se aplicó y causó la reacción.',
      );
      return;
    }

    // Combina síntomas seleccionados y síntoma adicional, sin duplicados
    const otroSintoma = datos.otroSintoma.trim();
    const sintomasFinales = [
      ...new Set([...datos.sintomasSeleccionados, ...(otroSintoma ? [otroSintoma] : [])]),
    ];

    if (sintomasFinales.length === 0) {
      this.errorFormulario.set('Debes registrar al menos un síntoma o problema clínico observado.');
      return;
    }

    if (!datos.indicacionesDictadas.trim()) {
      this.errorFormulario.set(
        'Es obligatorio dejar sentadas las indicaciones dictadas y el tratamiento prescrito.',
      );
      return;
    }

    const paciente = this.datosPS.pacientes().find((p) => p.id === datos.pacienteId);
    if (!paciente) return;

    const enfermero = this.enfermeroActual();

    // Registra en el servicio y envía a la subregión
    const nuevoReporte = this.datosPS.registrarReporteIncidencia({
      pacienteId: paciente.id,
      pacienteCedula: paciente.cedula || 'MENOR-SIN-CEDULA',
      pacienteNombre: paciente.nombre,
      vacunaId: datos.vacunaId || 'vac-externa',
      vacunaNombre: datos.vacunaNombre,
      lote: datos.lote,
      fechaAplicacion: datos.fechaAplicacion,
      sintomas: sintomasFinales,
      indicacionesDictadas: datos.indicacionesDictadas.trim(),
      gravedad: datos.gravedad,
      enfermeroId: enfermero.id,
      enfermeroNombre: enfermero.nombre,
      subregionDestinoId: SUBREGION_ACTUAL_ID,
    });

    this.mensajeExito.set(
      `Reporte clínico notificado con éxito a la Subregión estadal (Nivel: ${nuevoReporte.gravedad.toUpperCase()}). Expediente de ${paciente.nombre} actualizado.`,
    );

    this.cerrarModalCrear();
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
