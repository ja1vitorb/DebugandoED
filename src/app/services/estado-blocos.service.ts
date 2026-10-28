import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoBlocosService {
  private estadoVisivelSource = new BehaviorSubject<boolean>(false);

  estadoVisivel$ = this.estadoVisivelSource.asObservable();
  constructor() { }

  mudarEstado(novoEstado: boolean) {
    this.estadoVisivelSource.next(novoEstado);
  }

  toggleEstado() {
    const estadoAtual = this.estadoVisivelSource.getValue();
    this.estadoVisivelSource.next(!estadoAtual);
  }
}
