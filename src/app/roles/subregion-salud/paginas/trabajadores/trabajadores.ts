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

import type { AltaEmpleado } from '../../../../nucleo/modelos/master';
import type { TrabajadorSubregionVista } from '../../../../nucleo/modelos/subregion-salud';
import { CatalogosService } from '../../../../nucleo/servicios/catalogos.service';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

type FiltroRol = 'todos' | 'jefe' | 'trabajador';

const ALTA_TRABAJADOR_VACIA: AltaEmpleado = {
  nombre: '',
  cedula: '',
  correo: '',
  telefono: '',
  profesionId: '',
  centroId: '',
  tipo: 'trabajador',
};

/**
 * Consulta y administración de registros del personal tipo 2 de los centros del estado.
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
  protected readonly catalogos = inject(CatalogosService);

  protected readonly termino = signal('');
  protected readonly centroId = signal('');
  protected readonly rol = signal<FiltroRol>('todos');

  protected readonly altaAbierta = signal(false);
  protected readonly alta = signal<AltaEmpleado>({ ...ALTA_TRABAJADOR_VACIA });
  protected readonly errorAlta = signal('');

  protected readonly formularioValido = computed(() => {
    const a = this.alta();
    return Boolean(
      a.nombre.trim() &&
        a.cedula.trim() &&
        a.correo.trim() &&
        a.profesionId &&
        a.centroId,
    );
  });

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

  protected abrirAlta(): void {
    const primerCentroId = this.datos.centros()[0]?.centro.id ?? '';
    const primeraProfesionId = this.catalogos.profesiones()[0]?.id ?? '';
    this.alta.set({
      ...ALTA_TRABAJADOR_VACIA,
      centroId: primerCentroId,
      profesionId: primeraProfesionId,
    });
    this.errorAlta.set('');
    this.altaAbierta.set(true);
  }

  protected cerrarAlta(): void {
    this.altaAbierta.set(false);
    this.errorAlta.set('');
  }

  protected actualizarAlta(campo: keyof AltaEmpleado, valor: string): void {
    this.alta.update((a) => ({ ...a, [campo]: valor }));
  }

  protected guardar(event: Event): void {
    event.preventDefault();

    if (!this.formularioValido()) {
      this.errorAlta.set('Completa el nombre, cédula, correo, profesión y centro de salud.');
      return;
    }

    const creado = this.datos.crearTrabajador(this.alta());
    if (!creado) {
      this.errorAlta.set('No se pudo registrar el personal en el centro seleccionado.');
      return;
    }

    this.altaAbierta.set(false);
    this.alta.set({ ...ALTA_TRABAJADOR_VACIA });
    this.errorAlta.set('');
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
