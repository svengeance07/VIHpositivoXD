import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SesionService } from '../../../nucleo/servicios/sesion.service';

interface ItemNavegacion {
  readonly etiqueta: string;
  readonly ruta: string;
  readonly icono: string;
  readonly exacto?: boolean;
}

/** Marco de navegación de todas las vistas del master. */
@Component({
  selector: 'app-master-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './master-shell.html',
  styleUrl: './master-shell.css',
})
export class MasterShell {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly sesionActiva = this.sesion.sesion;
  protected readonly hover = signal(false);
  protected readonly fijado = signal(false);
  protected readonly menuMovil = signal(false);
  protected readonly expandido = computed(() => this.menuMovil() || this.fijado() || this.hover());

  protected readonly nombre = computed(
    () => this.sesion.sesion()?.nombreUsuario ?? this.sesion.sesion()?.nombre ?? 'master',
  );

  protected readonly iniciales = computed(() =>
    this.nombre()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join(''),
  );

  protected readonly navegacion: readonly ItemNavegacion[] = [
    { etiqueta: 'Panel', ruta: '/master', icono: 'layouts', exacto: true },
    { etiqueta: 'Buscar', ruta: '/master/busqueda', icono: 'filter' },
    { etiqueta: 'Personal y centros', ruta: '/master/personal', icono: 'clipboard' },
    { etiqueta: 'Control de vacunas', ruta: '/master/vacunas', icono: 'eyedropper' },
    { etiqueta: 'Movimientos', ruta: '/master/movimientos', icono: 'edit' },
    { etiqueta: 'Búsquedas', ruta: '/master/busquedas', icono: 'feedback' },
  ];

  protected abrirHover(): void {
    this.hover.set(true);
  }

  protected cerrarHover(): void {
    this.hover.set(false);
  }

  protected cerrarEnfoque(event: FocusEvent): void {
    const barra = event.currentTarget as HTMLElement;
    const siguiente = event.relatedTarget as Node | null;

    if (siguiente && barra.contains(siguiente)) {
      return;
    }

    this.hover.set(false);
  }

  protected alternarFijado(): void {
    this.fijado.update((valor) => !valor);
  }

  protected abrirMenu(): void {
    this.menuMovil.set(true);
  }

  protected cerrarMenu(): void {
    this.menuMovil.set(false);
    this.hover.set(false);
    this.fijado.set(false);
  }

  protected cerrarTodo(): void {
    this.menuMovil.set(false);
    this.hover.set(false);
    this.fijado.set(false);
  }

  protected alNavegar(): void {
    if (this.menuMovil()) {
      this.cerrarTodo();
    }
  }

  protected cerrarSesion(): void {
    this.sesion.salir();
    void this.router.navigateByUrl('/login');
  }
}
