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

import { BotonTema } from '../../../compartido/ui/boton-tema/boton-tema';
import { DatosMasterService } from '../../../nucleo/servicios/datos-master.service';
import { SesionService } from '../../../nucleo/servicios/sesion.service';

interface ItemNavegacion {
  readonly etiqueta: string;
  readonly ruta: string;
  readonly icono: string;
  readonly exacto?: boolean;
}

export type HerramientaLateralMaster = 'telemetria' | 'alertas' | 'acciones' | 'atajos';

/** Marco de navegación y consola operativa del master. */
@Component({
  selector: 'app-master-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, BotonTema],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './master-shell.html',
  styleUrl: './master-shell.css',
})
export class MasterShell {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  protected readonly datos = inject(DatosMasterService);

  protected readonly hover = signal(false);
  protected readonly fijado = signal(false);
  protected readonly menuMovil = signal(false);
  protected readonly expandido = computed(() => this.menuMovil() || this.fijado() || this.hover());

  /** Herramienta operativa actualmente seleccionada en el panel lateral */
  protected readonly herramientaActiva = signal<HerramientaLateralMaster>('telemetria');

  /** Estados para la acción de sincronización de datos mock */
  protected readonly sincronizando = signal(false);
  protected readonly sincroExito = signal(false);

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

  /** Métricas operativas en tiempo real expuestas a la barra lateral */
  protected readonly totalCentros = computed(() => this.datos.centros().length);
  protected readonly totalPersonal = computed(() => this.datos.personalVista().length);
  protected readonly lotesEnCamino = computed(() =>
    this.datos.lotes().filter((l) => l.estado === 'en_camino'),
  );
  protected readonly lotesReportados = computed(() =>
    this.datos.lotes().filter((l) => l.estado === 'reportado'),
  );
  protected readonly lotesAceptados = computed(() =>
    this.datos.lotes().filter((l) => l.estado === 'aceptado'),
  );
  protected readonly totalAlertas = computed(() => this.lotesReportados().length);

  /**
   * Navegación estructural de la barra superior.
   * La barra superior es el ÚNICO lugar para la navegación de módulos.
   */
  protected readonly navegacion: readonly ItemNavegacion[] = [
    { etiqueta: 'Panel', ruta: '/master', icono: 'layouts', exacto: true },
    { etiqueta: 'Buscar', ruta: '/master/busqueda', icono: 'search' },
    { etiqueta: 'Personal y centros', ruta: '/master/personal', icono: 'clipboard' },
    { etiqueta: 'Control de vacunas', ruta: '/master/vacunas', icono: 'eyedropper' },
    { etiqueta: 'Movimientos', ruta: '/master/movimientos', icono: 'edit' },
    { etiqueta: 'Búsquedas', ruta: '/master/busquedas', icono: 'search' },
  ];

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.irABusqueda();
    } else if (event.key === 'Escape' && this.expandido()) {
      this.cerrarTodo();
    }
  }

  protected seleccionarHerramienta(herramienta: HerramientaLateralMaster): void {
    this.herramientaActiva.set(herramienta);
    if (!this.expandido()) {
      this.fijado.set(true);
    }
  }

  protected irABusqueda(): void {
    void this.router.navigateByUrl('/master/busqueda');
  }

  protected irAVacunasReportadas(): void {
    void this.router.navigateByUrl('/master/vacunas');
    if (!this.fijado()) {
      this.cerrarHover();
    }
  }

  protected exportarSnapshot(): void {
    const data = {
      sistema: 'Sistema V - Plataforma Nacional de Vigilancia',
      fecha: new Date().toISOString(),
      estadoRed: 'Operativo - 24/24 Subregiones Activas',
      totales: {
        centros: this.totalCentros(),
        personal: this.totalPersonal(),
        lotesTotal: this.datos.lotes().length,
        lotesEnCamino: this.lotesEnCamino().length,
        lotesReportados: this.lotesReportados().length,
        lotesAceptados: this.lotesAceptados().length,
      },
      lotesObservados: this.lotesReportados(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sistema-v-auditoria-nacional-${new Date().toISOString().slice(0, 10)}.json`;
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

  protected cerrarSesion(): void {
    this.sesion.salir();
    void this.router.navigateByUrl('/login');
  }
}
