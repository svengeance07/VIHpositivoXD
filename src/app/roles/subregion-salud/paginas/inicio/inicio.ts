import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NotificacionSrs } from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SesionService } from '../../../../nucleo/servicios/sesion.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

/**
 * Panel de control de la Subregión de Salud.
 *
 * Resume el personal tipo 2, los centros del estado, la cobertura de requisitos
 * y los dos flujos que atiende la subregión: certificados y notificaciones.
 */
@Component({
  selector: 'app-subregion-salud-inicio',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class SubregionSaludInicio {
  protected readonly datos = inject(DatosSubregionSaludService);
  private readonly sesion = inject(SesionService);

  protected readonly nombre = computed(
    () => this.sesion.sesion()?.perfil?.nombre ?? 'Lic. Carlos Rojas',
  );

  protected readonly solicitudesPendientes = computed(() =>
    this.datos.solicitudesPendientes().slice(0, 4),
  );

  protected readonly notificaciones = this.datos.notificacionesRecientes;

  protected readonly promedioRequisitos = computed(() => {
    const fichas = this.datos.fichas();
    if (fichas.length === 0) {
      return 0;
    }

    return Math.round(
      fichas.reduce((total, ficha) => total + ficha.porcentajeRequisitos, 0) / fichas.length,
    );
  });

  protected marcarLeida(notificacion: NotificacionSrs): void {
    if (!notificacion.leida) {
      this.datos.marcarNotificacionLeida(notificacion.id);
    }
  }
}
