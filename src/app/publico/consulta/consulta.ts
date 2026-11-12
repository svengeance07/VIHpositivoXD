import { ChangeDetectionStrategy, Component } from '@angular/core';

<<<<<<< Updated upstream
import { PaginaEnConstruccion } from '../../compartido/ui/pagina-en-construccion/pagina-en-construccion';
=======
import { BotonTema } from '../../compartido/ui/boton-tema/boton-tema';
import type { EstadoCertificado } from '../../nucleo/modelos/enumeraciones';
import type {
  FichaCiudadano,
  SolicitudCertificadoVista,
} from '../../nucleo/modelos/subregion-salud';
import { DatosMasterService } from '../../nucleo/servicios/datos-master.service';
import { DatosSubregionSaludService } from '../../nucleo/servicios/datos-subregion-salud.service';
>>>>>>> Stashed changes

@Component({
  selector: 'app-consulta',
<<<<<<< Updated upstream
  imports: [PaginaEnConstruccion],
=======
  imports: [RouterLink, DatePipe, BotonTema],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
>>>>>>> Stashed changes
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-en-construccion
      titulo="Consulta ciudadana"
      subtitulo="Aquí irá la consulta por cédula con verificación por correo, sin necesidad de iniciar sesión."
    />
  `,
})
<<<<<<< Updated upstream
export class Consulta {}
=======
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

  protected imprimirCertificado(): void {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }
}
>>>>>>> Stashed changes
