import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listas',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.scss'
})
export class ListasComponent {
  tituloPag = 'LINKED_LIST_END.MODAL.MODAL_TITLE';

  menuItems = [
    { labelKey: 'LINKED_LIST.TITLE', icon: 'lista.svg', route: '/listaEncadeada', descricaoKey: 'LINKED_LIST.DESCRIPTION_TITLE', corpo: './corpoListas.svg', corpoRoute: '/corpoFila' },
    { labelKey: 'LINKED_LIST.DOUBLY_TITLE', icon: 'lista.svg', route: '/listaDuplamenteEncadeada', descricaoKey: 'LINKED_LIST.DESCRIPTION_DOUBLE_TITLE', corpo: './listaDuplamenteEncadeada.svg', corpoRoute: '/corpoFilaComTroca' }
  ];

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }
}
