import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-encadeada',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './lista-encadeada.component.html',
  styleUrl: './lista-encadeada.component.scss'
})
export class ListaEncadeadaComponent {
tituloPag = 'LINKED_LIST.TITLE';

  menuItems = [
    { labelKey: 'LINKED_LIST.LABEL_INIT', icon: 'lista.svg', route: '/listaEncadeadaInicio', descricaoKey: 'LINKED_LIST.LABEL_DESCRIPTION_INIT', corpo: './listaEncadeadaInsereInicio.svg', corpoRoute: '/corpoFila' },
    { labelKey: 'LINKED_LIST.LABEL_END', icon: 'lista.svg', route: '/listaEncadeadaFim', descricaoKey: 'LINKED_LIST.LABEL_DESCRIPTION_END', corpo: './listaEncadeadaInsereFim.svg', corpoRoute: '/corpoFilaComTroca' },
    { labelKey: 'LINKED_LIST.LABEL_ORDENATE', icon: 'lista.svg', route: '/listaEncadeadaOrdenada', descricaoKey: 'LINKED_LIST.LABEL_DESCRIPTION_ORDENATE', corpo: './listaEncadeadaInsereOrdenado.svg', corpoRoute: '/corpoFilaComTroca' }
  ];

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }
}
