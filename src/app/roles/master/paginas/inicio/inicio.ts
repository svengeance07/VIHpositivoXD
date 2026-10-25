import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PaginaEnConstruccion } from '../../../../compartido/ui/pagina-en-construccion/pagina-en-construccion';

@Component({
  selector: 'app-master-inicio',
  imports: [PaginaEnConstruccion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-en-construccion
      titulo="Panel del master"
      subtitulo="Aquí irán la administración general, la gestión de personal y los reportes del sistema."
    />
  `,
})
export class MasterInicio {}
