import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
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
  /** Si es true, solo se muestra al Jefe del Centro (ej: Gestión de perfiles de enfermeros). */
  readonly soloJefe?: boolean;
  readonly badge?: string;
}

/**
 * Shell / Layout del rol Personal de Salud (Centro de Salud - /PS).
 *
 * Ofrece:
 * - Barra lateral colapsable / expandible con efectos Liquid Glass (Caustica Design).
 * - Cabecera superior adaptativa con datos del centro de salud ("La Pastora") y perfil activo.
 * - Conmutador rápido de modo (Jefe vs Enfermero) para facilitar pruebas y desarrollo en vivo.
 * - Menú responsive para móviles con velo translúcido.
 */
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

  /** Datos del usuario y centro activo */
  protected readonly esJefe = this.datosPS.esJefe;
  protected readonly nombreCentro = computed(() => this.datosPS.centroNombre);

  protected readonly nombreUsuario = computed(() => {
    if (this.esJefe()) {
      return this.sesion.sesion()?.perfil?.nombre ?? 'Dra. María Pérez';
    }
    return this.datosPS.enfermeroActual().nombre;
  });

  protected readonly cargoUsuario = computed(() => {
    return this.esJefe() ? 'Jefe de Centro' : 'Enfermero Operativo';
  });

  protected readonly iniciales = computed(() =>
    this.nombreUsuario()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join(''),
  );

  /**
   * Navegación completa adaptada a los requerimientos del Centro de Salud.
   */
  protected readonly navegacion: readonly ItemNavegacionPS[] = [
    { etiqueta: 'Centro de Control', ruta: '/PS', icono: 'layouts', exacto: true },
    { etiqueta: 'Consultar y Vacunar', ruta: '/PS/pacientes', icono: 'filter' },
    { etiqueta: 'Nuevo Paciente', ruta: '/PS/pacientes/nuevo', icono: 'plus' },
    { etiqueta: 'Reportes de Incidencias', ruta: '/PS/reportes', icono: 'warning', badge: 'ESAVI' },
    { etiqueta: 'Historial de Dosis', ruta: '/PS/historial', icono: 'calendar' },
    { etiqueta: 'Equipo de Enfermeros', ruta: '/PS/personal', icono: 'clipboard', soloJefe: false },
  ];

  /** Ítems de navegación adaptados al perfil activo (Jefe vs Enfermero) */
  protected readonly navegacionFiltrada = computed<readonly ItemNavegacionPS[]>(() => {
    if (this.esJefe()) {
      return [
        { etiqueta: 'Centro de Control', ruta: '/PS', icono: 'layouts', exacto: true },
        { etiqueta: 'Consultar y Vacunar', ruta: '/PS/pacientes', icono: 'filter' },
        { etiqueta: 'Nuevo Paciente', ruta: '/PS/pacientes/nuevo', icono: 'plus' },
        {
          etiqueta: 'Reportes de Incidencias',
          ruta: '/PS/reportes',
          icono: 'warning',
          badge: 'ESAVI',
        },
        { etiqueta: 'Historial de Dosis', ruta: '/PS/historial', icono: 'calendar' },
        { etiqueta: 'Equipo de Enfermeros', ruta: '/PS/personal', icono: 'clipboard' },
      ];
    }

    return [
      { etiqueta: 'Estación de Vacunación', ruta: '/PS/estacion', icono: 'layouts', exacto: true },
      { etiqueta: 'Consultar y Vacunar', ruta: '/PS/pacientes', icono: 'filter' },
      { etiqueta: 'Nuevo Paciente', ruta: '/PS/pacientes/nuevo', icono: 'plus' },
      {
        etiqueta: 'Reportar Incidencia',
        ruta: '/PS/reportes',
        icono: 'warning',
        badge: 'ESAVI',
      },
      { etiqueta: 'Historial de Dosis', ruta: '/PS/historial', icono: 'calendar' },
      { etiqueta: 'Mi Perfil Profesional', ruta: '/PS/personal', icono: 'team' },
    ];
  });

  // Métodos de interacción del menú lateral
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

  protected alNavegar(): void {
    if (this.menuMovil()) {
      this.cerrarTodo();
    }
  }

  /**
   * Conmuta dinámicamente entre modo Jefe y Enfermero para pruebas.
   */
  protected conmutarModo(): void {
    const nuevoModo = this.esJefe() ? 'enfermero' : 'jefe';
    this.datosPS.setModoManual(nuevoModo);
  }

  /**
   * Cierra sesión y retorna al login.
   */
  protected cerrarSesion(): void {
    this.sesion.salir();
    void this.router.navigateByUrl('/login');
  }
}
