import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CatalogosService } from '../../../nucleo/servicios/catalogos.service';
import { SesionService } from '../../../nucleo/servicios/sesion.service';

/**
 * Marcador de posición para las pantallas que aún no tienen diseño.
 *
 * Muestra quién inició sesión y permite cerrarla, para poder recorrer los flujos
 * mientras se construyen las vistas reales.
 */
@Component({
  selector: 'app-pagina-en-construccion',
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-en-construccion.html',
  styleUrl: './pagina-en-construccion.css',
})
export class PaginaEnConstruccion {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');

  private readonly sesion = inject(SesionService);
  private readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);

  protected readonly sesionActiva = this.sesion.sesion;
  protected readonly rolNombre = computed(() => {
    const sesion = this.sesionActiva();
    return sesion
      ? (this.catalogos.roles().find((rol) => rol.id === sesion.rol)?.nombre ?? '')
      : '';
  });

  protected salir(): void {
    this.sesion.salir();
    void this.router.navigateByUrl('/');
  }
}
