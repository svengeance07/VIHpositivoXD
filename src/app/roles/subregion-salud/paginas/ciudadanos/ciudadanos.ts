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
  FichaCiudadano,
  SolicitudCertificadoVista,
} from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

type FiltroCiudadano = 'todos' | 'aptos' | 'vencidos' | 'incompletos';

interface FilaCiudadano {
  readonly ficha: FichaCiudadano;
  readonly solicitud: SolicitudCertificadoVista | null;
}

/**
 * Búsqueda de ciudadanos del estado asignado.
 * Cada resultado abre una ficha con vacunas, exámenes, requisitos y trazabilidad.
 */
@Component({
  selector: 'app-subregion-salud-ciudadanos',
  imports: [SrsEncabezado, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ciudadanos.html',
  styleUrl: './ciudadanos.css',
})
export class SubregionSaludCiudadanos {
  protected readonly datos = inject(DatosSubregionSaludService);

  protected readonly termino = signal('');
  protected readonly filtro = signal<FiltroCiudadano>('todos');

  protected readonly filas = computed<readonly FilaCiudadano[]>(() =>
    this.datos.fichas().map((ficha) => ({
      ficha,
      solicitud: this.datos.solicitudActivaDeCiudadano(ficha.ciudadano.id),
    })),
  );

  protected readonly conteos = computed(() => {
    const filas = this.filas();

    return {
      todos: filas.length,
      aptos: filas.filter((fila) => fila.ficha.aptoCertificado).length,
      vencidos: filas.filter(
        (fila) => fila.ficha.vacunasVencidas > 0 || fila.ficha.examenesVencidos > 0,
      ).length,
      incompletos: filas.filter(
        (fila) =>
          !fila.ficha.aptoCertificado &&
          fila.ficha.vacunasVencidas === 0 &&
          fila.ficha.examenesVencidos === 0,
      ).length,
    };
  });

  protected readonly resultados = computed<readonly FilaCiudadano[]>(() => {
    const termino = this.normalizar(this.termino());
    const filtro = this.filtro();

    return this.filas().filter(({ ficha }) => {
      const cumpleFiltro =
        filtro === 'todos' ||
        (filtro === 'aptos' && ficha.aptoCertificado) ||
        (filtro === 'vencidos' && (ficha.vacunasVencidas > 0 || ficha.examenesVencidos > 0)) ||
        (filtro === 'incompletos' &&
          !ficha.aptoCertificado &&
          ficha.vacunasVencidas === 0 &&
          ficha.examenesVencidos === 0);

      if (!cumpleFiltro) {
        return false;
      }

      if (!termino) {
        return true;
      }

      const texto = this.normalizar(
        [ficha.nombre, ficha.ciudadano.cedula, ficha.correo, ficha.telefono, ficha.ubicacion].join(
          ' ',
        ),
      );

      return texto.includes(termino);
    });
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected limpiar(): void {
    this.termino.set('');
    this.filtro.set('todos');
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
