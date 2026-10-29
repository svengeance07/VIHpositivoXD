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

import type { TrabajadorSubregionVista } from '../../../../nucleo/modelos/subregion-salud';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

type FiltroRol = 'todos' | 'jefe' | 'trabajador';

/**
 * Consulta de registros del personal tipo 2 de los centros del estado.
 * La subregión solo lee la información; el alta y la edición siguen siendo
 * responsabilidad del master.
 */
@Component({
  selector: 'app-subregion-salud-trabajadores',
  imports: [SrsEncabezado, RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trabajadores.html',
  styleUrl: './trabajadores.css',
})
export class SubregionSaludTrabajadores {
  protected readonly datos = inject(DatosSubregionSaludService);

  protected readonly termino = signal('');
  protected readonly centroId = signal('');
  protected readonly rol = signal<FiltroRol>('todos');

  protected readonly resultados = computed<readonly TrabajadorSubregionVista[]>(() => {
    const termino = this.normalizar(this.termino());
    const centroId = this.centroId();
    const rol = this.rol();

    return this.datos.trabajadores().filter((trabajador) => {
      if (centroId && trabajador.personal.centroId !== centroId) {
        return false;
      }
      if (rol === 'jefe' && !trabajador.esJefe) {
        return false;
      }
      if (rol === 'trabajador' && trabajador.esJefe) {
        return false;
      }
      if (!termino) {
        return true;
      }

      const texto = this.normalizar(
        [
          trabajador.personal.nombre,
          trabajador.personal.cedula,
          trabajador.personal.correo,
          trabajador.personal.idProfesional,
          trabajador.profesion,
          trabajador.centro.nombre,
        ].join(' '),
      );

      return texto.includes(termino);
    });
  });

  protected readonly conteoJefes = computed(
    () => this.datos.trabajadores().filter((trabajador) => trabajador.esJefe).length,
  );

  protected readonly conteoTrabajadores = computed(
    () => this.datos.trabajadores().filter((trabajador) => !trabajador.esJefe).length,
  );

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected limpiar(): void {
    this.termino.set('');
    this.centroId.set('');
    this.rol.set('todos');
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
