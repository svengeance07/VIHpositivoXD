import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import type { Ciudadano, FiltrosCiudadano } from '../../../../nucleo/modelos/master';
import { CatalogosService } from '../../../../nucleo/servicios/catalogos.service';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import { MasterEncabezado } from '../../componentes/master-encabezado/master-encabezado';

type IdFiltro =
  | 'nombres'
  | 'apellidos'
  | 'cedula'
  | 'vacuna'
  | 'rangoEdad'
  | 'examen'
  | 'fechaRegistro'
  | 'sexo'
  | 'etnia'
  | 'ubicacion';

interface ChipFiltro {
  readonly id: IdFiltro;
  readonly etiqueta: string;
}

const FILTROS_VACIOS: FiltrosCiudadano = {
  nombres: '',
  apellidos: '',
  cedula: '',
  vacunaId: '',
  edadMin: '',
  edadMax: '',
  examenId: '',
  creadoDesde: '',
  creadoHasta: '',
  sexo: '',
  etniaId: '',
  estadoId: '',
  municipioId: '',
  parroquiaId: '',
};

@Component({
  selector: 'app-master-busqueda',
  imports: [MasterEncabezado, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './busqueda.html',
  styleUrl: './busqueda.css',
})
export class MasterBusqueda {
  protected readonly datos = inject(DatosMasterService);
  protected readonly catalogos = inject(CatalogosService);

  protected readonly chips: readonly ChipFiltro[] = [
    { id: 'nombres', etiqueta: 'Nombres' },
    { id: 'apellidos', etiqueta: 'Apellidos' },
    { id: 'cedula', etiqueta: 'Cédula' },
    { id: 'vacuna', etiqueta: 'Vacunas' },
    { id: 'rangoEdad', etiqueta: 'Rango de edad' },
    { id: 'examen', etiqueta: 'Exámenes' },
    { id: 'fechaRegistro', etiqueta: 'Fecha de registro' },
    { id: 'sexo', etiqueta: 'Sexo' },
    { id: 'etnia', etiqueta: 'Etnia' },
    { id: 'ubicacion', etiqueta: 'Ubicación' },
  ];

  protected readonly filtros = signal<FiltrosCiudadano>({ ...FILTROS_VACIOS });
  protected readonly filtroActivo = signal<IdFiltro | null>(null);
  protected readonly resultados = signal<readonly Ciudadano[]>([]);
  protected readonly busquedaHecha = signal(false);
  protected readonly seleccionado = signal<Ciudadano | null>(null);

  protected readonly municipios = computed(() =>
    this.datos.municipiosDeEstado(this.filtros().estadoId),
  );
  protected readonly parroquias = computed(() =>
    this.datos.parroquiasDeMunicipio(this.filtros().municipioId),
  );
  protected readonly contarFiltros = computed(() => {
    const filtros = this.filtros();
    let total = 0;

    if (filtros.nombres) total++;
    if (filtros.apellidos) total++;
    if (filtros.cedula) total++;
    if (filtros.vacunaId) total++;
    if (filtros.edadMin || filtros.edadMax) total++;
    if (filtros.examenId) total++;
    if (filtros.creadoDesde || filtros.creadoHasta) total++;
    if (filtros.sexo) total++;
    if (filtros.etniaId) total++;
    if (filtros.estadoId || filtros.municipioId || filtros.parroquiaId) total++;

    return total;
  });
  protected readonly puedeBuscar = computed(() => this.contarFiltros() >= 2);
  protected readonly etiquetaFiltroActivo = computed(
    () => this.chips.find((chip) => chip.id === this.filtroActivo())?.etiqueta ?? '',
  );

  protected abrirFiltro(id: IdFiltro): void {
    this.filtroActivo.update((actual) => (actual === id ? null : id));
  }

  protected limpiarFiltroActivo(): void {
    const activo = this.filtroActivo();
    if (activo) {
      this.limpiarFiltro(activo);
    }
  }

  protected valor(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected actualizar(campo: keyof FiltrosCiudadano, valor: string): void {
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

  protected tieneFiltro(id: IdFiltro): boolean {
    const filtros = this.filtros();

    switch (id) {
      case 'nombres':
        return Boolean(filtros.nombres);
      case 'apellidos':
        return Boolean(filtros.apellidos);
      case 'cedula':
        return Boolean(filtros.cedula);
      case 'vacuna':
        return Boolean(filtros.vacunaId);
      case 'rangoEdad':
        return Boolean(filtros.edadMin || filtros.edadMax);
      case 'examen':
        return Boolean(filtros.examenId);
      case 'fechaRegistro':
        return Boolean(filtros.creadoDesde || filtros.creadoHasta);
      case 'sexo':
        return Boolean(filtros.sexo);
      case 'etnia':
        return Boolean(filtros.etniaId);
      case 'ubicacion':
        return Boolean(filtros.estadoId || filtros.municipioId || filtros.parroquiaId);
    }
  }

  protected limpiarFiltro(id: IdFiltro): void {
    const campos: Record<IdFiltro, readonly (keyof FiltrosCiudadano)[]> = {
      nombres: ['nombres'],
      apellidos: ['apellidos'],
      cedula: ['cedula'],
      vacuna: ['vacunaId'],
      rangoEdad: ['edadMin', 'edadMax'],
      examen: ['examenId'],
      fechaRegistro: ['creadoDesde', 'creadoHasta'],
      sexo: ['sexo'],
      etnia: ['etniaId'],
      ubicacion: ['estadoId', 'municipioId', 'parroquiaId'],
    };

    this.filtros.update((filtros) => {
      const siguiente: Record<keyof FiltrosCiudadano, string> = { ...filtros };
      for (const campo of campos[id]) {
        siguiente[campo] = '';
      }
      return siguiente;
    });
  }

  protected limpiarTodo(): void {
    this.filtros.set({ ...FILTROS_VACIOS });
    this.resultados.set([]);
    this.busquedaHecha.set(false);
    this.filtroActivo.set(null);
  }

  protected buscar(): void {
    if (!this.puedeBuscar()) {
      return;
    }

    const encontrados = this.datos.buscarCiudadanos(this.filtros());
    this.resultados.set(encontrados);
    this.busquedaHecha.set(true);
    this.datos.registrarBusqueda(this.describirFiltros(), encontrados.length);
  }

  protected abrirDetalle(ciudadano: Ciudadano): void {
    this.seleccionado.set(ciudadano);
  }

  protected cerrarDetalle(): void {
    this.seleccionado.set(null);
  }

  protected nombre(ciudadano: Ciudadano): string {
    return this.datos.nombreCompleto(ciudadano);
  }

  protected etiquetaSexo(sexo: string): string {
    if (sexo === 'F') return 'Femenino';
    if (sexo === 'M') return 'Masculino';
    return 'Otro';
  }

  protected ubicacion(ciudadano: Ciudadano): string {
    return [
      this.datos.nombreEstado(ciudadano.estadoId),
      this.datos.nombreMunicipio(ciudadano.municipioId),
      this.datos.nombreParroquia(ciudadano.parroquiaId),
    ].join(' · ');
  }

  protected ultimoExamen(ciudadano: Ciudadano): string | null {
    const examenes = [...ciudadano.examenes].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return examenes[0]?.fecha ?? null;
  }

  private describirFiltros(): string {
    const filtros = this.filtros();
    const partes: string[] = [];

    if (filtros.nombres) partes.push(`Nombres: ${filtros.nombres}`);
    if (filtros.apellidos) partes.push(`Apellidos: ${filtros.apellidos}`);
    if (filtros.cedula) partes.push(`Cédula: ${filtros.cedula}`);
    if (filtros.vacunaId) partes.push(`Vacuna: ${this.datos.nombreVacuna(filtros.vacunaId)}`);
    if (filtros.edadMin || filtros.edadMax) {
      partes.push(`Edad: ${filtros.edadMin || '—'}-${filtros.edadMax || '—'}`);
    }
    if (filtros.examenId) partes.push(`Examen: ${this.datos.nombreExamen(filtros.examenId)}`);
    if (filtros.creadoDesde || filtros.creadoHasta) {
      partes.push(`Registro: ${filtros.creadoDesde || '—'} a ${filtros.creadoHasta || '—'}`);
    }
    if (filtros.sexo) partes.push(`Sexo: ${this.etiquetaSexo(filtros.sexo)}`);
    if (filtros.etniaId) partes.push(`Etnia: ${this.datos.nombreEtnia(filtros.etniaId)}`);
    if (filtros.estadoId) partes.push(`Estado: ${this.datos.nombreEstado(filtros.estadoId)}`);
    if (filtros.municipioId) {
      partes.push(`Municipio: ${this.datos.nombreMunicipio(filtros.municipioId)}`);
    }
    if (filtros.parroquiaId) {
      partes.push(`Parroquia: ${this.datos.nombreParroquia(filtros.parroquiaId)}`);
    }

    return partes.join(' + ') || 'Sin filtros';
  }
}
