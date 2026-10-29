import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { EstadoLote } from '../../../../nucleo/modelos/enumeraciones';
import { CatalogosService } from '../../../../nucleo/servicios/catalogos.service';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../componentes/master-encabezado/master-encabezado';

@Component({
  selector: 'app-master-vacunas',
  imports: [MasterEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vacunas.html',
  styleUrl: './vacunas.css',
})
export class MasterVacunas {
  protected readonly datos = inject(DatosMasterService);
  private readonly catalogos = inject(CatalogosService);

  protected readonly enCamino = computed(() =>
    this.datos.lotes().filter((lote) => lote.estado === 'en_camino'),
  );
  protected readonly reportados = computed(() =>
    this.datos.lotes().filter((lote) => lote.estado === 'reportado'),
  );
  protected readonly aceptados = computed(() =>
    this.datos.lotes().filter((lote) => lote.estado === 'aceptado'),
  );

  protected etiquetaLote(estado: EstadoLote): string {
    return this.catalogos.estadosLote().find((item) => item.id === estado)?.nombre ?? estado;
  }

  protected responsable(id: string): string {
    return this.datos.personal(id)?.nombre ?? 'Sin responsable';
  }
}
