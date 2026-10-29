import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SesionService } from '../../../../nucleo/servicios/sesion.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

/**
 * Detalle de una solicitud de certificado.
 *
 * Permite revisar los requisitos, autorizar o descartar la creación del
 * certificado y, una vez autorizado, emitirlo. El envío al correo se solicita
 * desde la consulta pública y aquí solo se muestra como referencia.
 */
@Component({
  selector: 'app-subregion-salud-certificado-detalle',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certificado-detalle.html',
  styleUrl: './certificado-detalle.css',
})
export class SubregionSaludCertificadoDetalle {
  protected readonly datos = inject(DatosSubregionSaludService);
  private readonly sesion = inject(SesionService);
  private readonly route = inject(ActivatedRoute);

  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((parametros) => parametros.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly solicitud = computed(() => this.datos.solicitud(this.id()));

  protected readonly motivo = signal('');
  protected readonly error = signal('');
  protected readonly exito = signal('');

  protected readonly revisor = computed(
    () => this.sesion.sesion()?.perfil?.nombre ?? 'Lic. Carlos Rojas',
  );

  protected valor(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  protected autorizar(): void {
    this.error.set('');
    this.exito.set('');

    const actualizada = this.datos.revisarSolicitud(
      this.id(),
      'autorizado',
      this.motivo(),
      this.revisor(),
    );

    if (!actualizada) {
      this.error.set('No se pudo autorizar la solicitud. Verifica que siga pendiente.');
      return;
    }

    this.motivo.set('');
    this.exito.set('La solicitud fue autorizada. El certificado ya puede emitirse.');
  }

  protected descartar(): void {
    this.error.set('');
    this.exito.set('');

    if (!this.motivo().trim()) {
      this.error.set('Indica el motivo del descarte antes de continuar.');
      return;
    }

    const actualizada = this.datos.revisarSolicitud(
      this.id(),
      'descartado',
      this.motivo(),
      this.revisor(),
    );

    if (!actualizada) {
      this.error.set('No se pudo descartar la solicitud. Verifica que siga pendiente.');
      return;
    }

    this.exito.set('La solicitud fue descartada y el motivo quedó registrado.');
  }

  protected emitir(): void {
    this.error.set('');
    this.exito.set('');

    const emitida = this.datos.emitirSolicitud(this.id(), this.revisor());

    if (!emitida) {
      this.error.set('No se pudo emitir el certificado. Verifica que esté autorizado.');
      return;
    }

    this.exito.set(
      'El certificado fue emitido. El ciudadano ya puede solicitar el envío desde la consulta pública.',
    );
  }
}
