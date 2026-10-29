import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SesionService } from '../../../../nucleo/servicios/sesion.service';
import { CatalogosService } from '../../../../nucleo/servicios/catalogos.service';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import type { EstadoLote } from '../../../../nucleo/modelos/enumeraciones';
import { MasterEncabezado } from '../../componentes/master-encabezado/master-encabezado';

@Component({
  selector: 'app-master-inicio',
  imports: [MasterEncabezado, RouterLink, DatePipe, DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class MasterInicio {
  private readonly sesion = inject(SesionService);
  private readonly catalogos = inject(CatalogosService);
  protected readonly datos = inject(DatosMasterService);

  protected readonly lotesFijados = signal(false);

  protected readonly nombre = computed(
    () => this.sesion.sesion()?.nombreUsuario ?? this.sesion.sesion()?.nombre ?? 'master',
  );

  protected readonly topEstados = computed(() => {
    const filas = this.datos.vacunacionesSemana().slice(0, 10);
    const maximo = Math.max(...filas.map((fila) => fila.total), 1);

    return filas.map((fila) => ({
      ...fila,
      nombre: this.datos.nombreEstado(fila.estadoId),
      porcentaje: Math.max(4, Math.round((fila.total / maximo) * 100)),
    }));
  });

  protected etiquetaLote(estado: EstadoLote): string {
    return this.catalogos.estadosLote().find((item) => item.id === estado)?.nombre ?? estado;
  }

  protected alternarLotes(): void {
    this.lotesFijados.update((valor) => !valor);
  }
}
