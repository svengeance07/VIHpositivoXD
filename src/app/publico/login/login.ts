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

import type { CuentaAcceso, PerfilAcceso, RolInterno } from '../../nucleo/modelos/cuenta-acceso';
import type { RolUsuario, TipoEmpleado } from '../../nucleo/modelos/enumeraciones';
import { CatalogosService } from '../../nucleo/servicios/catalogos.service';
import { SesionService } from '../../nucleo/servicios/sesion.service';

type PasoLogin = 1 | 2 | 3;

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
  protected readonly cuenta = signal<CuentaAcceso | null>(null);
  protected readonly perfilElegido = signal<PerfilAcceso | null>(null);
  protected readonly error = signal('');

  protected readonly perfiles = computed<readonly PerfilAcceso[]>(
    () => this.cuenta()?.perfiles ?? [],
  );
  protected readonly rolActual = computed(() =>
    this.roles().find((rol) => rol.id === this.rolElegido()),
  );
  protected readonly tituloCredenciales = computed(() => {
    switch (this.rolElegido()) {
      case 1:
        return 'Credenciales de acceso';
      case 2:
        return 'Credenciales del centro de salud';
      case 3:
        return 'Credenciales de la subregión';
      default:
        return 'Credenciales';
    }
  });

  constructor() {
    const activa = this.sesion.sesion();
    if (activa) {
      void this.router.navigateByUrl(this.prefijoDe(activa.rol));
    }
  }

  protected elegirRol(rol: RolUsuario): void {
    if (rol === 0) {
      return;
    }

    this.rolElegido.set(rol);
    this.cuenta.set(null);
    this.perfilElegido.set(null);
    this.error.set('');
    this.paso.set(2);
  }

  protected continuar(evento: Event, correo: string, clave: string): void {
    evento.preventDefault();

    const rol = this.rolElegido();
    if (!rol) {
      return;
    }

    if (!correo.trim() || !clave) {
      this.error.set('Completa el correo y la contraseña.');
      return;
    }

    const cuenta = this.sesion.validarCuenta(rol, correo, clave);
    if (!cuenta) {
      this.error.set('El correo o la contraseña no corresponden a este tipo de cuenta.');
      return;
    }

    this.error.set('');

    if (rol === 1) {
      this.entrar(cuenta, null);
      return;
    }

    this.cuenta.set(cuenta);
    this.paso.set(3);
  }

  protected elegirPerfil(perfil: PerfilAcceso): void {
    this.perfilElegido.set(perfil);
    this.error.set('');
  }

  protected entrarPerfil(evento: Event, correo: string, clave: string): void {
    evento.preventDefault();

    const cuenta = this.cuenta();
    const perfil = this.perfilElegido();

    if (!cuenta || !perfil) {
      this.error.set('Selecciona un perfil para continuar.');
      return;
    }

    if (!correo.trim() || !clave) {
      this.error.set('Completa el correo y la contraseña del perfil.');
      return;
    }

    const validado = this.sesion.validarPerfil(cuenta, perfil.id, correo, clave);
    if (!validado) {
      this.error.set('El correo o la contraseña no corresponden a este perfil.');
      return;
    }

    this.entrar(cuenta, validado);
  }

  protected volver(): void {
    this.error.set('');

    if (this.paso() === 3) {
      this.cuenta.set(null);
      this.perfilElegido.set(null);
      this.paso.set(2);
      return;
    }

    this.rolElegido.set(null);
    this.cuenta.set(null);
    this.perfilElegido.set(null);
    this.paso.set(1);
  }

  protected descripcionRol(rol: RolUsuario): string {
    switch (rol) {
      case 1:
        return 'Vigilancia y administración general del sistema.';
      case 2:
        return 'Jefes y trabajadores de un centro de salud.';
      case 3:
        return 'Coordinación estadal y gestión de centros.';
      default:
        return '';
    }
  }

  protected etiquetaTipo(tipo: TipoEmpleado): string {
    return tipo === 'jefe' ? 'Jefe' : 'Trabajador';
  }

  private entrar(cuenta: CuentaAcceso, perfil: PerfilAcceso | null): void {
    this.sesion.entrar(cuenta, perfil);
    void this.router.navigateByUrl(this.prefijoDe(cuenta.rol));
  }

  private prefijoDe(rol: RolInterno): string {
    return this.roles().find((candidato) => candidato.id === rol)?.prefijo ?? '/';
  }
}
