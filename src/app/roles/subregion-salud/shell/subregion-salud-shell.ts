import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { DatosSubregionSaludService } from '../../../nucleo/servicios/datos-subregion-salud.service';
import { SesionService } from '../../../nucleo/servicios/sesion.service';

interface ItemNavegacionSrs {
  readonly etiqueta: string;
  readonly ruta: string;
  readonly icono: string;
  readonly exacto?: boolean;
  readonly badge?: string;
}

/**
 * Marco de navegación de la Subregión de Salud (/SRS).
 *
 * Reutiliza el comportamiento del shell de /PS: barra lateral Liquid Glass
 * expansible, foco accesible, menú móvil con velo y cierre de sesión. La
 * navegación incorpora los contadores de certificados pendientes y
 * notificaciones sin leer.
 */
@Component({
  selector: 'app-subregion-salud-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subregion-salud-shell.html',
  styleUrl: './subregion-salud-shell.css',
})
export class SubregionSaludShell {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  protected readonly datos = inject(DatosSubregionSaludService);

  protected readonly hover = signal(false);
  protected readonly fijado = signal(false);
  protected readonly menuMovil = signal(false);
  protected readonly expandido = computed(() => this.menuMovil() || this.fijado() || this.hover());

  protected readonly nombreSubregion = this.datos.subregionNombre;
  protected readonly estadoNombre = this.datos.estadoNombre;
  protected readonly esJefe = computed(() => this.sesion.sesion()?.perfil?.tipo === 'jefe');

  protected readonly nombreUsuario = computed(
    () => this.sesion.sesion()?.perfil?.nombre ?? 'Lic. Carlos Rojas',
  );

  protected readonly cargoUsuario = computed(() =>
    this.esJefe() ? 'Jefe de subregión' : 'Analista de subregión',
  );

  protected readonly iniciales = computed(() => this.calcularIniciales(this.nombreUsuario()));

  protected readonly navegacion = computed<readonly ItemNavegacionSrs[]>(() => {
    const pendientes = this.datos.resumen().solicitudesPendientes;
    const noLeidas = this.datos.notificacionesNoLeidas();

    return [
      {
        etiqueta: 'Panel de la subregión',
        ruta: '/SRS',
        icono: 'layouts',
        exacto: true,
      },
      { etiqueta: 'Personal de salud', ruta: '/SRS/trabajadores', icono: 'clipboard' },
      { etiqueta: 'Ciudadanos', ruta: '/SRS/ciudadanos', icono: 'filter' },
      {
        etiqueta: 'Certificados',
        ruta: '/SRS/certificados',
        icono: 'check',
        badge: pendientes > 0 ? String(pendientes) : undefined,
      },
      {
        etiqueta: 'Notificaciones',
        ruta: '/SRS/notificaciones',
        icono: 'warning',
        badge: noLeidas > 0 ? String(noLeidas) : undefined,
      },
    ];
  });

  protected abrirHover(): void {
    this.hover.set(true);
  }

  protected cerrarHover(): void {
    this.hover.set(false);
  }

  protected cerrarEnfoque(event: FocusEvent): void {
    const barra = event.currentTarget as HTMLElement;
    const siguiente = event.relatedTarget as Node | null;
    if (siguiente && barra.contains(siguiente)) return;
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

  private calcularIniciales(nombre: string): string {
    const limpio = nombre.replace(
      /^(lic\.|dra\.|dr\.|enf\.|tsu|téc\.|tec\.|bioanalista|analista|ing\.)\s+/i,
      '',
    );
    const partes = limpio.split(/\s+/).filter(Boolean);

    return `${partes[0]?.[0] ?? ''}${partes[1]?.[0] ?? ''}`.toUpperCase();
  }
}
