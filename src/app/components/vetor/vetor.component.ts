import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../features/modal/modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { StructureDataService } from '../../services/structure-data.service';
import { CurrentStructureService } from '../../services/current-structure.service';
import { StructureLoaderService } from '../../services/structure-loader.service';

@Component({
  selector: 'app-vetor',
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './vetor.component.html',
  styleUrl: './vetor.component.scss'
})
export class VetorComponent implements OnInit, OnDestroy {
  icon = 'interrogaSimbol.svg'
  reset = 'reset.svg'
  mostra = 'mostraIcon.svg'
  apaga = 'apaga.svg'
  insere = 'insere.svg'
  inicia = 'inicializaVet.svg'

  codigoVisivel: 'nenhum' | 'count' | 'inicializacao' | 'operacao' = 'nenhum';

  vetorInicializado: boolean = false;

  acao(): string {
    const tamanho = this.vetor.length;
    return `count = 0;\nfor(i = 0; i < ${tamanho}; i++) {\n    vetor[i] = 0;\n}`;
  }
  caixas: string[] = [];
  vetor: string[] = [];
  tipo: string = 'int';
  nome: string = 'vet';
  memoria: string = '0x006120';
  conteudo: string = '0';
  count: number = 0;
  elementosModificados: boolean[] = [];

  exibirForInicializacao: boolean = false;
  mostrarModalExplicacao: boolean = false;

  imgSet = [
    { label: 'printReinicia', icon: 'printReiniciaBtn' }

  ]
  router: any;

  mostrarCodigoInicializacao: boolean = false;

  getResetCountCodigo(): string {
    return `count = 0;`;
  }

  preencherComZeros(): void {
    if (!this.vetorInicializado || this.vetor.length === 0) {
      alert(this.translate.instant('VECTOR.ALERTS.CREATE_FIRST'));
      return;
    }

    // Preenche todas as posições com "0"
    for (let i = 0; i < this.vetor.length; i++) {
      this.vetor[i] = "0";
      this.caixas[i] = "0";
      this.elementosModificados[i] = true;
    }
    this.mostrarCodigoInicializacao = true;

    this.count = 0;
    this.codigoVisivel = 'inicializacao';
    this.cdr.detectChanges();
    this.updateCurrentStructure(); 
  }


  abrirModalExplicacao() {
    const modal = document.getElementById("explicacao-modal") as HTMLElement;
    modal.style.display = "block";
  }

  abrirModalExplicacao2() {
    const modal = document.getElementById("explicacao-modal2") as HTMLElement;
    modal.style.display = "block";
  }

  abrirModalExplicacao3() {
    const modal = document.getElementById("explicacao-modal3") as HTMLElement;
    modal.style.display = "block";
  }

  abrirModalExplicacao4() {
    const modal = document.getElementById("explicacao-modal4") as HTMLElement;
    modal.style.display = "block";
  }

  fecharModalExplicacao() {
    const modal = document.getElementById("explicacao-modal") as HTMLElement;
    modal.style.display = "none";
  }

  fecharModalExplicacao2() {
    const modal = document.getElementById("explicacao-modal2") as HTMLElement;
    modal.style.display = "none";
  }
  fecharModalExplicacao3() {
    const modal = document.getElementById("explicacao-modal3") as HTMLElement;
    modal.style.display = "none";
  }

  fecharModalExplicacao4() {
    const modal = document.getElementById("explicacao-modal4") as HTMLElement;
    modal.style.display = "none";
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }
  transformarNome(nome: string): string {
    return nome.toUpperCase();
  }

  gerarEnderecoMemoria() {
    const caracteres = '01234567890abcdef'
    let endereco = '0x'
    for (let i = 0; i < 8; i++) {
      const aleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      endereco += aleatorio
    }

    return endereco;
  }

  proximoCount() {
    if (this.count < this.caixas.length - 1) {
      this.count++;
    }
  }


  gerarLixoMemoria() {
    const caracteres = '01234567890abcdef#!@$*&%+'
    let endereco = ''
    for (let i = 0; i < 4; i++) {
      const aleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      endereco += aleatorio
    }

    return endereco;
  }
  gerarCaixas() {
    let endereco = this.gerarLixoMemoria()
    this.caixas.push(endereco);
  }

  abrirModalC() {
    let modal = document.getElementById("modal") as HTMLElement
    modal.style.display = "block";
  }

  abrirModal() {
    let modal = document.getElementById("explicacao-modal4") as HTMLElement
    modal.style.display = "block";
  }

  semVet() {
    let modal = document.getElementById("SemVetor") as HTMLElement
    modal.style.display = "block";
  }

  fecharSemVet() {
    let modal = document.getElementById("SemVetor") as HTMLElement
    modal.style.display = "none";
  }

  fecharModal() {
    let modal = document.getElementById("modal") as HTMLElement
    modal.style.display = "none";
  }

  iniciaVet(event?: KeyboardEvent) {
    if (event && event.key != 'Enter') return;
    const tamanhoInput = document.getElementById("tamanhoVetor") as HTMLInputElement
    let tamanho: number = parseInt(tamanhoInput.value);

    this.mostrarCodigoInicializacao = true;

    this.exibirForInicializacao = true;

    if (isNaN(tamanho) || tamanho < 1) {
      alert(this.translate.instant('VECTOR.ALERTS.INVALID_SIZE'));
      return;
    }
    else if (tamanho > 60) {
      tamanho = 60
    }
    this.vetorInicializado = true;
    this.caixas = [];
    this.vetor = [];

    for (let i = 0; i < tamanho; i++) {
      this.gerarCaixas();
    }
    this.inicializarVetor(tamanho)
    this.fecharModal()

    this.codigoVisivel = 'count';
  }

  vetorMemorias: string[] = [];
  lixosOriginais: string[] = [];

  inicializarVetor(tamanho: number): void {
    console.log("Iniciando vetor com tamanho:", tamanho); // ADICIONE
    this.mostrarCodigoInicializacao = true;
    this.vetorInicializado = true;
    this.exibirForInicializacao = true;

    console.log("Estado após inicialização:", {
      vetorInicializado: this.vetorInicializado,
      mostrarCodigoInicializacao: this.mostrarCodigoInicializacao
    });

    this.vetor = [];
    this.caixas = [];
    this.vetorMemorias = [];
    this.lixosOriginais = [];
    this.elementosModificados = [];

    this.mostrarCodigoInicializacao = true;

    for (let i = 0; i < tamanho; i++) { 
      const lixo = this.gerarLixoMemoria();
      this.vetor.push(lixo);
      this.caixas.push(lixo);
      this.vetorMemorias.push(this.gerarEnderecoMemoria());
      this.lixosOriginais.push(lixo);
    }

    this.conteudo = this.vetor[0] || '';
    this.elementosModificados = new Array(tamanho).fill(false);
    
    this.updateStructureData();
  }



  linguagemCodigo: 'c' | 'java' | 'python' | 'javascript' | 'pseudocodigo' = 'c';
  gerarCodigoLoop(linguagem: 'c' | 'java' | 'python' | 'javascript' | 'pseudocodigo'): string {
    const tamanho = this.vetor.length;

    const templates = {
      c: [
        `for (int i = 0; i < ${tamanho}; i++) {`,
        '    printf("%s ", vetor[i]);',
        '}'
      ],
      java: [
        `for (int i = 0; i < ${tamanho}; i++) {`,
        '    System.out.print(vetor[i] + " ");',
        '}'
      ],
      python: [
        'print(vetor[i])'
      ],
      javascript: [
        `for (let i = 0; i < ${tamanho}; i++) {`,
        '    console.log(vetor[i]);',
        '}'
      ],
      pseudocodigo: [
        `para i de 0 até ${tamanho - 1} faça`,
        '    escreva(vetor[i])',
        'fim_para'
      ]
    };

    return templates[linguagem].join('\n');
  }

  operacaoAtual: 'insercao' | 'remocao' = 'insercao';
  indiceRemocao: number = 0;

  gerarCodigo(
    linguagem: 'c' | 'java' | 'python' | 'javascript' | 'pseudocodigo',
    operacao: 'insercao' | 'remocao' | 'inicializacao',
    indice: number
  ): string[] {
    const linhas: string[] = [];

    const templates = {
      c: {
        inicializacao: [
          'count = 0;',
          'for (i = 0; i < 15; i++) {',
          '    vetor[i] = 0;',
          '}'
        ],
        insercao: {
          assign: `vetor[count] = ${this.count > 0 ? this.vetor[this.count - 1] : '0'};\ncount = count + 1;`,
          increment: ''
        },
        remocao: [
          `for (int i = ${indice}; i < count - 1; i++) {`,
          '    vetor[i] = vetor[i + 1];',
          '}',
          'count = count - 1;'
        ]
      },
      java: {
        inicializacao: [
          'count = 0;',
          'for (int i = 0; i < 15; i++) {',
          '    vetor[i] = 0;',
          '}'
        ],
        insercao: {
          assign: `vetor[count] = "${this.count > 0 ? this.vetor[this.count - 1] : '0'}";\n count = count + 1;`,
          increment: ''
        },
        remocao: [
          `for (int i = ${indice}; i < count - 1; i++) {`,
          '    vetor[i] = vetor[i + 1];',
          '}',
          'count--;'
        ]
      },
      python: {
        inicializacao: [
          'count = 0',
          'for i in range(15):',
          '    vetor[i] = 0'
        ],
        insercao: {
          assign: `vetor[count] = ${this.count > 0 ? this.vetor[this.count - 1] : '0'}`,
          increment: 'count += 1'
        },
        remocao: [
          `for i in range(${indice}, count - 1):`,
          '    vetor[i] = vetor[i + 1]',
          'count -= 1'
        ]
      },
      javascript: {
        inicializacao: [
          'count = 0;',
          'for (let i = 0; i < 15; i++) {',
          '    vetor[i] = 0;',
          '}'
        ],
        insercao: {
          assign: `vetor[count] = "${this.count > 0 ? this.vetor[this.count - 1] : '0'}";`,
          increment: 'count++;'
        },
        remocao: [
          `for (let i = ${indice}; i < count - 1; i++) {`,
          '    vetor[i] = vetor[i + 1];',
          '}',
          'count--;'
        ]
      },
      pseudocodigo: {
        inicializacao: [
          'count ← 0',
          'para i de 0 até 14 faça',
          '    vetor[i] ← 0',
          'fim_para'
        ],
        insercao: {
          assign: `vetor[count] ← ${this.count > 0 ? this.vetor[this.count - 1] : '0'}`,
          increment: 'count ← count + 1'
        },
        remocao: [
          `para i de ${indice} até count-2 faça`,
          '    vetor[i] ← vetor[i + 1]',
          'fim_para',
          'count ← count - 1'
        ]
      }
    };

    // Se for inicialização, já retorna o código correspondente
    if (operacao === 'inicializacao') {
      return templates[linguagem].inicializacao;
    }

    // Inserção
    if (operacao === 'insercao') {
      const { assign, increment } = templates[linguagem].insercao;
      linhas.push(assign);
      linhas.push(increment);
      return linhas;
    }

    // Remoção
    if (operacao === 'remocao') {
      return templates[linguagem].remocao;
    }

    return [];
  }


  constructor(
    private cdr: ChangeDetectorRef, 
    private translate: TranslateService,
    private structureDataService: StructureDataService,
    private currentStructureService: CurrentStructureService,
    private structureLoaderService: StructureLoaderService
  ) { }

  ngOnInit(): void {
    this.loadPendingStructure();
    
    this.updateCurrentStructure();
  }

  ngOnDestroy(): void {
    this.currentStructureService.clearCurrentStructure();
  }

  
  private loadPendingStructure(): void {
    const pendingData = this.structureLoaderService.getPendingLoad();
    
    if (pendingData && pendingData.structureType === 'VETOR') {
      this.vetorInicializado = true;
      this.mostrarCodigoInicializacao = true;
      this.exibirForInicializacao = true;
      
      if (pendingData.metadata) {
        this.tipo = pendingData.metadata.tipo || 'int';
        this.nome = pendingData.metadata.nome || 'vet';
        this.count = pendingData.metadata.count || 0;
        this.memoria = pendingData.metadata.memoriaBase || this.gerarEnderecoMemoria();
      }
      
      this.vetor = [];
      this.caixas = [];
      this.elementosModificados = [];
      this.vetorMemorias = [];
      
      pendingData.elements.forEach((element: any, index: number) => {
        this.vetor[index] = element.content || this.gerarLixoMemoria();
        this.caixas[index] = element.content || this.gerarLixoMemoria();
        this.elementosModificados[index] = element.isValidContent || false;
        this.vetorMemorias[index] = element.memory || this.gerarEnderecoMemoria();
      });
      
      this.codigoVisivel = 'count';
      this.cdr.detectChanges();
      this.updateCurrentStructure();
      
      alert(`Vetor "${pendingData.metadata?.nome || 'sem nome'}" carregado com sucesso!`);
    }
  }

  private updateCurrentStructure(): void {
    this.currentStructureService.setCurrentStructure({
      type: 'VETOR',
      name: `${this.nome} [${this.vetor.length}]`,
      data: {
        structureType: 'VETOR',
        size: this.vetor.length,
        elements: this.vetor.map((conteudo, index) => ({
          content: conteudo,
          memory: this.memoria, 
          isValidContent: this.elementosModificados[index] || false,
          index: index
        })),
        metadata: {
          tipo: this.tipo,
          nome: this.nome,
          count: this.count,
          memoriaBase: this.memoria
        }
      },
      canSave: this.vetorInicializado && this.vetor.length > 0
    });
  }
  
  excluirElemento() {
    const input = document.getElementById('apagaMostra') as HTMLInputElement;
    const index = parseInt(input.value.trim());
    this.operacaoAtual = 'remocao';
    this.codigoVisivel = 'operacao';
    this.indiceRemocao = parseInt(input.value.trim());
    if (isNaN(index) || index < 0 || index >= this.vetor.length) {
      alert(this.translate.instant('VECTOR.ALERTS.INVALID_INDEX'));
      return;
    }

    if (!this.elementosModificados[index]) {
      alert(this.translate.instant('VECTOR.ALERTS.REMOVE_ONLY_ACTIVE'));
      return;
    }
    if (index === this.count - 1) {
      this.elementosModificados[index] = false;
      this.count--;
    }
    else {
      for (let i = index; i < this.count - 1; i++) {
        this.vetor[i] = this.vetor[i + 1];
        this.caixas[i] = this.caixas[i + 1];
        this.elementosModificados[i] = this.elementosModificados[i + 1];
      }
      this.vetor[this.count - 1] = this.vetor[this.count - 2];
      this.caixas[this.count - 1] = this.caixas[this.count - 2];
      this.elementosModificados[this.count - 1] = false;

      this.count--;
    }


    input.value = '';
    this.cdr.detectChanges();
    this.updateCurrentStructure(); // Atualiza estado para salvar
    
    this.updateStructureData();
  }


  elementoEspecifico: string = '';
  indiceEspecifico: number = 0;

  mostrarEspecifico(event?: KeyboardEvent) {
    if (event && event.key != 'Enter') return;
    const input = document.getElementById('insereMostra') as HTMLInputElement;
    const index = parseInt(input.value.trim());

    if (isNaN(index) || index < 0 || index >= this.vetor.length) {
      alert(this.translate.instant('VECTOR.ALERTS.INVALID_INDEX'));
      return;
    }

    this.indiceEspecifico = index;
    this.elementoEspecifico = this.vetor[index];

    this.abrirModalEspecifico();

    input.value = '';
  }

  abrirModalEspecifico() {
    const modal = document.getElementById("modalMostraEspecifico") as HTMLElement;
    modal.style.display = "block";
  }

  fecharModalEspecifico() {
    const modal = document.getElementById("modalMostraEspecifico") as HTMLElement;
    modal.style.display = "none";
  }


  abrirModalTodas() {
    const modal = document.getElementById("modalMostraTodas") as HTMLElement;
    modal.style.display = "block";
  }

  fecharModalTodas() {
    const modal = document.getElementById("modalMostraTodas") as HTMLElement;
    modal.style.display = "none";
  }


  adicionarElemento(event?: KeyboardEvent) {
    if (event && event.key != 'Enter') return;
    const input = document.getElementById('insereElemento') as HTMLInputElement;
    const valor = input.value.trim();
    this.operacaoAtual = 'insercao';
    this.codigoVisivel = 'operacao';

    this.mostrarCodigoInicializacao = false;

    if (valor === '') {
      alert(this.translate.instant('VECTOR.ALERTS.INVALID_VALUE'));
      return;
    }

    if (this.count >= this.vetor.length) {
      alert(this.translate.instant('VECTOR.ALERTS.VECTOR_FULL'));
      return;
    }

    if (this.count <= this.vetor.length) {
      const novoVetor = [...this.vetor];
      const novoCaixas = [...this.caixas];
      const novosElementosModificados = [...this.elementosModificados];

      novoVetor[this.count] = valor;
      novoCaixas[this.count] = valor;
      novosElementosModificados[this.count] = true;

      this.vetor = novoVetor;
      this.caixas = novoCaixas;
      this.elementosModificados = novosElementosModificados;
    }

    this.count++;
    input.value = '';
    this.cdr.detectChanges();
    this.updateCurrentStructure(); // Atualiza estado para salvar
    
    this.updateStructureData();
  }

  btnReinicia() {
    this.fechaTodosBotoes();
    const btnReinicia = document.getElementById("reinicia") as HTMLElement;
    btnReinicia.style.display = "block";
  }

  btnInicializa() {
    this.fechaTodosBotoes();
    const btnInicializar = document.getElementById("inicializar") as HTMLElement;
    btnInicializar.style.display = "block";
  }

  btnMostra() {
    this.fechaTodosBotoes();
    const btnInicializar = document.getElementById("MostrarEspecifico") as HTMLElement;
    btnInicializar.style.display = "block";
  }

  btnExcluir() {
    this.fechaTodosBotoes();
    const btnInicializar = document.getElementById("Excluir") as HTMLElement;
    btnInicializar.style.display = "block";
  }

  btnMostraTodos() {
    this.fechaTodosBotoes();
    const btnMostrarTodos = document.getElementById("MostrarTodos") as HTMLElement;
    btnMostrarTodos.style.display = "block";
  }

  btnInserir() {
    this.fechaTodosBotoes();
    const btnMostrarTodos = document.getElementById("Inserir") as HTMLElement;
    btnMostrarTodos.style.display = "block";
  }

  fechaTodosBotoes() {
    const btnInicializar = document.getElementById("inicializar") as HTMLElement;
    const btnReinicia = document.getElementById("reinicia") as HTMLElement;
    const btnMostrarTodos = document.getElementById("MostrarTodos") as HTMLElement;
    const MostrarEspecifico = document.getElementById("MostrarEspecifico") as HTMLElement;
    const Excluir = document.getElementById("Excluir") as HTMLElement;
    const Inserir = document.getElementById("Inserir") as HTMLElement;
    Inserir.style.display = "none";
    btnMostrarTodos.style.display = "none";
    Excluir.style.display = "none";
    MostrarEspecifico.style.display = "none";
    btnInicializar.style.display = "none";
    btnReinicia.style.display = "none";
  }

  FechaMostraTodos() {
    this.fechaTodosBotoes();
    const btnInicializar = document.getElementById("MostrarTodos") as HTMLElement;
    btnInicializar.style.display = "none";
  }


  fechaInicializa() {
    const btn = document.getElementById("inicializar") as HTMLElement;
    btn.style.display = "none";
  }

  fechaMostra() {
    const btnInicializar = document.getElementById("MostrarEspecifico") as HTMLElement;
    btnInicializar.style.display = "none";
  }

  fechaReinicia() {
    const btn = document.getElementById("reinicia") as HTMLElement;
    btn.style.display = "none";
  }

  getCodigoInicializacao(): string {
    // O tamanho do vetor agora é dinâmico
    const tamanho = this.vetor.length;

    // Inclui o 'count = 0;' e o loop 'for' para preencher o vetor
    return `count = 0;\nfor(i = 0; i < ${tamanho}; i++) {\n    vetor[i] = 0;\n}`;
  }


  resetPagina() {
    this.vetorInicializado = false;
    this.vetor = [];
    this.caixas = [];
    this.count = 0;
    this.elementosModificados = [];
    this.vetorMemorias = [];
    this.lixosOriginais = [];
    this.operacaoAtual = 'insercao';
    this.indiceRemocao = 0;
    this.indiceEspecifico = 0;
    this.elementoEspecifico = '';

    this.fecharModal();
    this.fecharModalExplicacao();
    this.fecharModalExplicacao2();
    this.fecharModalExplicacao3();
    this.fecharModalExplicacao4();
    this.fecharModalEspecifico();
    this.fecharModalTodas();
    this.fecharSemVet();

    this.codigoVisivel = 'nenhum';

    this.cdr.detectChanges();
    this.updateCurrentStructure(); // Atualiza estado para salvar
    this.router.navigate(['/vetor']).then(() => {
    })
  }

  getVectorData() {
    const vetorValido = this.vetor.slice(0, this.count);
    
    return {
      vetor: vetorValido,
      tamanho: this.count, 
      tipo: this.tipo,
      nome: this.nome
    };
  }

  private updateStructureData() {
    const data = this.getVectorData();
    this.structureDataService.setStructureData(data);
  }
}




