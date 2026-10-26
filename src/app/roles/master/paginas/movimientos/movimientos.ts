import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import type { TipoMovimiento } from '../../../../nucleo/modelos/master';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../componentes/master-encabezado/master-encabezado';

@Component({
  selector: 'app-master-movimientos',
  imports: [MasterEncabezado, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
})
export class MasterMovimientos {
  protected readonly datos = inject(DatosMasterService);

  protected readonly busqueda = signal('');
  protected readonly tipo = signal('');

  protected readonly resultados = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const tipo = this.tipo();

    return this.datos.movimientos().filter((movimiento) => {
      if (tipo && movimiento.tipo !== tipo) {
        return false;
      }
      if (!termino) {
        return true;
      }

      return [
        movimiento.actor,
        movimiento.rol,
        movimiento.modulo,
        movimiento.detalle,
        movimiento.entidad,
      ].some((valor) => this.normalizar(valor).includes(termino));
    });
  });

  protected readonly conteos = computed(() => {
    const movimientos = this.datos.movimientos();
    return {
      total: movimientos.length,
      creaciones: movimientos.filter((movimiento) => movimiento.tipo === 'creacion').length,
      actualizaciones: movimientos.filter((movimiento) => movimiento.tipo === 'actualizacion')
        .length,
      accesos: movimientos.filter((movimiento) => movimiento.tipo === 'acceso').length,
    };
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected limpiar(): void {
    this.busqueda.set('');
    this.tipo.set('');
  }

  protected etiquetaTipo(tipo: TipoMovimiento): string {
    const etiquetas: Record<TipoMovimiento, string> = {
      creacion: 'Creación',
      actualizacion: 'Actualización',
      acceso: 'Acceso',
      eliminacion: 'Eliminación',
    };

    return etiquetas[tipo];
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
