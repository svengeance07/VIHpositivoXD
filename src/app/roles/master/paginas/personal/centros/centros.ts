import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { AltaCentro, CentroVista } from '../../../../../nucleo/modelos/master';
import { DatosMasterService } from '../../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../../componentes/master-encabezado/master-encabezado';

interface FiltrosCentro {
  nombre: string;
  codigo: string;
  estadoId: string;
  municipioId: string;
  parroquiaId: string;
}

const FILTROS_VACIOS: FiltrosCentro = {
  nombre: '',
  codigo: '',
  estadoId: '',
  municipioId: '',
  parroquiaId: '',
};

const ALTA_VACIA: AltaCentro = {
  nombre: '',
  codigo: '',
  estadoId: '',
  municipioId: '',
  parroquiaId: '',
  jefeNombre: '',
  jefeCedula: '',
  jefeCorreo: '',
};

@Component({
  selector: 'app-master-centros',
  imports: [MasterEncabezado, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './centros.html',
  styleUrl: './centros.css',
})
export class MasterCentros {
  protected readonly datos = inject(DatosMasterService);
  private readonly router = inject(Router);

  protected readonly filtros = signal<FiltrosCentro>({ ...FILTROS_VACIOS });
  protected readonly altaAbierta = signal(false);
  protected readonly alta = signal<AltaCentro>({ ...ALTA_VACIA });
  protected readonly errorAlta = signal('');

  protected readonly municipios = computed(() =>
    this.datos.municipiosDeEstado(this.filtros().estadoId),
  );
  protected readonly parroquias = computed(() =>
    this.datos.parroquiasDeMunicipio(this.filtros().municipioId),
  );
  protected readonly municipiosAlta = computed(() =>
    this.datos.municipiosDeEstado(this.alta().estadoId),
  );
  protected readonly parroquiasAlta = computed(() =>
    this.datos.parroquiasDeMunicipio(this.alta().municipioId),
  );

  protected readonly resultados = computed(() => {
    const filtros = this.filtros();
    const nombre = this.normalizar(filtros.nombre);
    const codigo = this.normalizar(filtros.codigo);

    return this.datos.centrosVista().filter((fila) => {
      if (nombre && !this.normalizar(fila.centro.nombre).includes(nombre)) {
        return false;
      }
      if (codigo && !this.normalizar(fila.centro.codigo).includes(codigo)) {
        return false;
      }
      if (filtros.estadoId && fila.centro.estadoId !== filtros.estadoId) {
        return false;
      }
      if (filtros.municipioId && fila.centro.municipioId !== filtros.municipioId) {
        return false;
      }
      if (filtros.parroquiaId && fila.centro.parroquiaId !== filtros.parroquiaId) {
        return false;
      }
      return true;
    });
  });

  protected readonly formularioValido = computed(() => {
    const alta = this.alta();
    return Boolean(
      alta.nombre.trim() &&
      alta.codigo.trim() &&
      alta.estadoId &&
      alta.municipioId &&
      alta.parroquiaId &&
      alta.jefeNombre.trim() &&
      alta.jefeCedula.trim() &&
      alta.jefeCorreo.trim(),
    );
  });

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected actualizar(campo: keyof FiltrosCentro, valor: string): void {
    this.filtros.update((filtros) => {
      if (campo === 'estadoId') {
        return { ...filtros, estadoId: valor, municipioId: '', parroquiaId: '' };
      }
      if (campo === 'municipioId') {
        return { ...filtros, municipioId: valor, parroquiaId: '' };
      }
      return { ...filtros, [campo]: valor };
    });
  }

  protected actualizarAlta(campo: keyof AltaCentro, valor: string): void {
    this.alta.update((alta) => {
      if (campo === 'estadoId') {
        return { ...alta, estadoId: valor, municipioId: '', parroquiaId: '' };
      }
      if (campo === 'municipioId') {
        return { ...alta, municipioId: valor, parroquiaId: '' };
      }
      return { ...alta, [campo]: valor };
    });
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
      this.errorAlta.set('Completa la ubicación, el código y los datos del jefe del centro.');
      return;
    }

    const creado = this.datos.crearCentro(this.alta());
    if (!creado) {
      this.errorAlta.set('No se pudo crear el centro con los datos seleccionados.');
      return;
    }

    this.altaAbierta.set(false);
    void this.router.navigate(['/master/personal/centros', creado.id]);
  }

  protected jefe(fila: CentroVista): string {
    return fila.jefe?.nombre ?? 'Sin jefe asignado';
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
