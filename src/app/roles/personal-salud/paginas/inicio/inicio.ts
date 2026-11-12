<<<<<<< Updated upstream
import { ChangeDetectionStrategy, Component } from '@angular/core';
=======
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
>>>>>>> Stashed changes

import { PaginaEnConstruccion } from '../../../../compartido/ui/pagina-en-construccion/pagina-en-construccion';

<<<<<<< Updated upstream
@Component({
  selector: 'app-personal-salud-inicio',
  imports: [PaginaEnConstruccion],
=======
/**
 * Dashboard Principal del Centro de Salud (/PS/inicio).
 */
@Component({
  selector: 'app-personal-salud-inicio',
  imports: [RouterLink, FormsModule, PsEncabezado],
>>>>>>> Stashed changes
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-en-construccion
      titulo="Panel del centro de salud"
      subtitulo="Aquí irán la gestión de pacientes, la vacunación y los certificados del centro."
    />
  `,
})
<<<<<<< Updated upstream
export class PersonalSaludInicio {}
=======
export class PersonalSaludInicio {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  /** Cédula ingresada en el buscador rápido del dashboard */
  protected readonly cedulaRapida = signal('');

  /** Perfil y estado del centro */
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly nombreCentro = computed(
    () => this.sesion.sesion()?.entidad ?? this.datosPS.centroNombre,
  );
  protected readonly enfermero = this.datosPS.enfermeroActual;

  /** Métricas reactivas del centro */
  protected readonly metricasCentro = this.datosPS.metricasCentro;
  protected readonly personalEnfermeria = this.datosPS.enfermeros;

  /** Listado de aplicaciones generales del centro */
  protected readonly ultimasAplicaciones = this.datosPS.ultimasAplicaciones;

  /** Saludo personalizado */
  protected readonly saludoUsuario = computed(
    () => this.sesion.sesion()?.nombre ?? this.enfermero().nombre,
  );

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
}
>>>>>>> Stashed changes
