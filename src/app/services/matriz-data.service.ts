import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MatrizData {
  matrizInicializada: boolean;
  matrizCaixas: string[][];
  matrizMemorias: string[][];
  insertionLabels: (number | null)[][];
  currentClIndex: number;
  countLinha: number;
  countColuna: number;
  elementosModificados: boolean[][];
  codigoAtual: string; // NOVO
}

@Injectable({
  providedIn: 'root'
})
export class MatrizDataService {
  private matrizDataSubject = new BehaviorSubject<MatrizData>({
    matrizInicializada: false,
    matrizCaixas: [],
    matrizMemorias: [],
    insertionLabels: [],
    currentClIndex: -1,
    countLinha: 0,
    countColuna: 0,
    elementosModificados: [],
    codigoAtual: '' // NOVO
  });

  matrizData$ = this.matrizDataSubject.asObservable();

  atualizarDados(data: MatrizData) {
    console.log('[MatrizDataService] Atualizando dados:', data);
    this.matrizDataSubject.next(data);
  }

  obterDados(): MatrizData {
    return this.matrizDataSubject.value;
  }
}