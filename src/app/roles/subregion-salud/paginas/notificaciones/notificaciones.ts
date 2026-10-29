import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NotificacionSrs } from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

type FiltroLectura = 'todas' | 'no_leidas';

/**
 * Bandeja de notificaciones de la subregión.
 *
 * Solo muestra solicitudes de certificado que ya reúnen todos los requisitos y
 * esperan la revisión de la subregión. No hay avisos por vencimientos clínicos.
 */
@Component({
  selector: 'app-subregion-salud-notificaciones',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class SubregionSaludNotificaciones {
  protected readonly datos = inject(DatosSubregionSaludService);

  protected readonly lectura = signal<FiltroLectura>('todas');

  protected readonly conteos = computed(() => {
    const notificaciones = this.datos.notificaciones();

    return {
      total: notificaciones.length,
      noLeidas: notificaciones.filter((notificacion) => !notificacion.leida).length,
      leidas: notificaciones.filter((notificacion) => notificacion.leida).length,
      alta: notificaciones.filter((notificacion) => notificacion.prioridad === 'alta').length,
    };
  });

  protected readonly resultados = computed<readonly NotificacionSrs[]>(() => {
    const lectura = this.lectura();

    return this.datos.notificaciones().filter((notificacion) => {
      if (lectura === 'no_leidas' && notificacion.leida) {
        return false;
      }

      return true;
    });
  });

  protected readonly hayFiltros = computed(() => this.lectura() !== 'todas');

  protected marcarLeida(notificacion: NotificacionSrs): void {
    if (!notificacion.leida) {
      this.datos.marcarNotificacionLeida(notificacion.id);
    }
  }

  protected marcarTodas(): void {
    this.datos.marcarTodasLeidas();
  }

  protected limpiar(): void {
    this.lectura.set('todas');
  }

  protected icono(notificacion: NotificacionSrs): string {
    return notificacion.prioridad === 'alta' ? 'warning' : 'clipboard';
  }
}
