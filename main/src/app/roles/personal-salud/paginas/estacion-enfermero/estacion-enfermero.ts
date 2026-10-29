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

import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/**
 * Estación de Inmunización y Trabajo Diario del Enfermero (/PS/estacion).
 *
 * Vista 100% independiente orientada a la labor operativa del personal de enfermería:
 * - Credencial activa del enfermero y puesto de vacunación en guardia.
 * - Indicadores clave de desempeño individual en la jornada.
 * - Buscador rápido de paciente por cédula o cédula del representante para menores.
 * - Hub de acciones inmediatas: aplicar vacunas, nuevo paciente, incidencias e historial.
 * - Bitácora personal de vacunas administradas por este enfermero hoy.
 * - Panel lateral de biológicos y lotes en cadena de frío.
 */
@Component({
  selector: 'app-personal-salud-estacion-enfermero',
  imports: [RouterLink, FormsModule, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './estacion-enfermero.html',
  styleUrl: './estacion-enfermero.css',
})
export class PersonalSaludEstacionEnfermero {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly router = inject(Router);

  /** Cédula ingresada en el buscador rápido */
  protected readonly cedulaRapida = signal('');

  /** Datos del centro y enfermero activo */
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly enfermero = this.datosPS.enfermeroActual;
  protected readonly metricasEnfermero = this.datosPS.metricasEnfermero;
  protected readonly vacunasEnStock = this.datosPS.vacunasDisponibles;

  /** Inmunizaciones administradas específicamente por este enfermero hoy */
  protected readonly misAplicacionesHoy = computed(() => {
    const enf = this.enfermero();
    const apps = this.datosPS.aplicaciones();
    return apps.filter((a) => a.enfermeroId === enf.id);
  });

  /** Desglose de dosis pediátricas vs adultos en la jornada del enfermero */
  protected readonly desgloseDosis = computed(() => {
    const apps = this.misAplicacionesHoy();
    const menores = apps.filter((a) => a.esMenor).length;
    const adultos = apps.length - menores;
    return { menores, adultos };
  });

  /** Iniciales limpias del profesional para el avatar */
  protected readonly inicialesEnfermero = computed(() => {
    const limpio = this.enfermero().nombre.replace(/^(Dra\.|Dr\.|Lic\.|Enf\.)\s*/i, '');
    const partes = limpio.split(/\s+/).filter(Boolean);
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return (partes[0]?.slice(0, 2) ?? 'EN').toUpperCase();
  });

  /**
   * Ejecuta la búsqueda rápida de un paciente por cédula o abre el módulo de fichas.
   */
  protected buscarPacienteRapido(event: Event): void {
    event.preventDefault();
    const query = this.cedulaRapida().trim();
    if (query) {
      void this.router.navigate(['/PS/pacientes'], { queryParams: { q: query } });
    } else {
      void this.router.navigate(['/PS/pacientes']);
    }
  }

  /**
   * Abre directamente la ficha y carnet de un paciente desde la bitácora de atención.
   */
  protected irACarnetPaciente(cedula: string): void {
    void this.router.navigate(['/PS/pacientes'], { queryParams: { q: cedula } });
  }
}
