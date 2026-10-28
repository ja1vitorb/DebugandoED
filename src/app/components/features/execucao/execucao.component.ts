import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModalDataService } from '../../../services/modal-data.service';
import { InsertService } from '../../../services/insert.service';
import { DeleteService } from '../../../services/delete.service';
import { MatrizDataService } from '../../../services/matriz-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-execucao',
  imports: [TranslateModule, CommonModule], 
  templateUrl: './execucao.component.html',
  styleUrl: './execucao.component.scss'
})
export class ExecucaoComponent implements OnDestroy, OnInit {
  icon = 'interrogaSimbol.svg'
  reset = 'reset.svg'
  mostra = 'mostraIcon.svg'
  apaga = 'apaga.svg'
  insere = 'insere.svg'
  inicia = 'inicializaVet.svg'

  matrizInicializada = false;
  matrizCaixas: string[][] = []; 
  matrizMemorias: string[][] = [];
  lixosOriginais: string[][] = [];
  elementosModificados: boolean[][] = [];
  countLinha: number = 0;
  countColuna: number = 0;

  insertCounter: number = 0;
  insertionLabels: (number | null)[][] = [];
  currentClIndex: number = -1;
 
  // Controle do endereço base de memória
  private enderecoBaseMemoria: number = 0x000000;
  private incrementoMemoria: number = 0x000004; // incremento de 4 bytes (tamanho típico de int)
 
  private dimsSub?: Subscription;
  private insertSub?: Subscription;
  private deleteSub?: Subscription;

  elementoExcluido: { i: number; j: number } | null = null;
  elementosMovidos: Set<string> = new Set();
  elementosExcluidos: boolean[][] = [];
  elementosInicializados: boolean[][] = []; // NOVO: rastreia elementos inicializados em azul

  // Adicione esta propriedade após as outras
  codigoAtual: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private modalDataService: ModalDataService,
    private insertService: InsertService,
    private deleteService: DeleteService,
    private matrizDataService: MatrizDataService
  ) {
    this.dimsSub = this.modalDataService.dims$.subscribe(d => {
      console.log(`[ExecucaoComponent] Dimensões recebidas -> ${d.linhas}x${d.colunas}`);
      this.criarMatriz(d.linhas, d.colunas);
    });

    this.insertSub = this.insertService.insert$.subscribe(v => this.handleInsertFromTopo(v));
    this.deleteSub = this.deleteService.del$.subscribe(p => this.handleDeleteFromTopo(p.linha, p.coluna));

    (window as any).inicializarMatrizComZeros = () => {
      console.log('[ExecucaoComponent] inicializarMatrizComZeros() foi chamada!');
      this.inicializarMatrizComZeros();
    };
  }

  ngOnInit(): void {
    (window as any).inicializarMatrizComZeros = () => {
      this.inicializarMatrizComZeros();
    };
  }

  ngOnDestroy(): void {
    this.insertSub?.unsubscribe();
    this.dimsSub?.unsubscribe();
    this.deleteSub?.unsubscribe();
    if ((window as any).inicializarMatrizComZeros) {
      delete (window as any).inicializarMatrizComZeros;
    }
  }

  // Método para enviar dados atualizados para o serviço
  private enviarDadosParaServico() {
    console.log('[ExecucaoComponent] Enviando dados para serviço:', {
      currentClIndex: this.currentClIndex,
      matrizCaixas: this.matrizCaixas.length
    });
    
    this.matrizDataService.atualizarDados({
      matrizInicializada: this.matrizInicializada,
      matrizCaixas: [...this.matrizCaixas.map(row => [...row])],
      matrizMemorias: [...this.matrizMemorias.map(row => [...row])],
      insertionLabels: [...this.insertionLabels.map(row => [...row])],
      currentClIndex: this.currentClIndex,
      countLinha: this.countLinha,
      countColuna: this.countColuna,
      elementosModificados: [...this.elementosModificados.map(row => [...row])],
      codigoAtual: this.codigoAtual // NOVO
    });
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

  resetPagina() {
    console.log("Chamou resetPagina");
    this.matrizInicializada = false;
    this.matrizCaixas = [];
    this.matrizMemorias = [];
    this.lixosOriginais = [];
    this.elementosModificados = [];
    this.insertionLabels = [];
    this.elementosExcluidos = []; // NOVO
    this.countLinha = 0;
    this.countColuna = 0;
    this.currentClIndex = -1;
    this.insertCounter = 0;
    this.enderecoBaseMemoria = 0x000000;
    this.codigoAtual = '';
    this.enviarDadosParaServico();
    this.cdr.detectChanges();
  }

  abrirModalC() {
    let modal = document.getElementById("modal") as HTMLElement
    modal.style.display = "block";
  }

  fecharModal() {
    let modal = document.getElementById("modal") as HTMLElement
    modal.style.display = "none";
  }

  abrirModal() {
    // open the general execution explanation modal defined in ModalComponent
    console.log("Chamou abrirModal (explicação execução)");
    const modal = document.getElementById("modalExecucao") as HTMLElement;
    if (modal) {
      modal.style.display = "block";
    }
  }

  abrirModalTodas() {
    console.log("Chamou abrirModalTodas");
    let modal = document.getElementById("modalMostraTodas") as HTMLElement
    modal.style.display = "block";
  }

  modalSemEstrutura() {
    console.log("Chamou modalSemEstrutura");
    let modal = document.getElementById("SemVetor") as HTMLElement
    modal.style.display = "block";
  }

  /**
   * Gera endereço de memória sequencial
   * @param index Índice linear da posição na matriz
   * @returns Endereço no formato 0xXXXXXX
   */
  gerarEnderecoMemoria(index: number): string {
    const endereco = this.enderecoBaseMemoria + (index * this.incrementoMemoria);
    return '0x' + endereco.toString(16).padStart(6, '0');
  }

  gerarLixoMemoria(): string {
    const caracteres = '0123456789abcdef#!@$*&%+';
    let lixo = '';
    for (let i = 0; i < 4; i++) {
      const aleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      lixo += aleatorio;
    }
    return lixo;
  }

  criarMatriz(linhas: number, colunas: number) {
    this.countLinha = Math.max(1, Math.floor(linhas));
    this.countColuna = Math.max(1, Math.floor(colunas));
 
    this.insertCounter = 1;
    
    // Define um endereço base aleatório para começar
    this.enderecoBaseMemoria = Math.floor(Math.random() * 0x100000);
 
    this.matrizCaixas = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => '')
    );
    this.matrizMemorias = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => '')
    );
    this.lixosOriginais = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => '')
    );
    this.elementosModificados = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => false)
    );
    this.insertionLabels = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => null)
    );
    this.elementosExcluidos = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => false)
    );
    this.elementosInicializados = Array.from({ length: this.countLinha }, () =>
      Array.from({ length: this.countColuna }, () => false)
    );
     
    if (this.countLinha > 0 && this.countColuna > 0) {
      this.insertionLabels[0][0] = 0;
      this.currentClIndex = 0;
    }
 
    // Preenche com LIXO e endereços SEQUENCIAIS
    let linearIndex = 0;
    for (let i = 0; i < this.countLinha; i++) {
      for (let j = 0; j < this.countColuna; j++) {
        const lixo = this.gerarLixoMemoria();
        this.matrizCaixas[i][j] = lixo;
        this.lixosOriginais[i][j] = lixo;
        this.matrizMemorias[i][j] = this.gerarEnderecoMemoria(linearIndex);
        linearIndex++;
      }
    }

    // CÓDIGO INICIAL - CRIAÇÃO DA MATRIZ
    this.codigoAtual = `int cl = 0;\nint matriz[${this.countLinha}][${this.countColuna}];`;
 
    this.matrizInicializada = true;
    console.log('[criarMatriz] Matriz CRIADA com endereços sequenciais');
    
    this.enviarDadosParaServico();
    this.cdr.detectChanges();
  }

  inicializarMatrizComZeros() {
    console.log('[inicializarMatrizComZeros] Iniciando...');

    if (!this.matrizInicializada) {
      console.warn('[inicializarMatrizComZeros] Matriz não foi criada ainda');
      return;
    }

    for (let i = 0; i < this.countLinha; i++) {
      for (let j = 0; j < this.countColuna; j++) {
        this.matrizCaixas[i][j] = '0';
        this.lixosOriginais[i][j] = '0';
        this.elementosModificados[i][j] = false; // NÃO marca como modificado
        this.elementosExcluidos[i][j] = false; // Remove marca de excluído
        this.elementosInicializados[i][j] = true; // MARCA COMO INICIALIZADO (AZUL)
        this.insertionLabels[i][j] = null; // Remove labels
      }
    }

    this.insertCounter = 1;
    this.currentClIndex = 0;

    // ATUALIZA O CÓDIGO PARA INICIALIZAÇÃO
    this.codigoAtual = `// Inicializando matriz com zeros\nfor(int i = 0; i < ${this.countLinha}; i++) {\n  for(int j = 0; j < ${this.countColuna}; j++) {\n    matriz[i][j] = 0;\n  }\n}`;

    console.log('[inicializarMatrizComZeros] Concluído - todos em azul');
    
    this.enviarDadosParaServico();
    this.cdr.detectChanges();
  }

  editarCelula(linha: number, coluna: number, novoValor: string) {
    if (linha < 0 || linha >= this.countLinha || coluna < 0 || coluna >= this.countColuna) return;
    this.matrizCaixas[linha][coluna] = novoValor;
    this.elementosModificados[linha][coluna] = true;
    this.enviarDadosParaServico();
    this.cdr.detectChanges();
  }

  isLixo(i: number, j: number): boolean {
    if (!this.lixosOriginais || !this.lixosOriginais[i] || !this.lixosOriginais[i][j]) return false;
    return this.matrizCaixas[i][j] === this.lixosOriginais[i][j];
  }

  isCurrentCl(i: number, j: number): boolean {
    const idx = i * this.countColuna + j;
    return idx === this.currentClIndex;
  }

  isElementoMovido(i: number, j: number): boolean {
    return this.elementosMovidos.has(`${i},${j}`);
  }

  isElementoExcluido(i: number, j: number): boolean {
    return this.elementosExcluidos[i] && this.elementosExcluidos[i][j];
  }

  isElementoInicializado(i: number, j: number): boolean {
    return this.elementosInicializados[i] && this.elementosInicializados[i][j];
  }

  handleInsertFromTopo(value: string) {
    console.log('[handleInsertFromTopo] Valor recebido:', value);

    if (!this.matrizInicializada) {
      console.warn('[handleInsertFromTopo] Matriz não inicializada');
      return;
    }

    const total = this.countLinha * this.countColuna;
    if (this.currentClIndex < 0) {
      this.currentClIndex = 0;
    }

    if (this.currentClIndex >= total) {
      alert('Matriz cheia! Não é possível inserir mais elementos.');
      return;
    }

    const i = Math.floor(this.currentClIndex / this.countColuna);
    const j = this.currentClIndex % this.countColuna;

    this.matrizCaixas[i][j] = value;
    this.elementosModificados[i][j] = true;
    this.insertionLabels[i][j] = this.insertCounter;
    this.elementosExcluidos[i][j] = false; // REMOVE a marca de excluído
    this.elementosInicializados[i][j] = false; // REMOVE a marca de inicializado

    console.log(`[handleInsertFromTopo] Inserido "${value}" em [${i},${j}]`);

    // GERA O CÓDIGO DA INSERÇÃO (SEM acumular código anterior)
    this.codigoAtual = `i = ${i};\nj = ${j};\nmatriz[i][j] = ${value};\ncl = cl + 1;`;

    this.insertCounter++;
    this.currentClIndex++;

    console.log(`[handleInsertFromTopo] currentClIndex agora é ${this.currentClIndex}`);
    
    this.enviarDadosParaServico();
    this.cdr.detectChanges();
  }

  handleDeleteFromTopo(linha: number, coluna: number) {
    console.log(`[handleDeleteFromTopo] Solicitado apagar [${linha},${coluna}]`);

    if (!this.matrizInicializada) {
      console.warn('[handleDeleteFromTopo] Matriz não inicializada');
      return;
    }

    if (linha < 0 || linha >= this.countLinha || coluna < 0 || coluna >= this.countColuna) {
      alert('Posição inválida!');
      return;
    }

    if (this.insertionLabels[linha][coluna] === null) {
      alert('Não há elemento válido nesta posição para apagar.');
      return;
    }

    // CÓDIGO DE REMOÇÃO COM ESTRUTURA WHILE
    this.codigoAtual = `i = ${linha};\nj = ${coluna};\n\nwhile (i < ${this.countLinha})\n{\n  while (j < ${this.countColuna})\n  {\n    if (i == ${linha} && j != ${coluna})\n    {\n      mat[i][j] = mat[i + 1][0];\n    }\n    else\n    {\n      mat[i][j] = mat[i][j + 1];\n    }\n    j++;\n  }\n  i++;\n  j = 0;\n}\ncl = cl - 1;`;

    const removedIndex = linha * this.countColuna + coluna;
    
    // MARCA O ELEMENTO COMO EXCLUÍDO (mantém o valor visível em VERMELHO)
    this.elementoExcluido = { i: linha, j: coluna };
    
    this.enviarDadosParaServico();
    this.cdr.detectChanges();

    // Aguarda 2 segundos para mostrar o elemento vermelho antes de fazer o shift
    setTimeout(() => {
      this.realizarRemocao(linha, coluna, removedIndex);
    }, 2000);
  }

  private realizarRemocao(linha: number, coluna: number, removedIndex: number): void {
    const total = this.countLinha * this.countColuna;

    console.log(`[realizarRemocao] Iniciando remoção de [${linha},${coluna}]`);

    // Encontra o último elemento inserido
    let lastModified = -1;
    for (let k = total - 1; k >= 0; k--) {
      const ri = Math.floor(k / this.countColuna);
      const rj = k % this.countColuna;
      if (this.insertionLabels[ri][rj] !== null) {
        lastModified = k;
        break;
      }
    }

    if (lastModified === -1) {
      console.warn('Nenhum elemento inserido encontrado.');
      this.elementoExcluido = null;
      this.enviarDadosParaServico();
      this.cdr.detectChanges();
      return;
    }

    console.log(`[realizarRemocao] Último elemento no índice ${lastModified}`);

    // CASO 1: Removendo o último elemento
    if (removedIndex === lastModified) {
      // Marca como excluído e remove os marcadores
      this.elementosExcluidos[linha][coluna] = true;
      this.elementosInicializados[linha][coluna] = false; // Remove inicializado
      this.insertionLabels[linha][coluna] = null;
      this.elementosModificados[linha][coluna] = false;
      
      // cl volta para a posição do elemento excluído (não decrementa)
      this.currentClIndex = removedIndex;
      this.elementoExcluido = null;
      
      console.log(`[realizarRemocao] Último elemento removido - cl = ${this.currentClIndex}`);
      this.enviarDadosParaServico();
      this.cdr.detectChanges();
      return;
    }

    // CASO 2: Removendo elemento do meio - fazer shift completo
    this.elementosMovidos.clear();

    console.log(`[realizarRemocao] Fazendo shift de ${removedIndex} até ${lastModified}`);

    // Faz o shift: move todos os elementos após o removido uma posição para trás
    for (let k = removedIndex; k < lastModified; k++) {
      const fromI = Math.floor((k + 1) / this.countColuna);
      const fromJ = (k + 1) % this.countColuna;
      const toI = Math.floor(k / this.countColuna);
      const toJ = k % this.countColuna;

      console.log(`[realizarRemocao] Movendo [${fromI}][${fromJ}] -> [${toI}][${toJ}]: ${this.matrizCaixas[fromI][fromJ]}`);

      // Move TODOS os dados da célula
      this.matrizCaixas[toI][toJ] = this.matrizCaixas[fromI][fromJ];
      this.elementosModificados[toI][toJ] = this.elementosModificados[fromI][fromJ];
      this.insertionLabels[toI][toJ] = this.insertionLabels[fromI][fromJ];
      this.elementosExcluidos[toI][toJ] = false; // NÃO copia marca de excluído
      this.elementosInicializados[toI][toJ] = this.elementosInicializados[fromI][fromJ]; // Copia inicializado
      
      this.elementosMovidos.add(`${toI},${toJ}`);
    }

    // A última posição agora fica com o elemento que foi excluído (vermelho)
    const lastI = Math.floor(lastModified / this.countColuna);
    const lastJ = lastModified % this.countColuna;
    
    console.log(`[realizarRemocao] Última posição [${lastI}][${lastJ}] recebe elemento excluído`);
    
    // Mantém o valor original do elemento excluído na última posição
    this.matrizCaixas[lastI][lastJ] = this.matrizCaixas[linha][coluna];
    this.elementosExcluidos[lastI][lastJ] = true; // Marca como excluído
    this.elementosInicializados[lastI][lastJ] = false; // Remove inicializado
    this.insertionLabels[lastI][lastJ] = null; // Remove label
    this.elementosModificados[lastI][lastJ] = false; // Remove modificado

    // Atualiza o índice cl: aponta para a última posição válida (antes do excluído)
    this.currentClIndex = lastModified;

    console.log(`[realizarRemocao] Shift concluído. cl = ${this.currentClIndex}`);
    
    // Remove os marcadores visuais temporários
    this.elementoExcluido = null;
    this.elementosMovidos.clear();
    
    this.enviarDadosParaServico();
    this.cdr.detectChanges();
  }
}
