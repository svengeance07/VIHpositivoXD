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
 * Dashboard Principal del Centro de Salud (/PS/inicio).
 *
 * Primera vista operativa del rol Personal de Salud:
 * - Adapta su contenido e indicadores según el perfil (Jefe de Centro vs Enfermero).
 * - Muestra métricas clave en tiempo real con Signals (dosis aplicadas, pacientes, incidencias).
 * - Provee un hub de acciones inmediatas: consultar paciente, registrar dosis, nuevo paciente y reportar ESAVI.
 * - Incluye una tabla en vivo con las últimas inmunizaciones aplicadas en el centro.
 * - Exhibe la barra de distribución de biológicos aplicados y las alertas de eventos adversos.
 */
@Component({
  selector: 'app-personal-salud-inicio',
  imports: [RouterLink, FormsModule, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class PersonalSaludInicio {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly router = inject(Router);

  /** Cédula ingresada en el buscador rápido del dashboard */
  protected readonly cedulaRapida = signal('');

  /** Perfil y estado del centro */
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);
  protected readonly enfermero = this.datosPS.enfermeroActual;

  /** Métricas reactivas del centro */
  protected readonly metricasCentro = this.datosPS.metricasCentro;
  protected readonly personalEnfermeria = this.datosPS.enfermeros;

  /** Listado de aplicaciones generales del centro */
  protected readonly ultimasAplicaciones = this.datosPS.ultimasAplicaciones;

  /** Saludo personalizado */
  protected readonly saludoUsuario = computed(() => {
    if (this.esJefe()) {
      return 'Dra. María Pérez';
    }
    return `${this.enfermero().nombre} (Enfermería)`;
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
   * Conmuta el perfil en caliente para evaluar las dos vistas requeridas por el usuario.
   */
  protected cambiarModo(modo: 'jefe' | 'enfermero'): void {
    this.datosPS.setModoManual(modo);
  }
}
