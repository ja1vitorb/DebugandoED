import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { EstadoBlocosService } from '../../../services/estado-blocos.service';
import { InsertService } from '../../../services/insert.service';
import { DeleteService } from '../../../services/delete.service';
import { MatrizDataService, MatrizData } from '../../../services/matriz-data.service';
import { ModalDataService } from '../../../services/modal-data.service'; // ADICIONAR IMPORT

@Component({
  selector: 'app-blocos-topo',
  imports: [TranslateModule, CommonModule],
  templateUrl: './blocos-topo.component.html',
  styleUrl: './blocos-topo.component.scss'
})
export class BlocosTopoComponent implements OnInit, OnDestroy {
  // Título da página - DEVE ESTAR AQUI
  tituloPag: string = 'MATRIX.TITLE';

  // Dados recebidos do serviço
  matrizInicializada: boolean = false;
  matrizCaixas: string[][] = [];
  matrizMemorias: string[][] = [];
  insertionLabels: (number | null)[][] = [];
  currentClIndex: number = -1;
  countLinha: number = 0;
  countColuna: number = 0;
  elementosModificados: boolean[][] = [];

  icon = 'interrogaSimbol.svg'
  reset = 'reset.svg'
  mostra = 'mostraIcon.svg'
  apaga = 'apaga.svg'
  insere = 'insere.svg'
  inicia = 'inicializaVet.svg'

  Math = Math;

  private matrizDataSub?: Subscription;
  private estadoSub?: Subscription;

  // Adicione esta propriedade após as outras
  codigoAtual: string = '';

  constructor(
    private estadoBlocosService: EstadoBlocosService,
    private insertService: InsertService,
    private deleteService: DeleteService,
    private matrizDataService: MatrizDataService,
    private modalDataService: ModalDataService, // ADICIONAR INJEÇÃO
    private cdr: ChangeDetectorRef
  ) {
    console.log('[BlocosTopoComponent] Constructor chamado');
  }
  
  ngOnInit(): void {
    console.log('[BlocosTopoComponent] ngOnInit');

    // Inscreve-se nos dados da matriz
    this.matrizDataSub = this.matrizDataService.matrizData$.subscribe(data => {
      console.log('[BlocosTopoComponent] Recebeu dados da matriz:', {
        currentClIndex: data.currentClIndex,
        matrizInicializada: data.matrizInicializada
      });
      
      this.matrizInicializada = data.matrizInicializada;
      this.matrizCaixas = data.matrizCaixas;
      this.matrizMemorias = data.matrizMemorias;
      this.insertionLabels = data.insertionLabels;
      this.currentClIndex = data.currentClIndex;
      this.countLinha = data.countLinha;
      this.countColuna = data.countColuna;
      this.elementosModificados = data.elementosModificados;
      this.codigoAtual = data.codigoAtual;
      
      // Força detecção de mudanças
      this.cdr.detectChanges();
    });

    this.estadoSub = this.estadoBlocosService.estadoVisivel$.subscribe(estado => {
      console.log('[BlocosTopoComponent] Estado atualizado via service:', estado);
    });
  }
  
  ngOnDestroy(): void {
    this.matrizDataSub?.unsubscribe();
    this.estadoSub?.unsubscribe();
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

  abrirModalC() {
    let modal = document.getElementById("modal") as HTMLElement
    modal.style.display = "block";
  }

  abrirModal() {
    let modal = document.getElementById("Modal") as HTMLElement;
    modal.style.display = "block"
  }

  modalSemEstrutura() {
    let modalSemEstrutura = document.getElementById("SemVetor") as HTMLElement;
    modalSemEstrutura.style.display = "block"
  }

  abrirModalCodigo() {
    // hide any other explanation modal that might be open
    const base = document.getElementById('Modal') as HTMLElement;
    if (base) base.style.display = 'none';
    const mem = document.getElementById('modalMemoria') as HTMLElement;
    if (mem) mem.style.display = 'none';
    const exec = document.getElementById('modalExecucao') as HTMLElement;
    if (exec) exec.style.display = 'none';

    const modal = document.getElementById('modalCodigo') as HTMLElement;
    if (modal) {
      modal.style.display = 'block';
    }
  }

  abrirModalMemoria() {
    const base = document.getElementById('Modal') as HTMLElement;
    if (base) base.style.display = 'none';
    const cod = document.getElementById('modalCodigo') as HTMLElement;
    if (cod) cod.style.display = 'none';
    const exec = document.getElementById('modalExecucao') as HTMLElement;
    if (exec) exec.style.display = 'none';

    const modal = document.getElementById('modalMemoria') as HTMLElement;
    if (modal) {
      modal.style.display = 'block';
    }
  }

  reiniciarPagina(): void {
    window.location.reload();
  }

  mostrarEspecifico(): void {
    console.log('🔍 [BlocosTopoComponent] mostrarEspecifico chamado');
    
    const linEl = document.getElementById('insereMostraLinha') as HTMLInputElement | null;
    const colEl = document.getElementById('insereMostraColuna') as HTMLInputElement | null;
    
    if (!linEl || !colEl) {
      console.error('❌ Inputs não encontrados');
      return;
    }

    const linha = parseInt(linEl.value, 10);
    const coluna = parseInt(colEl.value, 10);
    
    console.log('🔍 Valores lidos:', { linha, coluna });

    if (!Number.isFinite(linha) || !Number.isFinite(coluna)) {
      console.warn('⚠️ Valores inválidos');
      return;
    }
    
    if (linha < 0 || linha >= this.countLinha || coluna < 0 || coluna >= this.countColuna) {
      console.warn(`⚠️ Posição inválida! Linha: ${linha}, Coluna: ${coluna}`);
      return;
    }

    const elemento = this.matrizCaixas[linha][coluna];
    const indice = `${linha}][${coluna}`;

    console.log('✅ Enviando para modal:', { indice, elemento });

    // Envia os dados para o modal através do serviço
    this.modalDataService.enviarMostrarEspecifico(indice, elemento);
    
    // Limpa os inputs
    linEl.value = '';
    colEl.value = '';
  }

  apagarPosicao(): void {
    const linEl = document.getElementById('apagaLinha') as HTMLInputElement | null;
    const colEl = document.getElementById('apagaColuna') as HTMLInputElement | null;
    const linha = linEl ? parseInt(linEl.value, 10) : NaN;
    const coluna = colEl ? parseInt(colEl.value, 10) : NaN;
    if (!Number.isFinite(linha) || !Number.isFinite(coluna)) return;

    this.deleteService.sendDelete({ linha, coluna });

    if (linEl) linEl.value = '';
    if (colEl) colEl.value = '';
  }

  inserirElemento(): void {
    const el = document.getElementById('insereElemento') as HTMLInputElement | null;
    if (!el) return;
    const val = (el.value ?? '').trim();
    if (val === '') return;
    this.insertService.sendInsert(val);
    el.value = '';
  }

  onKeyPressMostrar(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.mostrarEspecifico();
    }
  }

  onKeyPressApagar(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.apagarPosicao();
    }
  }

  onKeyPressInserir(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.inserirElemento();
    }
  }

  inicializarMatrizClick() {
    console.log('[BlocosTopoComponent] inicializarMatrizClick chamado');
    
    if (typeof (window as any).inicializarMatrizComZeros === 'function') {
      console.log('[BlocosTopoComponent] Chamando função global inicializarMatrizComZeros');
      (window as any).inicializarMatrizComZeros();
    } else {
      console.error('[BlocosTopoComponent] Função inicializarMatrizComZeros não encontrada!');
    }
  }

  // envia todos os elementos da matriz para o modal de mostrar todos
  mostrarTodos(): void {
    console.log('🔍 [BlocosTopoComponent] mostrarTodos chamado');
    if (!this.matrizInicializada) {
      console.warn('⛔ matriz não inicializada, nada a mostrar');
      return;
    }
    // envia matrizCaixas como conteúdo
    this.modalDataService.enviarMostrarTodos({
      tipo: 'matriz',
      conteudo: this.matrizCaixas
    });
  }

  // Getter para o endereço base da memória (endereço da posição atual do cl)
  get matrizMemoriaBase(): string {
    if (this.currentClIndex < 0 || !this.matrizMemorias || this.matrizMemorias.length === 0) {
      return '0x000000';
    }
    
    const i = Math.floor(this.currentClIndex / this.countColuna);
    const j = this.currentClIndex % this.countColuna;
    
    if (this.matrizMemorias[i] && this.matrizMemorias[i][j]) {
      return this.matrizMemorias[i][j];
    }
    
    return '0x000000';
  }

  // Método auxiliar para destacar a célula atual do cl
  isCurrentCl(i: number, j: number): boolean {
    const index = i * this.countColuna + j;
    return index === this.currentClIndex;
  }
}
