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

/** Ítem dentro de la cola de vacunación para aplicar una o más filas en `inmunizacion`. */
interface ItemColaVacuna {
  vacunaId: string;
  vacunaNombre: string;
  dosis: number;
  lote: string;
  fechaAplicacion: string;
  observaciones: string;
}

/**
 * Vista de Consulta y Vacunación de Pacientes (/PS/pacientes).
 *
 * Adecuada a las tablas `ciudadano_mayor_edad`, `ciudadano_menor_edad`, `vacunas`,
 * `inmunizacion`, `reportes` y `sintomas_comunes` de `docs/referencias/example.sql`.
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
  protected readonly codigoCentro = computed(() => this.datosPS.centroInfo.codigoCentro);
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

  /** Modo de visualización del historial: 'carnet' (librito), 'certificado' (imprimible) o 'tabla' de auditoría */
  protected readonly modoVistaCarnet = signal<'carnet' | 'certificado' | 'tabla'>('carnet');

  /** Fecha actual formateada para el pie de emisión del certificado */
  protected readonly fechaEmisionCertificado = '2026-11-10';

  /** Paginación de hojas dentro del librito de vacunación */
  protected readonly paginaLibrito = signal(0);
  protected readonly vacunasPorHoja = 2;

  /** Historial dinámico de registros `inmunizacion` del paciente */
  protected readonly historialAplicaciones = computed<readonly AplicacionVacuna[]>(() => {
    const pac = this.pacienteSeleccionado();
    if (!pac) return [];
    return this.datosPS.aplicacionesDePaciente(pac.id);
  });

  /** Total de hojas del librito (incluye casilla para nueva dosis) */
  protected readonly totalHojasLibrito = computed(() => {
    const total = this.historialAplicaciones().length;
    return Math.max(1, Math.ceil((total + 1) / this.vacunasPorHoja));
  });

  /** Vacunas visibles en la hoja activa del librito */
  protected readonly vacunasHojaActual = computed<readonly AplicacionVacuna[]>(() => {
    const todas = this.historialAplicaciones();
    const inicio = this.paginaLibrito() * this.vacunasPorHoja;
    return todas.slice(inicio, inicio + this.vacunasPorHoja);
  });

  /** Casillas vacías restantes en la hoja actual para simular los renglones del librito */
  protected readonly casillasVaciasHoja = computed<readonly number[]>(() => {
    const ocupadas = this.vacunasHojaActual().length;
    const restantes = Math.max(0, this.vacunasPorHoja - ocupadas);
    const inicioIndice = this.paginaLibrito() * this.vacunasPorHoja + ocupadas + 1;
    return Array.from({ length: restantes }, (_, idx) => inicioIndice + idx);
  });

  protected readonly reportesPaciente = computed(() => {
    const pac = this.pacienteSeleccionado();
    if (!pac) return [];
    return this.datosPS.reportesDePaciente(pac.id);
  });

  /** Estados del modal de aplicación de vacunas (`inmunizacion`) */
  protected readonly modalVacunarAbierto = signal(false);
  protected readonly colaVacunacion = signal<readonly ItemColaVacuna[]>([]);

  // Campos de formulario para agregar a la cola (`inmunizacion`)
  protected readonly vacunaElegidaId = signal('');
  protected readonly dosisElegida = signal<number>(1);
  protected readonly loteElegido = signal('');
  protected readonly fechaElegida = signal('2026-10-27');
  protected readonly observacionesElegidas = signal('');
  protected readonly enfermeroResponsableId = signal('');

  // Subformulario para dar de alta una nueva vacuna en `vacunas` si no aparece en la lista
  protected readonly mostrarFormNuevaVacuna = signal(false);
  protected readonly nombreNuevaVacuna = signal('');
  protected readonly dosisMaxNuevaVacuna = signal<number>(2);
  protected readonly loteNuevaVacuna = signal('');

  // Mensajes de feedback
  protected readonly mensajeExito = signal('');
  protected readonly errorFormulario = signal('');

  /** Vacuna actualmente seleccionada en el modal */
  protected readonly vacunaModalSeleccionada = computed(() => {
    const vId = this.vacunaElegidaId();
    return this.vacunasDisponibles().find((v) => v.id === vId) ?? null;
  });

  /** Opciones `[1..cantidad_dosis]` según `vacunas.cantidad_dosis` */
  protected readonly opcionesDosisModal = computed(() => {
    const max = this.vacunaModalSeleccionada()?.dosisMaximas ?? 5;
    return Array.from({ length: max }, (_, idx) => idx + 1);
  });

  /** Lista de lotes disponibles (`numero_lote VARCHAR(10)`) */
  protected readonly lotesDisponibles = computed(() => {
    return this.vacunaModalSeleccionada()?.lotesDisponibles ?? [];
  });

  /**
   * Filtra los pacientes coincidentes en `ciudadano_mayor_edad` y `ciudadano_menor_edad`.
   */
  protected readonly pacientesCoincidentes = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const terminoDigitos = this.limpiarCedula(this.busqueda());
    const tipo = this.filtroTipoPaciente();

    return this.datosPS.pacientes().filter((pac) => {
      const pacCedulaDigitos = this.limpiarCedula(pac.cedula);
      const idRegistroStr = String(pac.idRegistro);

      const coincideDigitos =
        terminoDigitos.length >= 2 &&
        (pacCedulaDigitos.includes(terminoDigitos) || idRegistroStr === terminoDigitos);

      const coincideTexto =
        !termino ||
        coincideDigitos ||
        this.normalizar(pac.nombre).includes(termino) ||
        (pac.cedula ? this.normalizar(pac.cedula).includes(termino) : false) ||
        this.normalizar(pac.parroquiaNombre).includes(termino) ||
        this.normalizar(pac.municipioNombre).includes(termino);

      const coincideTipo =
        tipo === 'todos' ||
        (tipo === 'adultos' && !pac.esMenor) ||
        (tipo === 'menores' && pac.esMenor);

      return coincideTexto && coincideTipo;
    });
  });

  ngOnInit(): void {
    this.enfermeroResponsableId.set(this.datosPS.enfermeroActual().id);

    this.route.queryParams.subscribe((params) => {
      const query = params['q'] as string | undefined;
      if (query && query.trim()) {
        const queryLimpia = query.trim();
        this.busqueda.set(queryLimpia);
        const queryDigitos = this.limpiarCedula(queryLimpia);
        const queryNorm = this.normalizar(queryLimpia);

        const pacienteExacto = this.datosPS.pacientes().find((p) => {
          const pCedulaDigitos = this.limpiarCedula(p.cedula);
          const coincideCedula = queryDigitos.length >= 4 && pCedulaDigitos === queryDigitos;
          const coincideTexto =
            (p.cedula && this.normalizar(p.cedula) === queryNorm) ||
            this.normalizar(p.nombre) === queryNorm;

          return coincideCedula || coincideTexto;
        });

        if (pacienteExacto) {
          this.seleccionarPaciente(pacienteExacto);
        } else {
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
    this.paginaLibrito.set(0);
    this.mensajeExito.set('');
    this.errorFormulario.set('');
  }

  /**
   * Navegación entre las hojas del librito de vacunación.
   */
  protected irHojaAnterior(): void {
    this.paginaLibrito.update((actual) => Math.max(0, actual - 1));
  }

  protected irHojaSiguiente(): void {
    const max = this.totalHojasLibrito() - 1;
    this.paginaLibrito.update((actual) => Math.min(max, actual + 1));
  }

  protected irAHoja(indice: number): void {
    const max = this.totalHojasLibrito() - 1;
    if (indice >= 0 && indice <= max) {
      this.paginaLibrito.set(indice);
    }
  }

  protected inicialesTexto(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return (partes[0]?.slice(0, 2) ?? 'CI').toUpperCase();
  }

  /**
   * Abre el diálogo de impresión del navegador para imprimir el Certificado Oficial de Inmunización.
   */
  protected imprimirCertificado(): void {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }

  /**
   * Vuelve a la lista general de búsqueda de pacientes.
   */
  protected deseleccionarPaciente(): void {
    this.pacienteSeleccionado.set(null);
  }

  /**
   * Abre el modal para aplicar vacunas (`inmunizacion`) al paciente activo.
   */
  protected abrirModalVacunar(): void {
    const vacunas = this.vacunasDisponibles();
    const primera = vacunas[0];

    this.vacunaElegidaId.set(primera ? primera.id : '');
    this.dosisElegida.set(1);
    this.loteElegido.set(primera && primera.lotesDisponibles[0] ? primera.lotesDisponibles[0] : '');
    this.fechaElegida.set('2026-10-27');
    this.observacionesElegidas.set('');
    this.colaVacunacion.set([]);
    this.mostrarFormNuevaVacuna.set(false);
    this.nombreNuevaVacuna.set('');
    this.dosisMaxNuevaVacuna.set(2);
    this.loteNuevaVacuna.set('');
    this.errorFormulario.set('');
    this.modalVacunarAbierto.set(true);
  }

  /**
   * Cierra el modal de vacunación.
   */
  protected cerrarModalVacunar(): void {
    this.modalVacunarAbierto.set(false);
    this.colaVacunacion.set([]);
    this.mostrarFormNuevaVacuna.set(false);
    this.errorFormulario.set('');
  }

  /**
   * Al cambiar de vacuna en el select, actualiza el lote y limita `numero_dosis` a `cantidad_dosis`.
   * Si elige `__nueva__`, despliega el formulario para agregar una vacuna al catálogo `vacunas`.
   */
  protected onCambioVacuna(vacunaId: string): void {
    if (vacunaId === '__nueva__') {
      this.abrirFormNuevaVacuna();
      return;
    }

    this.mostrarFormNuevaVacuna.set(false);
    this.vacunaElegidaId.set(vacunaId);
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vacunaId);
    if (vacuna) {
      this.loteElegido.set(vacuna.lotesDisponibles[0] ?? '');
      if (this.dosisElegida() > vacuna.dosisMaximas) {
        this.dosisElegida.set(1);
      }
    } else {
      this.loteElegido.set('');
    }
  }

  protected abrirFormNuevaVacuna(): void {
    this.mostrarFormNuevaVacuna.set(true);
    this.nombreNuevaVacuna.set('');
    this.dosisMaxNuevaVacuna.set(2);
    this.loteNuevaVacuna.set('');
    this.errorFormulario.set('');
  }

  protected cancelarNuevaVacuna(): void {
    this.mostrarFormNuevaVacuna.set(false);
    this.errorFormulario.set('');
  }

  /**
   * Registra una nueva vacuna en `vacunas` (`nombre_vacuna`, `cantidad_dosis`) y la selecciona de inmediato.
   */
  protected guardarNuevaVacuna(): void {
    const nombre = this.nombreNuevaVacuna().trim();
    const dosisMax = Number(this.dosisMaxNuevaVacuna() || 1);
    const lote = this.loteNuevaVacuna().trim();

    if (!nombre) {
      this.errorFormulario.set('Ingresa el nombre de la nueva vacuna (nombre_vacuna).');
      return;
    }

    const creada = this.datosPS.registrarVacuna({
      nombre,
      dosisMaximas: dosisMax,
      loteInicial: lote || undefined,
    });

    this.vacunaElegidaId.set(creada.id);
    this.dosisElegida.set(1);
    this.loteElegido.set(creada.lotesDisponibles[0] ?? '');
    this.mostrarFormNuevaVacuna.set(false);
    this.errorFormulario.set('');
  }

  /**
   * Añade una vacuna a la lista de administración de la sesión.
   */
  protected agregarACola(): void {
    const vId = this.vacunaElegidaId();
    const lote = this.loteElegido().trim().slice(0, 10);
    const dosis = this.dosisElegida();

    if (!vId) {
      this.errorFormulario.set('Por favor selecciona una vacuna (vacuna_id).');
      return;
    }

    if (!lote) {
      this.errorFormulario.set('Por favor selecciona un lote disponible (numero_lote).');
      return;
    }

    const vacuna = this.vacunasDisponibles().find((v) => v.id === vId);
    if (!vacuna) return;

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
      fechaAplicacion: this.fechaElegida() || '2026-10-27',
      observaciones: this.observacionesElegidas().trim().slice(0, 255),
    };

    this.colaVacunacion.update((cola) => [...cola, nuevoItem]);
    this.errorFormulario.set('');
    this.observacionesElegidas.set('');
  }

  /**
   * Elimina una vacuna de la cola antes de confirmar.
   */
  protected removerDeCola(index: number): void {
    this.colaVacunacion.update((cola) => cola.filter((_, i) => i !== index));
  }

  /**
   * Confirma y registra en `inmunizacion` todas las vacunas en la cola.
   */
  protected confirmarAplicacion(event: Event): void {
    event.preventDefault();
    const paciente = this.pacienteSeleccionado();
    if (!paciente) return;

    const items = this.colaVacunacion();
    if (items.length === 0) {
      if (this.vacunaElegidaId() && this.loteElegido()) {
        this.agregarACola();
      } else {
        this.errorFormulario.set('Debes agregar al menos una vacuna para confirmar la aplicación.');
        return;
      }
    }

    const itemsFinales = this.colaVacunacion();
    if (itemsFinales.length === 0) return;

    const enfermero = this.datosPS.enfermeroActual();

    for (const item of itemsFinales) {
      this.datosPS.aplicarVacuna({
        pacienteId: paciente.id,
        pacienteCedula: paciente.cedula || `ID-MENOR-${paciente.idRegistro}`,
        pacienteNombre: paciente.nombre,
        esMenor: paciente.esMenor,
        vacunaId: item.vacunaId,
        vacunaNombre: item.vacunaNombre,
        dosis: item.dosis,
        lote: item.lote,
        fechaAplicacion: item.fechaAplicacion,
        enfermeroId: enfermero.id,
        enfermeroNombre: enfermero.nombre,
        observaciones: item.observaciones || undefined,
      });
    }

    const cantidad = itemsFinales.length;
    this.mensajeExito.set(
      `¡Se ${cantidad === 1 ? 'ha registrado 1 dosis' : `han registrado ${cantidad} dosis`} en inmunizacion para ${paciente.nombre}!`,
    );

    this.cerrarModalVacunar();
  }

  /**
   * Calcula la edad en años a partir de `fecha_nacimiento` (YYYY-MM-DD).
   */
  protected calcularEdad(fechaNacimiento: string): string {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date('2026-10-27');
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    if (edad === 0) {
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
