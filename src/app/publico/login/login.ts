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
    this.entrar(cuenta);
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
