import { DecimalPipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { Enfermero, TurnoTrabajo } from '../../../../nucleo/modelos/personal-salud';
import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { SesionService } from '../../../../nucleo/servicios/sesion.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';
import { Router } from '@angular/router';

/** Modelo del formulario para generar perfiles de enfermeros (Punto 1). */
interface FormAltaEnfermero {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  idProfesional: string;
  turno: TurnoTrabajo;
  claveInicial: string;
}

const FORM_ALTA_INICIAL: FormAltaEnfermero = {
  nombre: '',
  cedula: '',
  correo: '',
  telefono: '',
  idProfesional: '',
  turno: 'manana',
  claveInicial: '',
};

/**
 * Vista de Gestión de Personal y Perfiles de Enfermeros (/PS/personal).
 *
 * Satisface los puntos requeridos para el Centro de Salud:
 * 1. GENERAR PERFILES PARA ENFERMEROS (Exclusivo Jefe de Centro).
 * 2. VISUALIZAR MÉTRICAS DEL PERSONAL REGISTRADO (Desempeño y rendimiento).
 * 3. VISUALIZAR SU PERFIL Y MÉTRICAS PROPIAS (Cuando ingresa un Enfermero).
 */
@Component({
  selector: 'app-personal-salud-personal',
  imports: [FormsModule, UpperCasePipe, DecimalPipe, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personal.html',
  styleUrl: './personal.css',
})
export class PersonalSaludPersonal {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  /** Rol del usuario activo */
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly miPerfil = this.datosPS.enfermeroActual;
  protected readonly misMetricas = this.datosPS.metricasEnfermero;

  /** Pestaña activa en vista de Jefatura (plantilla vs credencial) */
  protected readonly tabJefe = signal<'plantilla' | 'credencial'>('plantilla');

  /** Filtros de búsqueda (para el Jefe) */
  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');

  /** Estados de modales */
  protected readonly modalAltaAbierto = signal(false);
  protected readonly modalDetalleAbierto = signal(false);
  protected readonly enfermeroSeleccionado = signal<Enfermero | null>(null);

  /** Estado del formulario de alta */
  protected readonly formAlta = signal<FormAltaEnfermero>({ ...FORM_ALTA_INICIAL });
  protected readonly errorFormulario = signal('');
  protected readonly mensajeExito = signal('');

  /** Estado de la Credencial Digital Institucional */
  protected readonly caraCredencial = signal<'frente' | 'reverso'>('frente');
  protected readonly mensajeCredencial = signal('');

  /** Iniciales limpias del perfil activo para el carnet */
  protected readonly inicialesPerfil = computed(() => {
    const limpio = this.miPerfil().nombre.replace(/^(Dra\.|Dr\.|Lic\.|Enf\.)\s*/i, '');
    const partes = limpio.split(/\s+/).filter(Boolean);
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return (partes[0]?.slice(0, 2) ?? 'EN').toUpperCase();
  });

  /** Dosis biológicas totales administradas por este profesional */
  protected readonly misAplicacionesTotales = computed(() => {
    const enf = this.miPerfil();
    return this.datosPS.aplicaciones().filter((a) => a.enfermeroId === enf.id);
  });

  /**
   * Métricas consolidadas del equipo de enfermería (Punto 2 del requerimiento).
   */
  protected readonly metricasEquipo = computed(() => {
    const lista = this.datosPS.enfermeros();
    const activos = lista.filter((e) => e.activo);
    const vacunasHoy = lista.reduce((acc, curr) => acc + curr.vacunasAplicadasHoy, 0);
    const vacunasTotal = lista.reduce((acc, curr) => acc + curr.vacunasAplicadasTotal, 0);
    const reportesTotal = lista.reduce((acc, curr) => acc + curr.reportesGeneradosTotal, 0);

    const promedio = activos.length > 0 ? Math.round(vacunasTotal / activos.length) : 0;

    return {
      total: lista.length,
      activos: activos.length,
      vacunasHoy,
      vacunasTotal,
      reportesTotal,
      promedio,
    };
  });

  /**
   * Lista filtrada de enfermeros para la grilla/tabla.
   */
  protected readonly enfermerosFiltrados = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const estado = this.filtroEstado();

    return this.datosPS.enfermeros().filter((enf) => {
      // Filtro de texto por nombre, cédula o matrícula
      const coincideTexto =
        !termino ||
        this.normalizar(enf.nombre).includes(termino) ||
        this.normalizar(enf.cedula).includes(termino) ||
        this.normalizar(enf.idProfesional).includes(termino);

      // Filtro por estado activo/inactivo
      const coincideEstado =
        estado === 'todos' ||
        (estado === 'activos' && enf.activo) ||
        (estado === 'inactivos' && !enf.activo);

      return coincideTexto && coincideEstado;
    });
  });

  /**
   * Abre el modal para generar un nuevo perfil de enfermero.
   */
  protected abrirModalAlta(): void {
    this.formAlta.set({ ...FORM_ALTA_INICIAL });
    this.errorFormulario.set('');
    this.mensajeExito.set('');
    this.modalAltaAbierto.set(true);
  }

  /**
   * Cierra el modal de alta.
   */
  protected cerrarModalAlta(): void {
    this.modalAltaAbierto.set(false);
    this.errorFormulario.set('');
  }

  /**
   * Procesa el formulario y da de alta al nuevo enfermero (Punto 1).
   */
  protected guardarAlta(event: Event): void {
    event.preventDefault();
    const datos = this.formAlta();

    // Validaciones básicas de campos obligatorios
    if (!datos.nombre.trim() || !datos.cedula.trim() || !datos.correo.trim()) {
      this.errorFormulario.set('Por favor completa el nombre, la cédula y el correo electrónico.');
      return;
    }

    if (!datos.idProfesional.trim()) {
      this.errorFormulario.set(
        'La matrícula profesional o colegiado es obligatoria para el personal de salud.',
      );
      return;
    }

    if (!datos.correo.includes('@') || !datos.correo.includes('.')) {
      this.errorFormulario.set('Ingresa un correo electrónico institucional válido.');
      return;
    }

    const clave = datos.claveInicial.trim();
    if (!clave || clave.length < 6) {
      this.errorFormulario.set('La contraseña de acceso inicial debe tener al menos 6 caracteres.');
      return;
    }

    // Registra en el servicio reactivo de personal de salud
    const nuevo = this.datosPS.crearEnfermero({
      nombre: datos.nombre.trim(),
      cedula: datos.cedula.trim(),
      correo: datos.correo.trim().toLowerCase(),
      telefono: datos.telefono.trim() || 'No especificado',
      idProfesional: datos.idProfesional.trim().toUpperCase(),
      centroId: this.datosPS.centroId,
      turno: datos.turno,
      fechaIngreso: '2026-10-27',
      clave,
    });

    // Registra el perfil de acceso en el Centro de Salud para permitir su autenticación en /login
    this.sesion.registrarPerfilEnCentro(this.datosPS.centroId, {
      id: nuevo.id,
      nombre: nuevo.nombre,
      tipo: 'trabajador',
      correo: nuevo.correo,
      clave,
    });

    this.mensajeExito.set(
      `Perfil generado exitosamente para ${nuevo.nombre}. Credencial y clave de acceso activadas.`,
    );
    this.cerrarModalAlta();
  }

  /**
   * Abre la ficha de métricas detalladas de un enfermero.
   */
  protected verDetalle(enfermero: Enfermero): void {
    this.enfermeroSeleccionado.set(enfermero);
    this.modalDetalleAbierto.set(true);
  }

  /**
   * Cierra el modal de detalle.
   */
  protected cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.enfermeroSeleccionado.set(null);
  }

  /**
   * Conmuta el estado laboral del enfermero (activo / en permiso).
   */
  protected alternarEstado(enfermero: Enfermero): void {
    this.datosPS.alternarEstadoEnfermero(enfermero.id);
  }

  /**
   * Restablece los filtros de búsqueda a sus valores iniciales.
   */
  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroEstado.set('todos');
  }

  /**
   * Helper para actualizar campos del formulario en tiempo de tipeo.
   */
  protected actualizarCampo<K extends keyof FormAltaEnfermero>(
    campo: K,
    valor: FormAltaEnfermero[K],
  ): void {
    this.formAlta.update((form) => ({ ...form, [campo]: valor }));
  }

  /**
   * Conmuta la visualización entre el anverso (frente) y reverso de la credencial.
   */
  protected voltearCredencial(): void {
    this.caraCredencial.update((c) => (c === 'frente' ? 'reverso' : 'frente'));
  }

  /**
   * Simula la descarga oficial de la credencial profesional en formato digital.
   */
  protected descargarCredencial(): void {
    const matricula = this.miPerfil().idProfesional;
    this.mensajeCredencial.set(
      `Credencial descargada exitosamente en formato PDF oficial (MPPS-${matricula}.pdf).`,
    );
    setTimeout(() => {
      this.mensajeCredencial.set('');
    }, 4500);
  }

  /**
   * Copia el código criptográfico / hash de validación sanitaria al portapapeles.
   */
  protected copiarEnlaceVerificacion(): void {
    const enlace = `https://mpps.gob.ve/verificar-personal?colegiado=${encodeURIComponent(
      this.miPerfil().idProfesional,
    )}&ci=${encodeURIComponent(this.miPerfil().cedula)}`;

    void navigator.clipboard?.writeText(enlace);
    this.mensajeCredencial.set('¡Código de verificación copiado al portapapeles!');
    setTimeout(() => {
      this.mensajeCredencial.set('');
    }, 3500);
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
