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

import type { EstadoCertificado } from '../../../../nucleo/modelos/enumeraciones';
import type { SolicitudCertificadoVista } from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

type FiltroCertificado = 'todas' | EstadoCertificado;

/**
 * Bandeja de certificados de salud de la subregión.
 * Desde aquí se abren las solicitudes para revisar requisitos, autorizar o
 * descartar su creación y, después, emitir el documento.
 */
@Component({
  selector: 'app-subregion-salud-certificados',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certificados.html',
  styleUrl: './certificados.css',
})
export class SubregionSaludCertificados {
  protected readonly datos = inject(DatosSubregionSaludService);

  protected readonly termino = signal('');
  protected readonly filtro = signal<FiltroCertificado>('todas');

  protected readonly conteos = computed(() => {
    const solicitudes = this.datos.solicitudes();

    return {
      todas: solicitudes.length,
      solicitado: solicitudes.filter((solicitud) => solicitud.estado === 'solicitado').length,
      autorizado: solicitudes.filter((solicitud) => solicitud.estado === 'autorizado').length,
      emitido: solicitudes.filter((solicitud) => solicitud.estado === 'emitido').length,
      descartado: solicitudes.filter((solicitud) => solicitud.estado === 'descartado').length,
    };
  });

  protected readonly resultados = computed<readonly SolicitudCertificadoVista[]>(() => {
    const termino = this.normalizar(this.termino());
    const filtro = this.filtro();

    return this.datos.solicitudes().filter((solicitud) => {
      if (filtro !== 'todas' && solicitud.estado !== filtro) {
        return false;
      }

      if (!termino) {
        return true;
      }

      return this.normalizar(
        [solicitud.codigo, solicitud.nombreCiudadano, solicitud.cedula, solicitud.correo].join(' '),
      ).includes(termino);
    });
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected limpiar(): void {
    this.termino.set('');
    this.filtro.set('todas');
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
