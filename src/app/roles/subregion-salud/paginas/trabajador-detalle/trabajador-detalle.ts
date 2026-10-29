import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

/** Ficha de consulta de un trabajador tipo 2 de la subregión. */
@Component({
  selector: 'app-subregion-salud-trabajador-detalle',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trabajador-detalle.html',
  styleUrl: './trabajador-detalle.css',
})
export class SubregionSaludTrabajadorDetalle {
  protected readonly datos = inject(DatosSubregionSaludService);
  private readonly route = inject(ActivatedRoute);

  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((parametros) => parametros.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly trabajador = computed(() => this.datos.trabajador(this.id()));

  protected readonly centro = computed(() => {
    const trabajador = this.trabajador();
    return trabajador ? this.datos.centro(trabajador.centro.id) : null;
  });

  protected readonly companeros = computed(() => {
    const trabajador = this.trabajador();
    if (!trabajador) {
      return [];
    }

    return this.datos
      .trabajadores()
      .filter(
        (companero) =>
          companero.personal.centroId === trabajador.centro.id &&
          companero.personal.id !== trabajador.personal.id,
      );
  });
}
