import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { EstadoCertificado } from '../../nucleo/modelos/enumeraciones';
import type {
  FichaCiudadano,
  SolicitudCertificadoVista,
} from '../../nucleo/modelos/subregion-salud';
import { DatosMasterService } from '../../nucleo/servicios/datos-master.service';
import { DatosSubregionSaludService } from '../../nucleo/servicios/datos-subregion-salud.service';

interface EjemploConsulta {
  readonly cedula: string;
  readonly nombre: string;
}

/**
 * Consulta pública de ciudadanos (rol 0).
 *
 * Permite buscar por cédula, ver los datos personales y consultar el estado del
 * certificado. Si la solicitud fue aprobada o emitida, el ciudadano puede pedir
 * el envío al correo registrado. El envío y la ausencia de código de
 * verificación son deliberados: todavía no hay backend ni servicio de correo.
 */
@Component({
  selector: 'app-consulta',
  imports: [RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consulta.html',
  styleUrl: './consulta.css',
})
export class Consulta {
  private readonly subregion = inject(DatosSubregionSaludService);
  protected readonly maestro = inject(DatosMasterService);

  protected readonly cedula = signal('');
  protected readonly ficha = signal<FichaCiudadano | null>(null);
  protected readonly certificado = signal<SolicitudCertificadoVista | null>(null);
  protected readonly error = signal('');

  protected readonly ejemplos: readonly EjemploConsulta[] = [
    { cedula: '15324687', nombre: 'José Gregorio' },
    { cedula: '8192457', nombre: 'Luis Fernando' },
    { cedula: '26548971', nombre: 'Génesis Paola' },
  ];

  protected readonly certificadoAprobado = computed(() => {
    const estado = this.certificado()?.estado;

    return estado === 'autorizado' || estado === 'emitido';
  });

  protected readonly puedeEnviar = computed(
    () => this.certificadoAprobado() && !this.certificado()?.correoEnviado,
  );

  protected actualizarCedula(event: Event): void {
    this.cedula.set((event.target as HTMLInputElement).value);
    this.ficha.set(null);
    this.certificado.set(null);
    this.error.set('');
  }

  protected usarEjemplo(cedula: string): void {
    this.cedula.set(cedula);
    this.buscar();
  }

  protected limpiar(): void {
    this.cedula.set('');
    this.ficha.set(null);
    this.certificado.set(null);
    this.error.set('');
  }

  protected buscar(event?: Event): void {
    event?.preventDefault();

    const normalizada = this.cedula().replace(/\D/g, '');
    this.error.set('');

    if (!normalizada) {
      this.ficha.set(null);
      this.certificado.set(null);
      this.error.set('Escribe una cédula de identidad para consultar.');
      return;
    }

    const ficha = this.subregion.fichaPorCedula(normalizada);

    if (!ficha) {
      this.ficha.set(null);
      this.certificado.set(null);
      this.error.set(
        'No encontramos un ciudadano con esa cédula. Revisa el número e inténtalo de nuevo.',
      );
      return;
    }

    this.cedula.set(normalizada);
    this.ficha.set(ficha);
    this.certificado.set(this.subregion.certificadoPublicoDeCiudadano(ficha.ciudadano.id));
  }

  protected enviarCertificado(): void {
    const certificado = this.certificado();

    if (!certificado || !this.puedeEnviar()) {
      return;
    }

    const registrado = this.subregion.enviarCertificadoPorCorreo(certificado.id);

    if (!registrado) {
      this.error.set('No se pudo registrar el envío. Inténtalo de nuevo.');
      return;
    }

    this.error.set('');
    this.certificado.set(this.subregion.solicitud(certificado.id));
  }

  protected etiquetaEstado(estado: EstadoCertificado): string {
    return this.subregion.etiquetaEstadoCertificado(estado);
  }

  protected claseEstado(estado: EstadoCertificado): string {
    return `consulta-certificado--${estado}`;
  }
}
