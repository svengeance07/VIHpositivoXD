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

import { GRUPOS_ETNICOS, PROFESIONES, TIPOS_SANGRE } from '../../../../nucleo/datos/catalogos';
import type {
  PacienteCentro,
  SexoCiudadano,
  TipoSangreOficial,
} from '../../../../nucleo/modelos/personal-salud';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/** Modelo de un registro `inmunizacion` inicial asociado al alta del paciente. */
interface VacunaInicialRegistro {
  vacunaId: string;
  vacunaNombre: string;
  dosis: number;
  lote: string;
  fechaAplicacion: string;
  centroAplicacion: string;
  observaciones: string;
}

/**
 * Formulario reactivo alineado con las tablas `ciudadano_mayor_edad` y `ciudadano_menor_edad`
 * de `docs/referencias/example.sql`.
 */
interface FormAltaPaciente {
  esMenor: boolean;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  /** `c_i INT NOT NULL` — exclusivo de `ciudadano_mayor_edad` */
  cedula: string;
  fechaNacimiento: string;
  /** `sexo ENUM('masculino','femenino') NOT NULL` */
  sexo: SexoCiudadano;
  /** `tipo_sangre ENUM('O+', 'O-','A+','A-','B+','B-','AB+','AB-') NOT NULL` */
  tipoSangre: TipoSangreOficial;
  /** `estatura INT NOT NULL` (cm) */
  estatura: number | null;
  /** `domicilio VARCHAR(255) NOT NULL` */
  domicilio: string;
  /** `estado_id INT` (FK → `estados.id_estado`) */
  estadoId: string;
  /** `municipio_id INT` (FK → `municipios.id_municipio`) */
  municipioId: string;
  /** `parroquia_id INT` (FK → `parroquias.id_parroquia`) */
  parroquiaId: string;
  /** `etnia_id INT` (FK → `etnias.id_etnia`) */
  etniaId: string;
  // Campos exclusivos de `ciudadano_mayor_edad`:
  /** `profesion_id INT` (FK → `profesiones.id_profesion`) */
  profesionId: string;
  /** `correo_electronico VARCHAR(100)` */
  correo: string;
  /** `telefono_celular INT` */
  telefonoCelular: string;
  /** `telefono_domicilio INT` */
  telefonoDomicilio: string;
}

const FORM_PACIENTE_INICIAL: FormAltaPaciente = {
  esMenor: false,
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  cedula: '',
  fechaNacimiento: '',
  sexo: 'femenino',
  tipoSangre: 'O+',
  estatura: 165,
  domicilio: '',
  estadoId: 'distrito-capital',
  municipioId: 'm-libertador',
  parroquiaId: 'p-la-pastora',
  etniaId: 'ninguna',
  profesionId: 'desempleado',
  correo: '',
  telefonoCelular: '',
  telefonoDomicilio: '',
};

/**
 * Vista de Registro de Pacientes (/PS/pacientes/nuevo).
 *
 * Adecuada a las tablas `ciudadano_mayor_edad`, `ciudadano_menor_edad` e `inmunizacion`
 * definidas en `docs/referencias/example.sql`.
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

  /** Catálogos de `example.sql` (`profesiones`, `etnias`, `estados`, `municipios`, `parroquias`) */
  protected readonly tiposSangre = TIPOS_SANGRE;
  protected readonly gruposEtnicos = GRUPOS_ETNICOS;
  protected readonly profesiones = PROFESIONES;
  protected readonly estados = this.datosPS.estados;

  /** Municipios filtrados según `estado_id` seleccionado */
  protected readonly municipiosFiltrados = computed(() => {
    const estId = this.form().estadoId;
    return this.datosPS.municipios().filter((m) => m.estadoId === estId);
  });

  /** Parroquias filtradas según `municipio_id` seleccionado */
  protected readonly parroquiasFiltradas = computed(() => {
    const munId = this.form().municipioId;
    return this.datosPS.parroquias().filter((p) => p.municipioId === munId);
  });

  /** Datos del centro y catálogo `vacunas` */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly vacunasDisponibles = this.datosPS.vacunasDisponibles;
  protected readonly enfermeroActual = this.datosPS.enfermeroActual;

  /** Estado del formulario de filiación */
  protected readonly form = signal<FormAltaPaciente>({ ...FORM_PACIENTE_INICIAL });

  /** Lista de registros `inmunizacion` iniciales agregados al expediente */
  protected readonly vacunasIniciales = signal<readonly VacunaInicialRegistro[]>([]);

  // Campos para agregar un registro a `inmunizacion`
  protected readonly nuevaVacunaId = signal<string>('vac-1');
  protected readonly nuevaDosis = signal<number>(1);
  protected readonly nuevoLote = signal<string>('PENTA-2608');
  protected readonly nuevaFecha = signal<string>('2026-10-27');
  protected readonly nuevoCentro = signal<string>(this.datosPS.centroNombre);
  protected readonly nuevasObservaciones = signal<string>('Dosis inicial de esquema');

  // Subformulario para agregar una vacuna nueva al catálogo `vacunas`
  protected readonly mostrarFormNuevaVacuna = signal(false);
  protected readonly nombreNuevaVacuna = signal('');
  protected readonly dosisMaxNuevaVacuna = signal<number>(2);
  protected readonly loteNuevaVacuna = signal('');

  // Estados de validación y confirmación
  protected readonly errorFormulario = signal<string>('');
  protected readonly pacienteCreado = signal<PacienteCentro | null>(null);

  /** Edad calculada a partir de `fecha_nacimiento` */
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

  /** Vacuna actualmente seleccionada en el subformulario `inmunizacion` */
  protected readonly vacunaSeleccionada = computed(() => {
    const vId = this.nuevaVacunaId();
    return this.vacunasDisponibles().find((v) => v.id === vId) ?? null;
  });

  /** Arreglo `[1..cantidad_dosis]` según `vacunas.cantidad_dosis` */
  protected readonly opcionesDosis = computed(() => {
    const max = this.vacunaSeleccionada()?.dosisMaximas ?? 5;
    return Array.from({ length: max }, (_, idx) => idx + 1);
  });

  /** Lotes disponibles (`numero_lote VARCHAR(10)`) */
  protected readonly lotesDisponibles = computed(() => {
    return this.vacunaSeleccionada()?.lotesDisponibles ?? [];
  });

  /**
   * Alterna entre `ciudadano_mayor_edad` (`false`) y `ciudadano_menor_edad` (`true`).
   */
  protected cambiarTipoPaciente(esMenor: boolean): void {
    this.form.update((f) => ({
      ...f,
      esMenor,
      cedula: esMenor ? '' : f.cedula,
      estatura: esMenor ? (f.estatura && f.estatura > 140 ? 105 : f.estatura) : f.estatura || 165,
    }));
    this.errorFormulario.set('');
  }

  /**
   * Al cambiar `estado_id`, selecciona el primer `municipio_id` y `parroquia_id` correspondientes.
   */
  protected onCambioEstado(estadoId: string): void {
    const muns = this.datosPS.municipios().filter((m) => m.estadoId === estadoId);
    const primerMun = muns[0]?.id ?? '';
    const parrs = this.datosPS.parroquias().filter((p) => p.municipioId === primerMun);
    const primeraParr = parrs[0]?.id ?? '';

    this.form.update((f) => ({
      ...f,
      estadoId,
      municipioId: primerMun,
      parroquiaId: primeraParr,
    }));
  }

  /**
   * Al cambiar `municipio_id`, selecciona la primera `parroquia_id` correspondiente.
   */
  protected onCambioMunicipio(municipioId: string): void {
    const parrs = this.datosPS.parroquias().filter((p) => p.municipioId === municipioId);
    const primeraParr = parrs[0]?.id ?? '';

    this.form.update((f) => ({
      ...f,
      municipioId,
      parroquiaId: primeraParr,
    }));
  }

  /**
   * Actualiza la vacuna elegida (`vacuna_id`), su `numero_lote` y ajusta `numero_dosis` a `cantidad_dosis`.
   */
  protected onCambioVacuna(vacunaId: string): void {
    if (vacunaId === '__nueva__') {
      this.abrirFormNuevaVacuna();
      return;
    }

    this.mostrarFormNuevaVacuna.set(false);
    this.nuevaVacunaId.set(vacunaId);
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vacunaId);
    if (vacuna) {
      if (vacuna.lotesDisponibles.length > 0) {
        this.nuevoLote.set(vacuna.lotesDisponibles[0]);
      }
      if (this.nuevaDosis() > vacuna.dosisMaximas) {
        this.nuevaDosis.set(1);
      }
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

    this.nuevaVacunaId.set(creada.id);
    this.nuevaDosis.set(1);
    this.nuevoLote.set(creada.lotesDisponibles[0] ?? '');
    this.mostrarFormNuevaVacuna.set(false);
    this.errorFormulario.set('');
  }

  /**
   * Agrega un registro al listado inicial de `inmunizacion`.
   */
  protected agregarVacunaInicial(): void {
    const vId = this.nuevaVacunaId();
    const vacuna = this.vacunasDisponibles().find((v) => v.id === vId);
    if (!vacuna) return;

    const nueva: VacunaInicialRegistro = {
      vacunaId: vId,
      vacunaNombre: vacuna.nombre,
      dosis: this.nuevaDosis(),
      lote: this.nuevoLote().slice(0, 10),
      fechaAplicacion: this.nuevaFecha(),
      centroAplicacion: this.nuevoCentro().trim() || this.datosPS.centroNombre,
      observaciones: this.nuevasObservaciones().trim().slice(0, 255),
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
   * Valida y guarda el registro en `ciudadano_mayor_edad` o `ciudadano_menor_edad`
   * y sus dosis en `inmunizacion` (`example.sql`).
   */
  protected guardarExpediente(event: Event): void {
    event.preventDefault();
    const datos = this.form();

    // 1. Los 4 nombres son NOT NULL tanto en `ciudadano_mayor_edad` como en `ciudadano_menor_edad`
    if (
      !datos.primerNombre.trim() ||
      !datos.segundoNombre.trim() ||
      !datos.primerApellido.trim() ||
      !datos.segundoApellido.trim()
    ) {
      this.errorFormulario.set(
        'En el esquema oficial (example.sql), Primer Nombre, Segundo Nombre, Primer Apellido y Segundo Apellido son obligatorios (NOT NULL).',
      );
      return;
    }

    // 2. `c_i INT NOT NULL` exclusivo de `ciudadano_mayor_edad`
    if (!datos.esMenor && !datos.cedula.trim()) {
      this.errorFormulario.set(
        'La Cédula de Identidad (c_i) es obligatoria para ciudadano_mayor_edad.',
      );
      return;
    }

    // 3. `fecha_nacimiento DATE NOT NULL`
    if (!datos.fechaNacimiento) {
      this.errorFormulario.set('La Fecha de Nacimiento (fecha_nacimiento) es obligatoria.');
      return;
    }

    // 4. `estatura INT NOT NULL`
    if (!datos.estatura || datos.estatura < 30 || datos.estatura > 250) {
      this.errorFormulario.set(
        'La Estatura en centímetros (estatura INT NOT NULL) es obligatoria.',
      );
      return;
    }

    // 5. `domicilio VARCHAR(255) NOT NULL` y ubicación geográfica (`estado_id`, `municipio_id`, `parroquia_id`)
    if (!datos.domicilio.trim()) {
      this.errorFormulario.set('El Domicilio (domicilio VARCHAR(255) NOT NULL) es obligatorio.');
      return;
    }

    const estadoObj = this.datosPS.estados().find((e) => e.id === datos.estadoId);
    const municipioObj = this.datosPS.municipios().find((m) => m.id === datos.municipioId);
    const parroquiaObj = this.datosPS.parroquias().find((p) => p.id === datos.parroquiaId);
    const etniaObj = this.gruposEtnicos.find((et) => et.id === datos.etniaId);
    const profesionObj = this.profesiones.find((pr) => pr.id === datos.profesionId);

    const nombreCompleto = [
      datos.primerNombre.trim(),
      datos.segundoNombre.trim(),
      datos.primerApellido.trim(),
      datos.segundoApellido.trim(),
    ].join(' ');

    const pacienteNuevo = this.datosPS.registrarPaciente({
      esMenor: datos.esMenor,
      primerNombre: datos.primerNombre.trim(),
      segundoNombre: datos.segundoNombre.trim(),
      primerApellido: datos.primerApellido.trim(),
      segundoApellido: datos.segundoApellido.trim(),
      nombre: nombreCompleto,
      cedula: datos.esMenor ? undefined : datos.cedula.trim(),
      fechaNacimiento: datos.fechaNacimiento,
      sexo: datos.sexo,
      tipoSangre: datos.tipoSangre,
      estatura: Number(datos.estatura),
      domicilio: datos.domicilio.trim(),
      estadoId: datos.estadoId,
      estadoNombre: estadoObj?.nombre ?? 'Distrito Capital',
      municipioId: datos.municipioId,
      municipioNombre: municipioObj?.nombre ?? 'Libertador',
      parroquiaId: datos.parroquiaId,
      parroquiaNombre: parroquiaObj?.nombre ?? 'La Pastora',
      etniaId: datos.etniaId,
      etnia: etniaObj?.nombre ?? 'Ninguna / No aplica',
      // Campos exclusivos de `ciudadano_mayor_edad`:
      profesionId: datos.esMenor ? undefined : datos.profesionId,
      ocupacion: datos.esMenor ? undefined : (profesionObj?.nombre ?? 'Desempleado'),
      correo: datos.esMenor ? undefined : datos.correo.trim() || undefined,
      telefonoCelular: datos.esMenor ? undefined : datos.telefonoCelular.trim() || undefined,
      telefonoDomicilio: datos.esMenor ? undefined : datos.telefonoDomicilio.trim() || undefined,
    });

    // Registra las filas de `inmunizacion` asociadas
    const enfermero = this.enfermeroActual();
    for (const vac of this.vacunasIniciales()) {
      this.datosPS.aplicarVacuna({
        pacienteId: pacienteNuevo.id,
        pacienteCedula: pacienteNuevo.cedula || `ID-MENOR-${pacienteNuevo.idRegistro}`,
        pacienteNombre: pacienteNuevo.nombre,
        esMenor: pacienteNuevo.esMenor,
        vacunaId: vac.vacunaId,
        vacunaNombre: vac.vacunaNombre,
        dosis: vac.dosis,
        lote: vac.lote,
        fechaAplicacion: vac.fechaAplicacion,
        enfermeroId: enfermero.id,
        enfermeroNombre: enfermero.nombre,
        centroNombre: vac.centroAplicacion,
        observaciones: vac.observaciones,
      });
    }

    this.pacienteCreado.set(pacienteNuevo);
    this.errorFormulario.set('');
  }

  /**
   * Navega a la ficha del paciente recién creado.
   */
  protected verCarnetPaciente(): void {
    const paciente = this.pacienteCreado();
    if (!paciente) return;
    const query = paciente.cedula || paciente.nombre;
    void this.router.navigate(['/PS/pacientes'], { queryParams: { q: query } });
  }

  /**
   * Reinicia el formulario para registrar otro paciente.
   */
  protected registrarOtro(): void {
    this.form.set({ ...FORM_PACIENTE_INICIAL });
    this.vacunasIniciales.set([]);
    this.pacienteCreado.set(null);
    this.errorFormulario.set('');
  }

  /**
   * Helper para actualizar campos del formulario.
   */
  protected actualizarCampo<K extends keyof FormAltaPaciente>(
    campo: K,
    valor: FormAltaPaciente[K],
  ): void {
    this.form.update((f) => {
      const nuevo = { ...f, [campo]: valor };
      if (campo === 'fechaNacimiento' && valor) {
        const fn = new Date(valor as string);
        const hoy = new Date('2026-10-27');
        let anos = hoy.getFullYear() - fn.getFullYear();
        const m = hoy.getMonth() - fn.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) anos--;
        if (anos < 18) {
          nuevo.esMenor = true;
          nuevo.cedula = '';
        }
      }
      return nuevo;
    });
  }
}
