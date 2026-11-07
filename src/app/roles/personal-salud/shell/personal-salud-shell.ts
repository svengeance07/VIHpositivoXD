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

import { DatosPersonalSaludService } from '../../../nucleo/servicios/datos-personal-salud.service';
import { SesionService } from '../../../nucleo/servicios/sesion.service';

/** Estructura de cada elemento de navegación del Centro de Salud. */
interface ItemNavegacionPS {
  readonly etiqueta: string;
  readonly ruta: string;
  readonly icono: string;
  readonly exacto?: boolean;
  readonly badge?: string;
}

export type HerramientaLateralPS = 'telemetria' | 'alertas' | 'acciones' | 'atajos';

/** Shell / Layout del rol Personal de Salud (Centro de Salud - /PS). */
@Component({
  selector: 'app-personal-salud-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personal-salud-shell.html',
  styleUrl: './personal-salud-shell.css',
})
export class PersonalSaludShell {
  private readonly sesion = inject(SesionService);
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly router = inject(Router);

  // Estados reactivos de la barra lateral
  protected readonly hover = signal(false);
  protected readonly fijado = signal(false);
  protected readonly menuMovil = signal(false);
  protected readonly expandido = computed(() => this.menuMovil() || this.fijado() || this.hover());

  /** Herramienta seleccionada en la consola operativa lateral */
  protected readonly herramientaActiva = signal<HerramientaLateralPS>('telemetria');

  /** Estados para la acción de sincronización de datos mock */
  protected readonly sincronizando = signal(false);
  protected readonly sincroExito = signal(false);

  /** Datos del usuario y centro activo */
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly nombreCentro = computed(
    () => this.sesion.sesion()?.entidad ?? this.datosPS.centroNombre,
  );

  protected readonly nombreUsuario = computed(
    () => this.sesion.sesion()?.nombre ?? this.datosPS.enfermeroActual().nombre,
  );

  protected readonly cargoUsuario = computed(() => 'Jefe de Centro');

  protected readonly iniciales = computed(() => {
    const limpio = this.nombreUsuario().replace(
      /^(lic\.|dra\.|dr\.|enf\.|tsu|téc\.|tec\.|bioanalista|analista|ing\.)\s+/i,
      '',
    );
    return limpio
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  /** Métricas operativas en tiempo real para el centro */
  protected readonly totalPacientes = computed(() => this.datosPS.pacientes().length);
  protected readonly totalAplicaciones = computed(() => this.datosPS.aplicaciones().length);
  protected readonly totalReportes = computed(() => this.datosPS.reportes().length);
  protected readonly vacunasEnTermo = computed(() => this.datosPS.vacunasDisponibles().length);

  /**
   * Navegación horizontal de la barra superior.
   * La barra superior es el ÚNICO lugar para la navegación de módulos.
   */
  protected readonly navegacion: readonly ItemNavegacionPS[] = [
    { etiqueta: 'Centro de Control', ruta: '/PS', icono: 'layouts', exacto: true },
    { etiqueta: 'Consultar y Vacunar', ruta: '/PS/pacientes', icono: 'search', exacto: true },
    { etiqueta: 'Nuevo Paciente', ruta: '/PS/pacientes/nuevo', icono: 'plus' },
    { etiqueta: 'Reportes de Incidencias', ruta: '/PS/reportes', icono: 'warning', badge: 'ESAVI' },
    { etiqueta: 'Historial de Dosis', ruta: '/PS/historial', icono: 'calendar' },
    { etiqueta: 'Mi Credencial Digital', ruta: '/PS/personal', icono: 'clipboard' },
  ];

  protected readonly navegacionFiltrada = computed<readonly ItemNavegacionPS[]>(
    () => this.navegacion,
  );

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.irABusqueda();
    } else if (event.key === 'Escape' && this.expandido()) {
      this.cerrarTodo();
    }
  }

  protected seleccionarHerramienta(herramienta: HerramientaLateralPS): void {
    this.herramientaActiva.set(herramienta);
    if (!this.expandido()) {
      this.fijado.set(true);
    }
  }

  protected irABusqueda(): void {
    void this.router.navigateByUrl('/PS/pacientes');
  }

  protected irAReportes(): void {
    void this.router.navigateByUrl('/PS/reportes');
    if (!this.fijado()) {
      this.cerrarHover();
    }
  }

  protected exportarSnapshot(): void {
    const data = {
      centro: this.nombreCentro(),
      jefe: this.nombreUsuario(),
      fecha: new Date().toISOString(),
      termoTemperatura: '4.2 °C',
      cadenaFrio: 'Óptima (2°C a 8°C)',
      totalPacientes: this.totalPacientes(),
      totalDosisAplicadas: this.totalAplicaciones(),
      incidenciasReportadas: this.totalReportes(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sistema-v-censo-centro-${new Date().toISOString().slice(0, 10)}.json`;
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
}
