import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PaginaEnConstruccion } from '../../compartido/ui/pagina-en-construccion/pagina-en-construccion';

@Component({
  selector: 'app-consulta',
  imports: [PaginaEnConstruccion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-en-construccion
      titulo="Consulta ciudadana"
      subtitulo="Aquí irá la consulta por cédula con verificación por correo, sin necesidad de iniciar sesión."
    />
  `,
})
export class Consulta {}
