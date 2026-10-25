import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PaginaEnConstruccion } from '../../../../compartido/ui/pagina-en-construccion/pagina-en-construccion';

@Component({
  selector: 'app-personal-salud-inicio',
  imports: [PaginaEnConstruccion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-en-construccion
      titulo="Panel del centro de salud"
      subtitulo="Aquí irán la gestión de pacientes, la vacunación y los certificados del centro."
    />
  `,
})
export class PersonalSaludInicio {}
