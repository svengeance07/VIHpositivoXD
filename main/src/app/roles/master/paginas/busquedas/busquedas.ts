import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../componentes/master-encabezado/master-encabezado';

@Component({
  selector: 'app-master-busquedas',
  imports: [MasterEncabezado, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './busquedas.html',
  styleUrl: './busquedas.css',
})
export class MasterBusquedas {
  protected readonly datos = inject(DatosMasterService);

  protected readonly busqueda = signal('');
  protected readonly rol = signal('');

  protected readonly resultados = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const rol = this.rol();

    return this.datos.busquedas().filter((busqueda) => {
      if (rol && busqueda.rol !== rol) {
        return false;
      }
      if (!termino) {
        return true;
      }

      return [busqueda.usuario, busqueda.rol, busqueda.filtros, busqueda.origen].some((valor) =>
        this.normalizar(valor).includes(termino),
      );
    });
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected limpiar(): void {
    this.busqueda.set('');
    this.rol.set('');
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
