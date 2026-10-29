import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import type { TipoHitoFicha } from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

/**
 * Ficha ciudadana del estado: perfil, vacunas, exámenes, requisitos del
 * certificado y línea de tiempo de los hitos del expediente.
 */
@Component({
  selector: 'app-subregion-salud-ciudadano-detalle',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ciudadano-detalle.html',
  styleUrl: './ciudadano-detalle.css',
})
export class SubregionSaludCiudadanoDetalle {
  protected readonly datos = inject(DatosSubregionSaludService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((parametros) => parametros.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly ficha = computed(() => this.datos.ficha(this.id()));

  protected readonly solicitudes = computed(() => this.datos.solicitudesDeCiudadano(this.id()));

  protected readonly solicitudActiva = computed(() =>
    this.datos.solicitudActivaDeCiudadano(this.id()),
  );

  protected readonly solicitudesRecientes = computed(() => this.solicitudes().slice(0, 3));

  protected solicitarCertificado(): void {
    const solicitud = this.datos.crearSolicitudCertificado(this.id());

    if (solicitud) {
      void this.router.navigate(['/SRS/certificados', solicitud.id]);
    }
  }

  protected iconoHito(tipo: TipoHitoFicha): string {
    switch (tipo) {
      case 'vacuna':
        return 'check';
      case 'examen':
        return 'clipboard';
      case 'perfil':
        return 'feedback';
      case 'certificado':
        return 'check';
    }
  }
}
