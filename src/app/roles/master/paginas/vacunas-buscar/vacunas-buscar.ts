import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { EstadoLote } from '../../../../nucleo/modelos/enumeraciones';
import type { LoteVacuna } from '../../../../nucleo/modelos/master';
import { CatalogosService } from '../../../../nucleo/servicios/catalogos.service';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../componentes/master-encabezado/master-encabezado';

interface FiltrosLote {
  codigo: string;
  vacunaId: string;
  estado: string;
  destinoCentroId: string;
}

const FILTROS_VACIOS: FiltrosLote = {
  codigo: '',
  vacunaId: '',
  estado: '',
  destinoCentroId: '',
};

@Component({
  selector: 'app-master-vacunas-buscar',
  imports: [MasterEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vacunas-buscar.html',
  styleUrl: './vacunas-buscar.css',
})
export class MasterVacunasBuscar {
  protected readonly datos = inject(DatosMasterService);
  protected readonly catalogos = inject(CatalogosService);

  protected readonly filtros = signal<FiltrosLote>({ ...FILTROS_VACIOS });
  protected readonly seleccionado = signal<LoteVacuna | null>(null);

  protected readonly resultados = computed(() => {
    const filtros = this.filtros();
    const codigo = filtros.codigo.trim().toLowerCase();

    return this.datos.lotes().filter((lote) => {
      if (codigo && !lote.codigo.toLowerCase().includes(codigo)) {
        return false;
      }
      if (filtros.vacunaId && lote.vacunaId !== filtros.vacunaId) {
        return false;
      }
      if (filtros.estado && lote.estado !== filtros.estado) {
        return false;
      }
      if (filtros.destinoCentroId && lote.destinoCentroId !== filtros.destinoCentroId) {
        return false;
      }
      return true;
    });
  });

  protected readonly totalDosis = computed(() =>
    this.resultados().reduce((total, lote) => total + lote.dosis, 0),
  );

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected actualizar(campo: keyof FiltrosLote, valor: string): void {
    this.filtros.update((filtros) => ({ ...filtros, [campo]: valor }));
  }

  protected limpiar(): void {
    this.filtros.set({ ...FILTROS_VACIOS });
  }

  protected etiquetaLote(estado: EstadoLote): string {
    return this.catalogos.estadosLote().find((item) => item.id === estado)?.nombre ?? estado;
  }

  protected responsable(id: string): string {
    return this.datos.personal(id)?.nombre ?? 'Sin responsable';
  }

  protected abrirDetalle(lote: LoteVacuna): void {
    this.seleccionado.set(lote);
  }

  protected cerrarDetalle(): void {
    this.seleccionado.set(null);
  }
}
