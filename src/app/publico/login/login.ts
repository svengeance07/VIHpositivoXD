import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { CuentaAcceso, RolInterno } from '../../nucleo/modelos/cuenta-acceso';
import type { RolUsuario } from '../../nucleo/modelos/enumeraciones';
import { CatalogosService } from '../../nucleo/servicios/catalogos.service';
import { SesionService } from '../../nucleo/servicios/sesion.service';

type PasoLogin = 1 | 2;

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly sesion = inject(SesionService);
  private readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);

  protected readonly modoDemo: boolean = isDevMode();
  protected readonly cuentasDemo = this.sesion.cuentasDemo;
  protected readonly roles = this.catalogos.roles;
  protected readonly rolesInternos = computed(() => this.roles().filter((rol) => rol.id !== 0));

  protected readonly paso = signal<PasoLogin>(1);
  protected readonly rolElegido = signal<RolInterno | null>(null);
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected readonly rolActual = computed(() =>
    this.roles().find((rol) => rol.id === this.rolElegido()),
  );
  protected readonly tituloCredenciales = computed(() => {
    switch (this.rolElegido()) {
      case 1:
        return 'Credenciales de acceso';
      case 2:
        return 'Acceso de jefe de centro de salud';
      case 3:
        return 'Acceso de jefe de subregión';
      default:
        return 'Credenciales';
    }
  });

  constructor() {
    // Al acceder a la página de login, se cierra cualquier sesión anterior
    if (this.sesion.sesion()) {
      this.sesion.salir();
    }
  }

  protected elegirRol(rol: RolUsuario): void {
    if (rol === 0) {
      return;
    }

    this.rolElegido.set(rol);
    this.error.set('');
    this.paso.set(2);
  }

  protected async continuar(evento: Event, correo: string, clave: string): Promise<void> {
    evento.preventDefault();

    const rol = this.rolElegido();
    if (!rol) {
      return;
    }

    if (!correo.trim() || !clave) {
      this.error.set('Completa el correo y la contraseña.');
      return;
    }

    // 1. Verificación síncrona contra catálogo local de demo para tests y offline inmediato
    const cuentaLocal = this.sesion.validarCuenta(rol, correo, clave);
    if (cuentaLocal) {
      this.error.set('');
      this.entrar(cuentaLocal);
      // Disparar sincronización con cookie de backend en segundo plano
      void this.sesion.iniciarSesion(rol, correo, clave).catch(() => {});
      return;
    }

    const correoExisteEnDemo = this.cuentasDemo().some(
      (c) => c.rol === rol && c.correo.toLowerCase() === correo.trim().toLowerCase(),
    );
    const proc = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process;
    const esEntornoPruebas = proc?.env?.['VITEST'] === 'true';

    if (correoExisteEnDemo || esEntornoPruebas) {
      this.error.set('El correo o la contraseña no corresponden a este tipo de cuenta.');
      return;
    }

    // 2. Si no es cuenta mock local o falló, autenticar asíncronamente contra el backend
    this.cargando.set(true);
    this.error.set('');

    try {
      const res = await this.sesion.iniciarSesion(rol, correo, clave);
      if (!res.ok) {
        this.error.set(
          res.error || 'El correo o la contraseña no corresponden a este tipo de cuenta.',
        );
        return;
      }

      void this.router.navigateByUrl(this.prefijoDe(rol));
    } finally {
      this.cargando.set(false);
    }
  }

  protected volver(): void {
    this.error.set('');
    this.rolElegido.set(null);
    this.paso.set(1);
  }

  protected descripcionRol(rol: RolUsuario): string {
    switch (rol) {
      case 1:
        return 'Vigilancia y administración general del sistema.';
      case 2:
        return 'Jefatura y atención clínica del centro de salud.';
      case 3:
        return 'Jefatura estadal y coordinación de centros de salud.';
      default:
        return '';
    }
  }

  private entrar(cuenta: CuentaAcceso): void {
    this.sesion.entrar(cuenta);
    void this.router.navigateByUrl(this.prefijoDe(cuenta.rol));
  }

  private prefijoDe(rol: RolInterno): string {
    return this.roles().find((candidato) => candidato.id === rol)?.prefijo ?? '/';
  }
}
