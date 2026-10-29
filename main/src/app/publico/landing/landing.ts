import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface RasgoLanding {
  readonly icono: string;
  readonly titulo: string;
  readonly detalle: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private readonly router = inject(Router);

  protected readonly rasgos: readonly RasgoLanding[] = [
    {
      icono: 'clipboard',
      titulo: 'Registro unificado',
      detalle: 'Ciudadanos, personal y centros de salud en un solo expediente.',
    },
    {
      icono: 'check',
      titulo: 'Trazabilidad de vacunas',
      detalle: 'Lotes, dosis y certificados con historial verificable.',
    },
    {
      icono: 'log-in',
      titulo: 'Consulta ciudadana',
      detalle: 'Cada persona accede a su información con verificación por correo.',
    },
  ];

  protected abrirLogin(): void {
    void this.router.navigateByUrl('/login');
  }
}
