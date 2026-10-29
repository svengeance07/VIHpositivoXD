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

import type {
  NotificacionSrs,
  TipoNotificacionSrs,
} from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

type FiltroLectura = 'todas' | 'no_leidas';
type FiltroTipo = 'todos' | TipoNotificacionSrs;

/**
 * Bandeja de notificaciones de la subregión.
 * Solo muestra eventos de personas y centros del estado asignado. Las acciones
 * del flujo de certificados agregan notificaciones nuevas automáticamente.
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
  protected readonly tipo = signal<FiltroTipo>('todos');

  protected readonly conteos = computed(() => {
    const notificaciones = this.datos.notificaciones();

    return {
      total: notificaciones.length,
      noLeidas: notificaciones.filter((notificacion) => !notificacion.leida).length,
      esavi: notificaciones.filter((notificacion) => notificacion.tipo === 'esavi').length,
      certificado: notificaciones.filter((notificacion) => notificacion.tipo === 'certificado')
        .length,
      expediente: notificaciones.filter((notificacion) => notificacion.tipo === 'expediente')
        .length,
      sistema: notificaciones.filter((notificacion) => notificacion.tipo === 'sistema').length,
    };
  });

  protected readonly resultados = computed<readonly NotificacionSrs[]>(() => {
    const lectura = this.lectura();
    const tipo = this.tipo();

    return this.datos.notificaciones().filter((notificacion) => {
      if (lectura === 'no_leidas' && notificacion.leida) {
        return false;
      }
      if (tipo !== 'todos' && notificacion.tipo !== tipo) {
        return false;
      }

      return true;
    });
  });

  protected readonly hayFiltros = computed(
    () => this.lectura() !== 'todas' || this.tipo() !== 'todos',
  );

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
    this.tipo.set('todos');
  }

  protected icono(notificacion: NotificacionSrs): string {
    switch (notificacion.tipo) {
      case 'esavi':
        return 'warning';
      case 'certificado':
        return 'check';
      case 'expediente':
        return 'clipboard';
      case 'sistema':
        return 'feedback';
    }
  }
}
