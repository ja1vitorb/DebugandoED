import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface MostrarEspecificoData {
  indice: string;
  elemento: string;
}

export interface DimensoesMatriz {
  linhas: number;
  colunas: number;
}

export interface MostrarTodosData {
  tipo: 'matriz' | 'vetor';
  // matrix is 2D array, vetor is 1D
  conteudo: string[] | string[][];
}

@Injectable({
  providedIn: 'root'
})
export class ModalDataService {
  private matrizDadosSource = new Subject<DimensoesMatriz>();
  matrizDados$ = this.matrizDadosSource.asObservable();
  
  // Adiciona alias para compatibilidade
  dims$ = this.matrizDados$;

  // Observable para mostrar específico
  private mostrarEspecificoSource = new Subject<MostrarEspecificoData>();
  mostrarEspecificoData$ = this.mostrarEspecificoSource.asObservable();

  // Observable para mostrar todos
  private mostrarTodosSource = new Subject<MostrarTodosData>();
  mostrarTodosData$ = this.mostrarTodosSource.asObservable();

  constructor() {
    console.log('[ModalDataService] Serviço inicializado');
  }

  enviarDadosMatriz(linhas: number, colunas: number) {
    console.log('[ModalDataService] Enviando dados da matriz:', { linhas, colunas });
    this.matrizDadosSource.next({ linhas, colunas });
  }

  // Alias para compatibilidade
  sendDimensions(linhas: number, colunas: number) {
    this.enviarDadosMatriz(linhas, colunas);
  }

  // Método para enviar dados de mostrar específico
  enviarMostrarEspecifico(indice: string, elemento: string) {
    console.log('[ModalDataService] enviarMostrarEspecifico chamado:', { indice, elemento });
    this.mostrarEspecificoSource.next({ indice, elemento });
  }

  // new method to send show-all data
  enviarMostrarTodos(data: MostrarTodosData) {
    console.log('[ModalDataService] enviarMostrarTodos chamado:', data);
    this.mostrarTodosSource.next(data);
  }
}