import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { AltaSubregion, SubregionVista } from '../../../../../nucleo/modelos/master';
import { DatosMasterService } from '../../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../../componentes/master-encabezado/master-encabezado';

const ALTA_VACIA: AltaSubregion = {
  nombre: '',
  estadoId: '',
  jefeNombre: '',
  jefeCedula: '',
  jefeCorreo: '',
};

@Component({
  selector: 'app-master-subregiones',
  imports: [MasterEncabezado, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subregiones.html',
  styleUrl: './subregiones.css',
})
export class MasterSubregiones {
  protected readonly datos = inject(DatosMasterService);
  private readonly router = inject(Router);

  protected readonly busqueda = signal('');
  protected readonly altaAbierta = signal(false);
  protected readonly alta = signal<AltaSubregion>({ ...ALTA_VACIA });
  protected readonly errorAlta = signal('');

  protected readonly resultados = computed(() => {
    const termino = this.normalizar(this.busqueda());

    return this.datos.subregiones().filter((fila) => {
      if (!termino) {
        return true;
      }

      return [
        fila.centro.nombre,
        fila.centro.codigo,
        fila.estado?.nombre ?? '',
        fila.jefe?.nombre ?? '',
      ].some((valor) => this.normalizar(valor).includes(termino));
    });
  });

  protected readonly estadosDisponibles = computed(() => {
    const ocupados = new Set(this.datos.subregiones().map((fila) => fila.centro.estadoId));
    return this.datos.estados().filter((estado) => !ocupados.has(estado.id));
  });

  protected readonly totalCentros = computed(() =>
    this.datos.subregiones().reduce((total, fila) => total + fila.centros, 0),
  );
  protected readonly totalEmpleados = computed(() =>
    this.datos.subregiones().reduce((total, fila) => total + fila.empleados, 0),
  );
  protected readonly formularioValido = computed(() => {
    const alta = this.alta();
    return Boolean(
      alta.nombre.trim() &&
      alta.estadoId &&
      alta.jefeNombre.trim() &&
      alta.jefeCedula.trim() &&
      alta.jefeCorreo.trim(),
    );
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected actualizar(campo: keyof AltaSubregion, valor: string): void {
    this.alta.update((alta) => ({ ...alta, [campo]: valor }));
  }

  protected abrirAlta(): void {
    this.alta.set({ ...ALTA_VACIA });
    this.errorAlta.set('');
    this.altaAbierta.set(true);
  }

  protected cerrarAlta(): void {
    this.altaAbierta.set(false);
    this.errorAlta.set('');
  }

  protected guardar(event: Event): void {
    event.preventDefault();

    if (!this.formularioValido()) {
      this.errorAlta.set('Completa el nombre, el estado y los datos del jefe de subregión.');
      return;
    }

    const creada = this.datos.crearSubregion(this.alta());
    if (!creada) {
      this.errorAlta.set('No se pudo crear la subregión con los datos seleccionados.');
      return;
    }

    this.altaAbierta.set(false);
    void this.router.navigate(['/master/personal/subregiones', creada.id]);
  }

  protected jefe(subregion: SubregionVista): string {
    return subregion.jefe?.nombre ?? 'Sin jefe asignado';
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
