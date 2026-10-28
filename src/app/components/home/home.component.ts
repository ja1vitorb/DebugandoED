import { Component} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [RouterModule, CommonModule, TranslateModule]
})
export class HomeComponent {
  title = 'debugandoed';
    menuItems = [
      { labelKey: 'HOME.CARDS.VECTOR.LABEL', icon: 'vetor.svg', route: '/vetor', descricaoKey: 'HOME.CARDS.VECTOR.DESCRIPTION', corpo: 'corpoVetor.svg', corpoRoute: '/corpoVetor'},
      { labelKey: 'HOME.CARDS.MATRIX.LABEL', icon: 'matriz.svg', route: '/matriz', descricaoKey: 'HOME.CARDS.MATRIX.DESCRIPTION', corpo: 'corpoMatriz.svg',corpoRoute: '/corpoMatriz'},
      { labelKey: 'HOME.CARDS.POINTER.LABEL', icon: 'ponteiro.svg', route: '/ponteiro', descricaoKey: 'HOME.CARDS.POINTER.DESCRIPTION', corpo: 'corpoPonteiro.svg', corpoRoute: '/corpoPonteiro' },
      { labelKey: 'HOME.CARDS.STACK.LABEL', icon: 'pilha.svg', route: '/pilha', descricaoKey: 'HOME.CARDS.STACK.DESCRIPTION', corpo: 'corpoPilha.svg', corpoRoute: '/corpoPilha'},
      { labelKey: 'HOME.CARDS.QUEUE.LABEL', icon: 'fila.svg', route: '/filas', descricaoKey: 'HOME.CARDS.QUEUE.DESCRIPTION', corpo: 'corpoFila.svg', corpoRoute: '/corpoFila' },
      { labelKey: 'HOME.CARDS.LIST.LABEL', icon: 'lista.svg', route: '/listas', descricaoKey: 'HOME.CARDS.LIST.DESCRIPTION', corpo: 'corpoListas.svg', corpoRoute: '/corpoListas' },
    ];
  
    getImagePath(icon: string): string {
      return `./images/${icon}`;
    }
}
