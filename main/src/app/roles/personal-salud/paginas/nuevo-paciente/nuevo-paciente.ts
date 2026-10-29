import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import type { PacienteCentro } from '../../../../nucleo/modelos/personal-salud';
import { GRUPOS_ETNICOS, PROFESIONES, TIPOS_SANGRE } from '../../../../nucleo/datos/catalogos';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/** Modelo de una vacuna inicial que se registra junto al alta del paciente. */
interface VacunaInicialRegistro {
  vacunaId: string;
  vacunaNombre: string;
  dosis: number;
  lote: string;
  fechaAplicacion: string;
  centroAplicacion: string;
  observaciones: string;
}

/** Formulario reactivo para el alta integral del paciente con el esquema de datos sanitarios oficial. */
interface FormAltaPaciente {
  esMenor: boolean;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedula: string; // Si es menor de edad no se solicita
  fechaNacimiento: string;
  tipoSangre: string;
  etnia: string;
  estatura: number | null;
  correo: string;
  ocupacion: string;
  domicilio: string;
  telefonoCelular: string;
  telefonoDomicilio: string;
  sexo: 'F' | 'M' | 'otro';
  // Campos del representante legal (para menores de edad)
  cedulaRepresentante: string;
  nombreRepresentante: string;
  parentesco: string;
}

const FORM_PACIENTE_INICIAL: FormAltaPaciente = {
  esMenor: false,
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  cedula: '',
  fechaNacimiento: '',
  tipoSangre: 'O+',
  etnia: 'Ninguna / No aplica',
  estatura: null,
  correo: '',
  ocupacion: 'Desempleado',
  domicilio: '',
  telefonoCelular: '',
  telefonoDomicilio: '',
  sexo: 'F',
  cedulaRepresentante: '',
  nombreRepresentante: '',
  parentesco: 'Madre',
};

/**
 * Vista de Registro de Pacientes (/PS/pacientes/nuevo).
 *
 * Satisface los puntos requeridos para el Centro de Salud y Enfermeros:
 * 3 (Centro de Salud): REGISTRAR PACIENTES, CON DATOS PERSONALES, CON VACUNAS,
 *    TANTO MENORES, COMO MAYORES DE EDAD.
 * 3 (Enfermero): REGISTRAR PACIENTE CON DATOS PERSONALES COMPLETOS (PRIMER NOMBRE,
 *    SEGUNDO NOMBRE, PRIMER APELLIDO, SEGUNDO APELLIDO, CÉDULA SI ES MAYOR,
 *    FECHA NACIMIENTO, TIPO SANGRE, ETNIA, ESTATURA, CORREO, OCUPACIÓN,
 *    DOMICILIO, TELÉFONO CELULAR, TELÉFONO FIJO, Y REPRESENTANTE SI ES MENOR).
 */
@Component({
  selector: 'app-personal-salud-nuevo-paciente',
  imports: [FormsModule, RouterLink, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nuevo-paciente.html',
  styleUrl: './nuevo-paciente.css',
})
export class PersonalSaludNuevoPaciente {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly router = inject(Router);

  /** Catálogos del sistema sanitario nacional */
  protected readonly tiposSangre = TIPOS_SANGRE;
  protected readonly gruposEtnicos = GRUPOS_ETNICOS;
  protected readonly profesiones = PROFESIONES;

  /** Datos del centro y catálogo de biológicos disponibles */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly vacunasDisponibles = this.datosPS.vacunasDisponibles;
  protected readonly enfermeros = this.datosPS.enfermeros;
  protected readonly enfermeroActual = this.datosPS.enfermeroActual;

  /** Estado del formulario de filiación */
  protected readonly form = signal<FormAltaPaciente>({ ...FORM_PACIENTE_INICIAL });

  /** Lista de vacunas iniciales agregadas al expediente durante el registro */
  protected readonly vacunasIniciales = signal<readonly VacunaInicialRegistro[]>([]);
  protected readonly registrarVacunasAhora = signal<boolean>(true);

  // Campos para agregar una vacuna inicial
  protected readonly nuevaVacunaId = signal<string>('vac-penta');
  protected readonly nuevaDosis = signal<number>(1);
  protected readonly nuevoLote = signal<string>('PENTA-2026-08');
  protected readonly nuevaFecha = signal<string>('2026-10-27');
  protected readonly nuevoCentro = signal<string>(this.datosPS.centroNombre);
  protected readonly nuevasObservaciones = signal<string>('Dosis inicial de esquema');

  // Estados de validación y confirmación
  protected readonly errorFormulario = signal<string>('');
  protected readonly pacienteCreado = signal<PacienteCentro | null>(null);

  /**
   * Calcula la edad estimada y verifica si corresponde a menor de edad.
   */
  protected readonly edadCalculada = computed(() => {
    const fn = this.form().fechaNacimiento;
    if (!fn) return null;

    const nac = new Date(fn);
    const hoy = new Date('2026-10-27');
    let anos = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      anos--;
    }
    return anos;
  });

  /**
   * Lotes disponibles para la vacuna seleccionada en la sección de inmunizaciones.
   */
  protected readonly lotesDisponibles = computed(() => {
    const vId = this.nuevaVacunaId();
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vId);
    return vacuna?.lotesDisponibles ?? [];
  });

  /**
   * Alterna entre modo Adulto y Menor de edad.
   */
  protected cambiarTipoPaciente(esMenor: boolean): void {
    this.form.update((f) => ({
      ...f,
      esMenor,
      // Si es menor de edad, se limpia la cédula propia ya que no se solicita
      cedula: esMenor ? '' : f.cedula,
      // Para menores de edad no aplica ocupación
      ocupacion: esMenor ? '' : (f.ocupacion || 'Desempleado'),
    }));
    this.errorFormulario.set('');
  }

  /**
   * Actualiza la vacuna elegida y su lote por defecto.
   */
  protected onCambioVacuna(vacunaId: string): void {
    this.nuevaVacunaId.set(vacunaId);
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vacunaId);
    if (vacuna && vacuna.lotesDisponibles.length > 0) {
      this.nuevoLote.set(vacuna.lotesDisponibles[0]);
    }
  }

  /**
   * Agrega una vacuna al listado inicial del expediente.
   */
  protected agregarVacunaInicial(): void {
    const vId = this.nuevaVacunaId();
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vId);
    if (!vacuna) return;

    const nueva: VacunaInicialRegistro = {
      vacunaId: vId,
      vacunaNombre: vacuna.nombre,
      dosis: this.nuevaDosis(),
      lote: this.nuevoLote(),
      fechaAplicacion: this.nuevaFecha(),
      centroAplicacion: this.nuevoCentro().trim() || this.datosPS.centroNombre,
      observaciones: this.nuevasObservaciones().trim(),
    };

    this.vacunasIniciales.update((lista) => [...lista, nueva]);
  }

  /**
   * Quita una vacuna de la lista inicial.
   */
  protected removerVacunaInicial(index: number): void {
    this.vacunasIniciales.update((lista) => lista.filter((_, i) => i !== index));
  }

  /**
   * Valida y procesa el alta del paciente y sus vacunas (Punto 3).
   */
  protected guardarExpediente(event: Event): void {
    event.preventDefault();
    const datos = this.form();

    // 1. Validaciones de nombres y apellidos
    if (!datos.primerNombre.trim() || !datos.primerApellido.trim()) {
      this.errorFormulario.set('El Primer Nombre y el Primer Apellido son obligatorios.');
      return;
    }

    // 2. Validación de Cédula (sólo para adultos; si es menor de edad NO se solicita)
    if (!datos.esMenor) {
      if (!datos.cedula.trim()) {
        this.errorFormulario.set('La Cédula de Identidad es obligatoria para ciudadanos adultos.');
        return;
      }
    }

    // 3. Fecha de nacimiento
    if (!datos.fechaNacimiento) {
      this.errorFormulario.set('Por favor ingresa la fecha de nacimiento del paciente.');
      return;
    }

    // 4. Teléfono celular
    if (!datos.telefonoCelular.trim()) {
      this.errorFormulario.set(
        datos.esMenor
          ? 'El teléfono celular del representante legal o progenitor es obligatorio.'
          : 'El teléfono celular de contacto del paciente es obligatorio.',
      );
      return;
    }

    // 5. Domicilio
    if (!datos.domicilio.trim()) {
      this.errorFormulario.set('La dirección de domicilio del paciente es obligatoria.');
      return;
    }

    // 6. Validación obligatoria para menores de edad: Cédula y nombre del representante
    if (datos.esMenor) {
      if (!datos.cedulaRepresentante.trim() || !datos.nombreRepresentante.trim()) {
        this.errorFormulario.set(
          'Para registrar a un menor de edad es obligatorio ingresar la Cédula y Nombre del Representante Legal (Padre, Madre o Tutor).',
        );
        return;
      }
    }

    // Construcción del nombre completo consolidado
    const nombreCompleto = [
      datos.primerNombre.trim(),
      datos.segundoNombre.trim(),
      datos.primerApellido.trim(),
      datos.segundoApellido.trim(),
    ]
      .filter(Boolean)
      .join(' ');

    const representanteCompleto = datos.esMenor
      ? `${datos.nombreRepresentante.trim()} (${datos.parentesco})`
      : undefined;

    // 1. Registra el nuevo paciente en el servicio reactivo
    const pacienteNuevo = this.datosPS.registrarPaciente({
      primerNombre: datos.primerNombre.trim(),
      segundoNombre: datos.segundoNombre.trim() || undefined,
      primerApellido: datos.primerApellido.trim(),
      segundoApellido: datos.segundoApellido.trim() || undefined,
      nombre: nombreCompleto,
      cedula: datos.esMenor ? undefined : datos.cedula.trim().toUpperCase(),
      fechaNacimiento: datos.fechaNacimiento,
      tipoSangre: datos.tipoSangre,
      etnia: datos.etnia,
      estatura: datos.estatura ? Number(datos.estatura) : undefined,
      correo: datos.correo.trim() || undefined,
      ocupacion: datos.esMenor ? undefined : (datos.ocupacion || undefined),
      domicilio: datos.domicilio.trim(),
      telefonoCelular: datos.telefonoCelular.trim(),
      telefonoDomicilio: datos.telefonoDomicilio.trim() || undefined,
      sexo: datos.sexo,
      esMenor: datos.esMenor,
      cedulaRepresentante: datos.esMenor ? datos.cedulaRepresentante.trim() : undefined,
      nombreRepresentante: representanteCompleto,
      parentescoRepresentante: datos.esMenor ? datos.parentesco : undefined,
    });

    // 2. Si se añadieron vacunas iniciales, las registra en el carnet
    const enfermero = this.enfermeroActual();
    for (const vac of this.vacunasIniciales()) {
      this.datosPS.aplicarVacuna({
        pacienteId: pacienteNuevo.id,
        pacienteCedula: pacienteNuevo.cedula || `MENOR-S/C-${pacienteNuevo.id}`,
        pacienteNombre: pacienteNuevo.nombre,
        esMenor: pacienteNuevo.esMenor,
        vacunaId: vac.vacunaId,
        vacunaNombre: vac.vacunaNombre,
        dosis: vac.dosis,
        lote: vac.lote,
        enfermeroId: enfermero.id,
        enfermeroNombre: enfermero.nombre,
        observaciones: `${vac.observaciones ? vac.observaciones + ' · ' : ''}Aplicada en: ${vac.centroAplicacion}`,
      });
    }

    this.pacienteCreado.set(pacienteNuevo);
    this.errorFormulario.set('');
  }

  /**
   * Navega a la ficha del paciente recién creado para ver su carnet o aplicar más vacunas.
   */
  protected verCarnetPaciente(): void {
    const paciente = this.pacienteCreado();
    if (!paciente) return;
    const query = paciente.cedula || paciente.nombre;
    void this.router.navigate(['/PS/pacientes'], { queryParams: { q: query } });
  }

  /**
   * Reinicia el formulario para registrar otro paciente nuevo.
   */
  protected registrarOtro(): void {
    this.form.set({ ...FORM_PACIENTE_INICIAL });
    this.vacunasIniciales.set([]);
    this.pacienteCreado.set(null);
    this.errorFormulario.set('');
  }

  /**
   * Helper para actualizar campos de filiación.
   */
  protected actualizarCampo<K extends keyof FormAltaPaciente>(
    campo: K,
    valor: FormAltaPaciente[K],
  ): void {
    this.form.update((f) => {
      const nuevo = { ...f, [campo]: valor };
      // Si cambia la fecha de nacimiento, detecta si es menor (< 18 años)
      if (campo === 'fechaNacimiento' && valor) {
        const fn = new Date(valor as string);
        const hoy = new Date('2026-10-27');
        let anos = hoy.getFullYear() - fn.getFullYear();
        const m = hoy.getMonth() - fn.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) anos--;
        if (anos < 18) {
          nuevo.esMenor = true;
          nuevo.cedula = ''; // No se solicita cédula al menor
        }
      }
      return nuevo;
    });
  }
}
