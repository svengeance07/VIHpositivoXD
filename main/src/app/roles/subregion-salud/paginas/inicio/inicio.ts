import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PaginaEnConstruccion } from '../../../../compartido/ui/pagina-en-construccion/pagina-en-construccion';

@Component({
  selector: 'app-subregion-salud-inicio',
  imports: [PaginaEnConstruccion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-en-construccion
      titulo="Panel de la subregión"
      subtitulo="Aquí irán la coordinación de centros, la autorización de certificados y los reportes estadales."
    />
  `,
})
export class SubregionSaludInicio {}
