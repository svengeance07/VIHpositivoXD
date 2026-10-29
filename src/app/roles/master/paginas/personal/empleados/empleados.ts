import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { AltaEmpleado, PersonalVista } from '../../../../../nucleo/modelos/master';
import { CatalogosService } from '../../../../../nucleo/servicios/catalogos.service';
import { DatosMasterService } from '../../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../../componentes/master-encabezado/master-encabezado';

interface FiltrosEmpleado {
  nombre: string;
  cedula: string;
  tipo: string;
  centroId: string;
  estadoId: string;
  municipioId: string;
  parroquiaId: string;
}

const FILTROS_VACIOS: FiltrosEmpleado = {
  nombre: '',
  cedula: '',
  tipo: '',
  centroId: '',
  estadoId: '',
  municipioId: '',
  parroquiaId: '',
};

const ALTA_VACIA: AltaEmpleado = {
  nombre: '',
  cedula: '',
  correo: '',
  telefono: '',
  profesionId: '',
  centroId: '',
  tipo: 'trabajador',
};

@Component({
  selector: 'app-master-empleados',
  imports: [MasterEncabezado, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empleados.html',
  styleUrl: './empleados.css',
})
export class MasterEmpleados {
  protected readonly datos = inject(DatosMasterService);
  protected readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);

  protected readonly filtros = signal<FiltrosEmpleado>({ ...FILTROS_VACIOS });
  protected readonly altaAbierta = signal(false);
  protected readonly alta = signal<AltaEmpleado>({ ...ALTA_VACIA });
  protected readonly errorAlta = signal('');

  protected readonly municipios = computed(() =>
    this.datos.municipiosDeEstado(this.filtros().estadoId),
  );

  protected readonly parroquias = computed(() =>
    this.datos.parroquiasDeMunicipio(this.filtros().municipioId),
  );

  protected readonly resultados = computed(() => {
    const filtros = this.filtros();
    const nombre = this.normalizar(filtros.nombre);
    const cedula = this.normalizar(filtros.cedula);

    return this.datos.personalVista().filter((fila) => {
      if (
        nombre &&
        !this.normalizar(fila.personal.nombre).includes(nombre) &&
        !this.normalizar(fila.profesion).includes(nombre)
      ) {
        return false;
      }
      if (cedula && !this.normalizar(fila.personal.cedula).includes(cedula)) {
        return false;
      }
      if (filtros.tipo === 'jefe' && !fila.esJefe) {
        return false;
      }
      if (filtros.tipo === 'trabajador' && fila.esJefe) {
        return false;
      }
      if (filtros.centroId && fila.personal.centroId !== filtros.centroId) {
        return false;
      }
      if (filtros.estadoId && fila.estado?.id !== filtros.estadoId) {
        return false;
      }
      if (filtros.municipioId && fila.municipio?.id !== filtros.municipioId) {
        return false;
      }
      if (filtros.parroquiaId && fila.parroquia?.id !== filtros.parroquiaId) {
        return false;
      }
      return true;
    });
  });

  protected readonly formularioValido = computed(() => {
    const alta = this.alta();
    return Boolean(
      alta.nombre.trim() &&
      alta.cedula.trim() &&
      alta.correo.trim() &&
      alta.profesionId &&
      alta.centroId,
    );
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected actualizar(campo: keyof FiltrosEmpleado, valor: string): void {
    this.filtros.update((filtros) => {
      if (campo === 'estadoId') {
        return { ...filtros, estadoId: valor, municipioId: '', parroquiaId: '', centroId: '' };
      }
      if (campo === 'municipioId') {
        return { ...filtros, municipioId: valor, parroquiaId: '', centroId: '' };
      }
      return { ...filtros, [campo]: valor };
    });
  }

  protected actualizarAlta(campo: keyof AltaEmpleado, valor: string): void {
    this.alta.update((alta) => ({ ...alta, [campo]: valor }));
  }

  protected limpiar(): void {
    this.filtros.set({ ...FILTROS_VACIOS });
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
      this.errorAlta.set('Completa el nombre, la cédula, el correo, la profesión y el centro.');
      return;
    }

    const creado = this.datos.crearEmpleado(this.alta());
    if (!creado) {
      this.errorAlta.set('No se pudo registrar el empleado en el centro seleccionado.');
      return;
    }

    this.altaAbierta.set(false);
    void this.router.navigate(['/master/personal/empleados', creado.id]);
  }

  protected tipo(fila: PersonalVista): string {
    return fila.esJefe ? 'Jefe' : 'Trabajador';
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
