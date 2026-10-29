import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { AltaCentro } from '../../../../nucleo/modelos/master';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { SrsEncabezado } from '../../componentes/srs-encabezado/srs-encabezado';

interface FiltrosCentro {
  nombre: string;
  codigo: string;
  municipioId: string;
  parroquiaId: string;
}

const FILTROS_VACIOS: FiltrosCentro = {
  nombre: '',
  codigo: '',
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
  selector: 'app-subregion-salud-centros',
  imports: [SrsEncabezado, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './centros.html',
  styleUrl: './centros.css',
})
export class SubregionSaludCentros {
  protected readonly datos = inject(DatosSubregionSaludService);
  protected readonly router = inject(Router);

  protected readonly filtros = signal<FiltrosCentro>({ ...FILTROS_VACIOS });
  protected readonly altaAbierta = signal(false);
  protected readonly alta = signal<AltaCentro>({
    ...ALTA_VACIA,
    estadoId: this.datos.estadoId,
  });
  protected readonly errorAlta = signal('');

  protected readonly municipios = computed(() =>
    this.datos.municipiosDeEstado(this.datos.estadoId),
  );
  protected readonly parroquias = computed(() =>
    this.datos.parroquiasDeMunicipio(this.filtros().municipioId),
  );
  protected readonly municipiosAlta = computed(() =>
    this.datos.municipiosDeEstado(this.datos.estadoId),
  );
  protected readonly parroquiasAlta = computed(() =>
    this.datos.parroquiasDeMunicipio(this.alta().municipioId),
  );

  protected readonly resultados = computed(() => {
    const filtros = this.filtros();
    const nombre = this.normalizar(filtros.nombre);
    const codigo = this.normalizar(filtros.codigo);

    return this.datos.centros().filter((fila) => {
      if (nombre && !this.normalizar(fila.centro.nombre).includes(nombre)) {
        return false;
      }
      if (codigo && !this.normalizar(fila.centro.codigo).includes(codigo)) {
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
      if (campo === 'municipioId') {
        return { ...filtros, municipioId: valor, parroquiaId: '' };
      }
      if (campo === 'parroquiaId') {
        return { ...filtros, parroquiaId: valor };
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
    this.alta.set({
      ...ALTA_VACIA,
      estadoId: this.datos.estadoId,
    });
    this.errorAlta.set('');
    this.altaAbierta.set(true);
  }

  protected cerrarAlta(): void {
    this.altaAbierta.set(false);
    this.errorAlta.set('');
  }

  protected guardar(event: Event): void {
    // Sin `preventDefault` el formulario hace un envío nativo, recarga la app y
    // los mocks en memoria se reinician: el centro recién creado desaparecía.
    event.preventDefault();

    if (!this.formularioValido()) {
      this.errorAlta.set('Completa la ubicación, el código y los datos del jefe del centro.');
      return;
    }

    const payload: AltaCentro = {
      ...this.alta(),
      estadoId: this.datos.estadoId,
    };

    const creado = this.datos.crearCentro(payload);
    if (!creado) {
      this.errorAlta.set('No se pudo crear el centro con los datos seleccionados.');
      return;
    }

    this.altaAbierta.set(false);
    this.alta.set({ ...ALTA_VACIA, estadoId: this.datos.estadoId });
    this.filtros.set({ ...FILTROS_VACIOS });
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
