import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  HostListener,
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

export type HerramientaLateralSrs = 'telemetria' | 'urgencias' | 'acciones' | 'atajos';

/** Marco de navegación y consola operativa de la Subregión de Salud (/SRS). */
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

  /** Herramienta seleccionada en la consola operativa lateral */
  protected readonly herramientaActiva = signal<HerramientaLateralSrs>('telemetria');

  /** Estados para la acción de sincronización de datos mock */
  protected readonly sincronizando = signal(false);
  protected readonly sincroExito = signal(false);

  protected readonly nombreSubregion = this.datos.subregionNombre;
  protected readonly estadoNombre = this.datos.estadoNombre;
  protected readonly esJefe = computed(() => true);

  protected readonly nombreUsuario = computed(
    () => this.sesion.sesion()?.nombre ?? 'Lic. Carlos Rojas',
  );

  protected readonly cargoUsuario = computed(() => 'Jefe de subregión');

  protected readonly iniciales = computed(() => this.calcularIniciales(this.nombreUsuario()));

  /** Métricas operativas en tiempo real */
  protected readonly pendientes = computed(() => this.datos.resumen().solicitudesPendientes);
  protected readonly noLeidas = computed(() => this.datos.notificacionesNoLeidas());
  protected readonly totalCentros = computed(() => this.datos.centros().length);
  protected readonly totalTrabajadores = computed(() => this.datos.trabajadores().length);
  protected readonly totalAlertas = computed(() => this.pendientes() + this.noLeidas());

  /**
   * Navegación horizontal de la barra superior.
   * La barra superior es el ÚNICO lugar para la navegación de módulos.
   */
  protected readonly navegacion = computed<readonly ItemNavegacionSrs[]>(() => {
    const p = this.pendientes();
    const n = this.noLeidas();

    return [
      {
        etiqueta: 'Panel de la subregión',
        ruta: '/SRS',
        icono: 'layouts',
        exacto: true,
      },
      { etiqueta: 'Jefes de centro', ruta: '/SRS/trabajadores', icono: 'clipboard' },
      { etiqueta: 'Ciudadanos', ruta: '/SRS/ciudadanos', icono: 'search' },
      {
        etiqueta: 'Centros',
        ruta: '/SRS/centros',
        icono: 'clipboard',
      },
      {
        etiqueta: 'Certificados',
        ruta: '/SRS/certificados',
        icono: 'check',
        badge: p > 0 ? String(p) : undefined,
      },
      {
        etiqueta: 'Notificaciones',
        ruta: '/SRS/notificaciones',
        icono: 'warning',
        badge: n > 0 ? String(n) : undefined,
      },
    ];
  });

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.irABusqueda();
    } else if (event.key === 'Escape' && this.expandido()) {
      this.cerrarTodo();
    }
  }

  protected seleccionarHerramienta(herramienta: HerramientaLateralSrs): void {
    this.herramientaActiva.set(herramienta);
    if (!this.expandido()) {
      this.fijado.set(true);
    }
  }

  protected irABusqueda(): void {
    void this.router.navigateByUrl('/SRS/ciudadanos');
  }

  protected irACertificados(): void {
    void this.router.navigateByUrl('/SRS/certificados');
    if (!this.fijado()) {
      this.cerrarHover();
    }
  }

  protected exportarSnapshot(): void {
    const data = {
      subregion: this.nombreSubregion,
      estado: this.estadoNombre,
      jefe: this.nombreUsuario(),
      fecha: new Date().toISOString(),
      centrosActivos: this.totalCentros(),
      jefesCentro: this.totalTrabajadores(),
      certificadosPendientes: this.pendientes(),
      notificacionesSinLeer: this.noLeidas(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sistema-v-censo-subregion-${this.estadoNombre.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected sincronizarMock(): void {
    this.sincronizando.set(true);
    setTimeout(() => {
      this.sincronizando.set(false);
      this.sincroExito.set(true);
      setTimeout(() => this.sincroExito.set(false), 2500);
    }, 600);
  }

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
    this.fijado.update((v) => !v);
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

  protected cerrarSesion(): void {
    this.sesion.salir();
    void this.router.navigateByUrl('/login');
  }

  private calcularIniciales(nombre: string): string {
    const limpio = nombre.replace(
      /^(lic\.|dra\.|dr\.|enf\.|tsu|téc\.|tec\.|bioanalista|analista|ing\.)\s+/i,
      '',
    );
    return limpio
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }
}
