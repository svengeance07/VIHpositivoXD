import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import type { EstadoLote } from '../../../../../nucleo/modelos/enumeraciones';
import type { PersonalVista } from '../../../../../nucleo/modelos/master';
import { CatalogosService } from '../../../../../nucleo/servicios/catalogos.service';
import { DatosMasterService } from '../../../../../nucleo/servicios/datos-master.service';

type TipoDetalle = 'subregion' | 'centro' | 'empleado';

@Component({
  selector: 'app-master-detalle',
  imports: [RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class MasterDetalle {
  private readonly route = inject(ActivatedRoute);
  protected readonly datos = inject(DatosMasterService);
  private readonly catalogos = inject(CatalogosService);

  private readonly tipoInicial =
    (this.route.snapshot.data['tipo'] as TipoDetalle | undefined) ?? 'subregion';
  protected readonly tipo = toSignal(
    this.route.data.pipe(map((data) => (data['tipo'] as TipoDetalle | undefined) ?? 'subregion')),
    { initialValue: this.tipoInicial },
  );
  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((parametros) => parametros.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  protected readonly subregion = computed(() =>
    this.tipo() === 'subregion'
      ? (this.datos.subregiones().find((fila) => fila.centro.id === this.id()) ?? null)
      : null,
  );
  protected readonly centro = computed(() =>
    this.tipo() === 'centro'
      ? (this.datos.centrosVista().find((fila) => fila.centro.id === this.id()) ?? null)
      : null,
  );
  protected readonly empleado = computed(() =>
    this.tipo() === 'empleado'
      ? (this.datos.personalVista().find((fila) => fila.personal.id === this.id()) ?? null)
      : null,
  );

  protected readonly centrosSubregion = computed(() => {
    const fila = this.subregion();
    return fila ? this.datos.centrosDeEstado(fila.centro.estadoId) : [];
  });
  protected readonly personalSubregion = computed(() => {
    const fila = this.subregion();
    return fila ? this.datos.personalDeCentro(fila.centro.id) : [];
  });
  protected readonly personalCentro = computed(() => {
    const fila = this.centro();
    return fila ? this.datos.personalDeCentro(fila.centro.id) : [];
  });
  protected readonly lotesCentro = computed(() => {
    const fila = this.centro();
    return fila ? this.datos.lotesDeCentro(fila.centro.id) : [];
  });
  protected readonly jefeEmpleado = computed(() => {
    const fila = this.empleado();
    return fila ? this.datos.jefeDeCentro(fila.personal.centroId) : null;
  });
  protected readonly companeros = computed(() => {
    const fila = this.empleado();
    return fila
      ? this.datos
          .personalDeCentro(fila.personal.centroId)
          .filter((persona) => persona.id !== fila.personal.id)
      : [];
  });

  protected readonly volverRuta = computed(() => {
    if (this.tipo() === 'centro') return '/master/personal/centros';
    if (this.tipo() === 'empleado') return '/master/personal/empleados';
    return '/master/personal/subregiones';
  });

  protected etiquetaLote(estado: EstadoLote): string {
    return this.catalogos.estadosLote().find((item) => item.id === estado)?.nombre ?? estado;
  }

  protected tipoPersonal(fila: PersonalVista): string {
    return fila.esJefe ? 'Jefe' : 'Trabajador';
  }

  protected esJefe(fila: PersonalVista): boolean {
    return fila.esJefe;
  }
}
