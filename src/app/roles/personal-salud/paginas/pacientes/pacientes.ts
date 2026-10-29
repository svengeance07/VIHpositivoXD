import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { AplicacionVacuna, PacienteCentro } from '../../../../nucleo/modelos/personal-salud';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/** Ítem dentro de la cola de vacunación para aplicar una o más vacunas simultáneamente. */
interface ItemColaVacuna {
  vacunaId: string;
  vacunaNombre: string;
  dosis: number;
  lote: string;
  observaciones: string;
}

/**
 * Vista de Consulta y Vacunación de Pacientes (/PS/pacientes).
 *
 * Satisface los puntos requeridos para el Centro de Salud y Enfermeros:
 * 4. CONSULTAR PERSONAS POR NÚMERO DE CÉDULA, PARA VISUALIZAR ESTATUS DE VACUNAS,
 *    ADEMÁS DE APLICARLE UNA O MÁS VACUNAS.
 * 2 (Enfermero): BUSCAR PACIENTE POR CÉDULA, Y VISUALIZAR SU HISTORIAL, DATOS,
 *    VACUNAS ETC, ADEMÁS DE PODER APLICARLE UNA NUEVA.
 * 6. DEJAR REGISTRO/HISTORIAL DE TODAS LAS VACUNAS Y REPORTES GENERADOS Y APLICADOS.
 */
@Component({
  selector: 'app-personal-salud-pacientes',
  imports: [FormsModule, TitleCasePipe, UpperCasePipe, RouterLink, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class PersonalSaludPacientes implements OnInit {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Rol y centro activo */
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly enfermeros = this.datosPS.enfermeros;
  protected readonly enfermeroActual = this.datosPS.enfermeroActual;
  protected readonly vacunasDisponibles = this.datosPS.vacunasDisponibles;

  /** Iniciales limpias del profesional responsable para el avatar de sesión */
  protected readonly inicialesProfesional = computed(() => {
    const limpio = this.enfermeroActual().nombre.replace(/^(Dra\.|Dr\.|Lic\.|Enf\.)\s*/i, '');
    const partes = limpio.split(/\s+/).filter(Boolean);
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return (partes[0]?.slice(0, 2) ?? 'PS').toUpperCase();
  });

  /** Estado del buscador */
  protected readonly busqueda = signal('');
  protected readonly filtroTipoPaciente = signal<'todos' | 'adultos' | 'menores'>('todos');

  /** Paciente seleccionado para visualización de ficha clínica */
  protected readonly pacienteSeleccionado = signal<PacienteCentro | null>(null);

  /** Modo de visualización del historial: 'carnet' digital o 'tabla' de auditoría */
  protected readonly modoVistaCarnet = signal<'carnet' | 'tabla'>('carnet');

  /** Historial dinámico de aplicaciones y reportes del paciente */
  protected readonly historialAplicaciones = computed<readonly AplicacionVacuna[]>(() => {
    const pac = this.pacienteSeleccionado();
    if (!pac) return [];
    return this.datosPS.aplicacionesDePaciente(pac.id);
  });

  protected readonly reportesPaciente = computed(() => {
    const pac = this.pacienteSeleccionado();
    if (!pac) return [];
    return this.datosPS.reportesDePaciente(pac.id);
  });

  /** Estados del modal de aplicación de vacunas */
  protected readonly modalVacunarAbierto = signal(false);
  protected readonly colaVacunacion = signal<readonly ItemColaVacuna[]>([]);

  // Campos de formulario para agregar a la cola
  protected readonly vacunaElegidaId = signal('');
  protected readonly dosisElegida = signal<number>(1);
  protected readonly loteElegido = signal('');
  protected readonly observacionesElegidas = signal('');
  protected readonly enfermeroResponsableId = signal('');

  // Mensajes de feedback
  protected readonly mensajeExito = signal('');
  protected readonly errorFormulario = signal('');

  /**
   * Lista de lotes disponibles reactivos según la vacuna seleccionada en el select.
   */
  protected readonly lotesDisponibles = computed(() => {
    const vId = this.vacunaElegidaId();
    if (!vId) return [];
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vId);
    return vacuna?.lotesDisponibles ?? [];
  });

  /**
   * Filtra los pacientes coincidentes según texto, cédula (con o sin puntuación) y tipo (menor/adulto).
   */
  protected readonly pacientesCoincidentes = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const terminoDigitos = this.limpiarCedula(this.busqueda());
    const tipo = this.filtroTipoPaciente();

    return this.datosPS.pacientes().filter((pac) => {
      const pacCedulaDigitos = this.limpiarCedula(pac.cedula);
      const repCedulaDigitos = this.limpiarCedula(pac.cedulaRepresentante);

      const coincideDigitos =
        terminoDigitos.length >= 3 &&
        (pacCedulaDigitos.includes(terminoDigitos) || repCedulaDigitos.includes(terminoDigitos));

      const coincideTexto =
        !termino ||
        coincideDigitos ||
        this.normalizar(pac.nombre).includes(termino) ||
        (pac.cedula ? this.normalizar(pac.cedula).includes(termino) : false) ||
        (pac.cedulaRepresentante && this.normalizar(pac.cedulaRepresentante).includes(termino)) ||
        (pac.nombreRepresentante && this.normalizar(pac.nombreRepresentante).includes(termino));

      const coincideTipo =
        tipo === 'todos' ||
        (tipo === 'adultos' && !pac.esMenor) ||
        (tipo === 'menores' && pac.esMenor);

      return coincideTexto && coincideTipo;
    });
  });

  ngOnInit(): void {
    // Inicializa el enfermero responsable con el usuario de sesión
    this.enfermeroResponsableId.set(this.datosPS.enfermeroActual().id);

    // Lee parámetro de consulta ?q=... si viene del dashboard
    this.route.queryParams.subscribe((params) => {
      const query = params['q'] as string | undefined;
      if (query && query.trim()) {
        const queryLimpia = query.trim();
        this.busqueda.set(queryLimpia);
        const queryDigitos = this.limpiarCedula(queryLimpia);
        const queryNorm = this.normalizar(queryLimpia);

        // Busca coincidencia por cédula (con o sin puntos/formato), representante o nombre
        const pacienteExacto = this.datosPS.pacientes().find((p) => {
          const pCedulaDigitos = this.limpiarCedula(p.cedula);
          const pRepDigitos = this.limpiarCedula(p.cedulaRepresentante);

          const coincideCedula =
            queryDigitos.length >= 4 &&
            (pCedulaDigitos === queryDigitos || pRepDigitos === queryDigitos);

          const coincideTexto =
            (p.cedula && this.normalizar(p.cedula) === queryNorm) ||
            this.normalizar(p.nombre) === queryNorm;

          return coincideCedula || coincideTexto;
        });

        if (pacienteExacto) {
          this.seleccionarPaciente(pacienteExacto);
        } else {
          // Si no hay coincidencia exacta pero la búsqueda arroja un solo paciente, seleccionarlo de una vez
          const coincidentes = this.pacientesCoincidentes();
          if (coincidentes.length === 1) {
            this.seleccionarPaciente(coincidentes[0]);
          }
        }
      }
    });
  }

  /**
   * Selecciona un paciente para ver su ficha y estatus de vacunas.
   */
  protected seleccionarPaciente(paciente: PacienteCentro): void {
    this.pacienteSeleccionado.set(paciente);
    this.mensajeExito.set('');
    this.errorFormulario.set('');
  }

  /**
   * Vuelve a la lista general de búsqueda de pacientes.
   */
  protected deseleccionarPaciente(): void {
    this.pacienteSeleccionado.set(null);
  }

  /**
   * Abre el modal para aplicar vacunas al paciente activo.
   */
  protected abrirModalVacunar(): void {
    const vacunas = this.vacunasDisponibles();
    const primera = vacunas[0];

    this.vacunaElegidaId.set(primera ? primera.id : '');
    this.dosisElegida.set(1);
    this.loteElegido.set(primera && primera.lotesDisponibles[0] ? primera.lotesDisponibles[0] : '');
    this.observacionesElegidas.set('');
    this.colaVacunacion.set([]);
    this.errorFormulario.set('');
    this.modalVacunarAbierto.set(true);
  }

  /**
   * Cierra el modal de vacunación.
   */
  protected cerrarModalVacunar(): void {
    this.modalVacunarAbierto.set(false);
    this.colaVacunacion.set([]);
    this.errorFormulario.set('');
  }

  /**
   * Al cambiar de vacuna en el select, actualiza el lote por defecto.
   */
  protected onCambioVacuna(vacunaId: string): void {
    this.vacunaElegidaId.set(vacunaId);
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vacunaId);
    if (vacuna && vacuna.lotesDisponibles.length > 0) {
      this.loteElegido.set(vacuna.lotesDisponibles[0]);
    } else {
      this.loteElegido.set('');
    }
  }

  /**
   * Añade una vacuna a la lista de administración de la sesión.
   */
  protected agregarACola(): void {
    const vId = this.vacunaElegidaId();
    const lote = this.loteElegido();
    const dosis = this.dosisElegida();

    if (!vId) {
      this.errorFormulario.set('Por favor selecciona una vacuna.');
      return;
    }

    if (!lote) {
      this.errorFormulario.set('Por favor selecciona un lote disponible.');
      return;
    }

    const vacuna = this.vacunasDisponibles().find((v) => v.id === vId);
    if (!vacuna) return;

    // Verifica que no se agregue la misma vacuna dos veces en la misma sesión
    const yaEnCola = this.colaVacunacion().some((item) => item.vacunaId === vId);
    if (yaEnCola) {
      this.errorFormulario.set(
        `La vacuna "${vacuna.nombre}" ya está agregada a la lista de aplicación.`,
      );
      return;
    }

    const nuevoItem: ItemColaVacuna = {
      vacunaId: vId,
      vacunaNombre: vacuna.nombre,
      dosis,
      lote,
      observaciones: this.observacionesElegidas().trim(),
    };

    this.colaVacunacion.update((cola) => [...cola, nuevoItem]);
    this.errorFormulario.set('');

    // Prepara selección para una siguiente vacuna si lo desea
    this.observacionesElegidas.set('');
  }

  /**
   * Elimina una vacuna de la cola antes de confirmar.
   */
  protected removerDeCola(index: number): void {
    this.colaVacunacion.update((cola) => cola.filter((_, i) => i !== index));
  }

  /**
   * Confirma y registra clínicamente todas las vacunas en la cola (Punto 4 y 6).
   */
  protected confirmarAplicacion(event: Event): void {
    event.preventDefault();
    const paciente = this.pacienteSeleccionado();
    if (!paciente) return;

    const items = this.colaVacunacion();
    if (items.length === 0) {
      // Si la cola está vacía pero hay una vacuna seleccionada, la agrega automáticamente
      if (this.vacunaElegidaId() && this.loteElegido()) {
        this.agregarACola();
      } else {
        this.errorFormulario.set('Debes agregar al menos una vacuna para confirmar la aplicación.');
        return;
      }
    }

    const itemsFinales = this.colaVacunacion();
    if (itemsFinales.length === 0) return;

    // El profesional que efectúa la administración es directamente el usuario logueado en su cuenta
    const enfermero = this.datosPS.enfermeroActual();

    // Registra cada vacuna en el servicio central
    for (const item of itemsFinales) {
      this.datosPS.aplicarVacuna({
        pacienteId: paciente.id,
        pacienteCedula: paciente.cedula || `MENOR-S/C-${paciente.id}`,
        pacienteNombre: paciente.nombre,
        esMenor: paciente.esMenor,
        vacunaId: item.vacunaId,
        vacunaNombre: item.vacunaNombre,
        dosis: item.dosis,
        lote: item.lote,
        enfermeroId: enfermero.id,
        enfermeroNombre: enfermero.nombre,
        observaciones: item.observaciones || undefined,
      });
    }

    const cantidad = itemsFinales.length;
    this.mensajeExito.set(
      `¡Se ${cantidad === 1 ? 'ha aplicado 1 vacuna' : `han aplicado ${cantidad} vacunas`} exitosamente a ${paciente.nombre}! Registro guardado en su carnet clínico.`,
    );

    this.cerrarModalVacunar();
  }

  /**
   * Calcula la edad en años a partir de la fecha de nacimiento (YYYY-MM-DD).
   */
  protected calcularEdad(fechaNacimiento: string): string {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date('2026-10-27'); // Fecha del sistema
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    if (edad === 0) {
      // Menor de un año, calcula en meses
      const meses =
        (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
        (hoy.getMonth() - nacimiento.getMonth());
      return `${meses} meses`;
    }
    return `${edad} años`;
  }

  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroTipoPaciente.set('todos');
    void this.router.navigate([], { queryParams: {} });
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private limpiarCedula(valor: string | undefined): string {
    if (!valor) return '';
    return valor.replace(/\D/g, '');
  }
}
