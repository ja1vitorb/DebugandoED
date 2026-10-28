import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'; // ADICIONAR OnInit
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { EstadoBlocosService } from '../../../services/estado-blocos.service';
import { ModalDataService } from '../../../services/modal-data.service';
import { MatrizDataService } from '../../../services/matriz-data.service';

export interface tipoModal {
  nome: string;
  reinicia: string;
  inserir: string;
  mostraEspecifico: string;
  excluir: string;
  inicializa: string;
  mostraTodos: string;
  imgReinicia: string;
  imgInserir: string;
  imgMostraEspecifico: string;
  imgExcluir: string;
  imgIncializa: string;
  imgMostraTodos: string;
  semEstrutura: {
    titulo: string;
    descricao: string;
    titulo2: string;
    comoUtilizar: string;
  };
}

@Component({
  selector: 'app-modal',
  standalone: true, // ADICIONAR
  imports: [TranslateModule, CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;
  private subscription = new Subscription();

  // CORRIGIR TIPO PARA STRING
  indiceEspecifico: string = '';
  elementoEspecifico: string = '';

  // dados para mostrar todos
  mostrarTodosData: { tipo: 'matriz' | 'vetor'; conteudo: string[] | string[][] } | null = null;

  // Propriedade para controlar modo tela cheia
  isFullscreen: boolean = false;

  // getters to access typed content
  get conteudoMatriz(): string[][] {
    if (this.mostrarTodosData && this.mostrarTodosData.tipo === 'matriz') {
      return this.mostrarTodosData.conteudo as string[][];
    }
    return [];
  }

  // translated explanation texts used in help modals
  codeHelpText: string = '';
  memoryHelpText: string = '';
  executionHelpText: string = '';

  get conteudoVetor(): string[] {
    if (this.mostrarTodosData && this.mostrarTodosData.tipo === 'vetor') {
      return this.mostrarTodosData.conteudo as string[];
    }
    return [];
  }

  // verifica se há pelo menos um valor não vazio para exibir
  get hasNonEmptyContent(): boolean {
    if (!this.mostrarTodosData) return false;
    if (this.mostrarTodosData.tipo === 'matriz') {
      return this.conteudoMatriz.some(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));
    } else {
      return this.conteudoVetor.some(val => val !== '' && val !== null && val !== undefined);
    }
  }

  // gera o código exibido no modal "mostrar todos"
  gerarCodigoMostrarTodos(linguagem: 'c' | 'java' | 'python' | 'javascript' | 'pseudocodigo' = 'c'): string {
    if (!this.mostrarTodosData) return '';

    if (this.mostrarTodosData.tipo === 'matriz') {
      const dados = this.matrizDataService.obterDados();
      const linhas = dados.countLinha || 0;
      const colunas = dados.countColuna || 0;

      switch (linguagem) {
        case 'c':
          return `int i , j ;\n\nfor ( i = 0 ; i < ${linhas} ; i + + )\n{\n    for ( j = 0 ; j < ${colunas} ; j + + )\n    {\n      printf( "%d",matriz [ i ] [ j ] );\n    }\n}`;
        case 'java':
          return `for (int i = 0; i < ${linhas}; i++) {\n    for (int j = 0; j < ${colunas}; j++) {\n        System.out.print(matriz[i][j] + " ");\n    }\n}`;
        case 'javascript':
          return `for (let i = 0; i < ${linhas}; i++) {\n    for (let j = 0; j < ${colunas}; j++) {\n        console.log(matriz[i][j]);\n    }\n}`;
        // other languages can reuse C pattern or return generic
        default:
          return `int i , j ;\n\nfor ( i = 0 ; i < ${linhas} ; i + + )\n{\n    for ( j = 0 ; j < ${colunas} ; j + + )\n    {\n      printf( "%d",matriz [ i ] [ j ] );\n    }\n}`;
      }
    } else {
      const tamanho = (this.mostrarTodosData.conteudo as string[]).length;
      return `for (int i = 0; i < ${tamanho}; i++) {\n    printf("%d ", vetor[i]);\n}`;
    }
  }

  constructor(
    private translate: TranslateService,
    private estadoBlocosService: EstadoBlocosService,
    private modalDataService: ModalDataService,
    private matrizDataService: MatrizDataService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('[ModalComponent] Constructor chamado');
    this.langSub = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.selecionaTexto();
      this.setHelpTexts();
    });
  }

  public estrutura: tipoModal[] = [
    {
      nome: 'matriz',
      reinicia: 'MODAL.STRUCTURE.MATRIX.REINICIA',
      inserir: 'MODAL.STRUCTURE.MATRIX.INSERIR',
      mostraEspecifico: 'MODAL.STRUCTURE.MATRIX.MOSTRA_ESPECIFICO',
      excluir: 'MODAL.STRUCTURE.MATRIX.EXCLUIR',
      inicializa: 'MODAL.STRUCTURE.MATRIX.INICIALIZA',
      mostraTodos: 'MODAL.STRUCTURE.MATRIX.MOSTRA_TODOS',
      imgReinicia: './images/PrintMatriz/matrizReinicia.png',
      imgInserir: './images/PrintMatriz/matrizInserir.png',
      imgMostraEspecifico: './images/PrintMatriz/matrizMostraEspecifico.png',
      imgExcluir: './images/PrintMatriz/matrizExcluir.png',
      imgIncializa: './images/PrintMatriz/matrizInicializar.png',
      imgMostraTodos: './images/PrintMatriz/matrizMostratodos.png',
      semEstrutura: {
        titulo: 'MODAL.SEM_ESTRUTURA.MATRIZ.TITULO',
        descricao: 'MODAL.SEM_ESTRUTURA.MATRIZ.DESCRICAO',
        titulo2: 'MODAL.SEM_ESTRUTURA.MATRIZ.TITULO2',
        comoUtilizar: 'MODAL.SEM_ESTRUTURA.MATRIZ.PASSOS'
      }
    },
    {
      nome: 'vetor',
      reinicia: 'MODAL.STRUCTURE.VECTOR.REINICIA',
      inserir: 'MODAL.STRUCTURE.VECTOR.INSERIR',
      mostraEspecifico: 'MODAL.STRUCTURE.VECTOR.MOSTRA_ESPECIFICO',
      excluir: 'MODAL.STRUCTURE.VECTOR.EXCLUIR',
      inicializa: 'MODAL.STRUCTURE.VECTOR.INICIALIZA',
      mostraTodos: 'MODAL.STRUCTURE.VECTOR.MOSTRA_TODOS',
      imgReinicia: './images/imgExplicacao/printReiniciaBtn.png',
      imgInserir: './images/PrintMatriz/matrizInserir.png',
      imgMostraEspecifico: './images/imgExplicacao/MostraEspecifico.png',
      imgExcluir: './images/imgExplicacao/Excluir.png',
      imgIncializa: './images/imgExplicacao/imgInicializarExplicacao.png',
      imgMostraTodos: './images/imgExplicacao/MostraTodos.png',
      semEstrutura: {
        titulo: 'MODAL.SEM_ESTRUTURA.MATRIZ.TITULO',
        descricao: 'MODAL.SEM_ESTRUTURA.MATRIZ.DESCRICAO',
        titulo2: 'COMO UTILIZAR O SIMULADOR DE VETOR?',
        comoUtilizar: ''
      }
    }
  ];

  tituloPag = ''

  ngOnInit(): void {
    console.log('[ModalComponent] ngOnInit chamado');
    this.selecionaTexto();
    this.encontraTitulo();
    this.setHelpTexts();

    // Inscreve para receber dados do modal de mostrar específico
    this.subscription.add(
      this.modalDataService.mostrarEspecificoData$.subscribe(data => {
        console.log('🔔 [ModalComponent] Subscription RECEBEU dados:', data);
        if (data) {
          this.indiceEspecifico = data.indice;
          this.elementoEspecifico = data.elemento;
          console.log('📝 [ModalComponent] Dados atribuídos:', {
            indice: this.indiceEspecifico,
            elemento: this.elementoEspecifico
          });
          this.abrirModalEspecifico();
        }
      })
    );

    // nova inscrição para mostrar todos
    this.subscription.add(
      this.modalDataService.mostrarTodosData$.subscribe(payload => {
        console.log('🔔 [ModalComponent] Subscription RECEBEU dados mostrarTodos:', payload);
        if (payload) {
          this.mostrarTodosData = payload;
          this.abrirModalTodos();
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.langSub) this.langSub.unsubscribe();
    this.subscription.unsubscribe();
  }

  /**
   * Read translated strings for the help modals into properties.
   * Using instants ensures the text is available even if the
   * translate pipe doesn't run once the modal is displayed.
   */
  private setHelpTexts(): void {
    // use get() so we receive the value after the translation file loads
    this.translate.get([
      'DESCRIPTION_TEXT.CODES',
      'DESCRIPTION_TEXT.MEMORY',
      'DESCRIPTION_TEXT.EXECUTION',
      'VECTOR.DESCRIPTION_TEXT.CODES',
      'VECTOR.DESCRIPTION_TEXT.MEMORY',
      'VECTOR.DESCRIPTION_TEXT.EXECUTION'
    ]).subscribe(trans => {
      this.codeHelpText = trans['DESCRIPTION_TEXT.CODES'];
      this.memoryHelpText = trans['DESCRIPTION_TEXT.MEMORY'];
      this.executionHelpText = trans['DESCRIPTION_TEXT.EXECUTION'];
      this.codeHelpText = trans['VECTOR.DESCRIPTION_TEXT.CODES'];
      this.memoryHelpText = trans['VECTOR.DESCRIPTION_TEXT.MEMORY'];
      this.executionHelpText = trans['VECTOR.DESCRIPTION_TEXT.EXECUTION'];
      this.cdr.detectChanges();
    });
  }

  encontraTitulo() {
    const caminhoCompleto: string = window.location.pathname
    const partesCaminho: string[] = caminhoCompleto.split('/')
    const nomePagina: string = partesCaminho[partesCaminho.length - 1]
    this.tituloPag = nomePagina;
  }

  encontraPagina() {
    const caminhoCompleto: string = window.location.pathname
    const partesCaminho: string[] = caminhoCompleto.split('/')
    const nomePagina: string = partesCaminho[partesCaminho.length - 1]
    const pagina = this.estrutura.find(item => item.nome.toLowerCase() === nomePagina.toLowerCase());
    return pagina;
  }

  selecionaTexto() {
    const textoPagina = this.encontraPagina();
    if (!textoPagina) return;

    const reiniciaP = document.getElementById('reiniciaP') as HTMLElement
    const inicializaP = document.getElementById('inicializaP') as HTMLElement
    const mostraTodosP = document.getElementById('mostraTodosP') as HTMLElement
    const mostraEspecificoP = document.getElementById('mostraEspecificoP') as HTMLElement
    const excluiP = document.getElementById('excluiP') as HTMLElement
    const insereP = document.getElementById('insereP') as HTMLElement

    const imgReinicia = document.getElementById('imgReinicia') as HTMLImageElement
    const imgInserir = document.getElementById('imgInserir') as HTMLImageElement
    const imgMostraTodos = document.getElementById('imgMostraTodos') as HTMLImageElement
    const imgMostraEspecifico = document.getElementById('imgMostraEspecifico') as HTMLImageElement
    const imgExcluir = document.getElementById('imgExclui') as HTMLImageElement
    const imgIncializa = document.getElementById('imgInicializa') as HTMLImageElement
    const tituloSemEstrutura = document.getElementById('tituloSemEstrutura') as HTMLElement
    const descricaoSemEstrutura = document.getElementById('semEstruturaDesc') as HTMLElement
    const tituloSemEstrutura2 = document.getElementById('tituloEstrutura2') as HTMLElement
    const comoUtilizar = document.getElementById('comoUtiliza') as HTMLElement
    const criaMatriz = document.getElementById('criaMatriz') as HTMLElement
    const imgCriaMatriz = document.getElementById('imgCriaMatriz') as HTMLImageElement
    const tituloPag = document.getElementById("tituloM") as HTMLElement
    const tituloPag2 = document.getElementById("tituloM2") as HTMLElement

    if (reiniciaP) reiniciaP.innerText = this.translate.instant(textoPagina.reinicia);
    if (inicializaP) inicializaP.innerText = this.translate.instant(textoPagina.inicializa);
    if (mostraTodosP) mostraTodosP.innerText = this.translate.instant(textoPagina.mostraTodos);
    if (mostraEspecificoP) mostraEspecificoP.innerText = this.translate.instant(textoPagina.mostraEspecifico);
    if (excluiP) excluiP.innerText = this.translate.instant(textoPagina.excluir);
    if (insereP) insereP.innerText = this.translate.instant(textoPagina.inserir);
    if (tituloSemEstrutura) tituloSemEstrutura.innerText = this.translate.instant(textoPagina.semEstrutura.titulo)
    if (descricaoSemEstrutura) descricaoSemEstrutura.innerText = this.translate.instant(textoPagina.semEstrutura.descricao)
    if (tituloSemEstrutura2) tituloSemEstrutura2.innerText = this.translate.instant(textoPagina.semEstrutura.titulo2)
    if (comoUtilizar) comoUtilizar.innerText = this.translate.instant(textoPagina.semEstrutura.comoUtilizar)

    // quando não há estrutura, mostramos também os passos/criação
    if (criaMatriz) {
      // use a chave "PASSOS" que já existe nas traduções do semEstrutura
      const passoKey = textoPagina.semEstrutura.hasOwnProperty('passos')
        ? (`MODAL.SEM_ESTRUTURA.${textoPagina.nome.toUpperCase()}.PASSOS`)
        : '';
      if (passoKey) {
        criaMatriz.innerText = this.translate.instant(passoKey);
      }
    }

    if (tituloPag) tituloPag.innerText = this.translate.instant(textoPagina.nome)
    if (tituloPag2) tituloPag2.innerText = this.translate.instant(textoPagina.nome)

    if (imgReinicia) imgReinicia.src = textoPagina.imgReinicia;
    if (imgInserir) imgInserir.src = textoPagina.imgInserir;
    if (imgMostraTodos) imgMostraTodos.src = textoPagina.imgMostraTodos;
    if (imgMostraEspecifico) imgMostraEspecifico.src = textoPagina.imgMostraEspecifico;
    if (imgExcluir) imgExcluir.src = textoPagina.imgExcluir;
    if (imgIncializa) imgIncializa.src = textoPagina.imgIncializa;
    // para modal de sem estrutura mostra imagem de criação apenas em matriz
    if (imgCriaMatriz) {
      if (textoPagina.nome.toLowerCase() === 'matriz') {
        imgCriaMatriz.src = './images/PrintMatriz/criaMatriz.png';
      } else {
        // limpar caso não seja matriz
        imgCriaMatriz.src = '';
      }
    }
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

  fecharModal() {
    this.fechaTodos();
    let modal = document.getElementById("Modal") as HTMLElement;
    if (modal) modal.style.display = "none"
    let modalSemEstrutura = document.getElementById("SemVetor") as HTMLElement;
    if (modalSemEstrutura) modalSemEstrutura.style.display = "none"
    let modalCriaEstrutura = document.getElementById("modal") as HTMLElement;
    if (modalCriaEstrutura) modalCriaEstrutura.style.display = "none"
    // NÃO fecha o modalMostraEspecifico aqui
  }

  btnModal(btnNome: string) {
    this.fechaTodos();
    let modal = document.getElementById(btnNome) as HTMLElement;
    if (modal) modal.style.display = "block";
    // note: não enviamos dados aqui; métodos externos (ex. BlocosTopoComponent) devem disparar
    // o serviço quando necessário. Isso evita que a explicação abra também o modal de resultado.
  }

  fechaTodos() {
    const tags: string[] = [
      'reinicia',
      'inicializar',
      'MostrarTodos',
      'MostrarEspecifico',
      'Excluir',
      'Inserir',
    ];

    for (const tag of tags) {
      let btn = document.getElementById(tag) as HTMLElement;
      if (btn) btn.style.display = "none"
    }
  }

  alterarVisibilidade(): void {
    const linhasInput = document.getElementById('tamanhoVetor') as HTMLInputElement | null;
    const colunasInput = document.getElementById('colunasMatriz') as HTMLInputElement | null;

    const linhas = linhasInput && linhasInput.value ? parseInt(linhasInput.value, 10) : 0;
    const colunas = colunasInput && colunasInput.value ? parseInt(colunasInput.value, 10) : 0;

    if (linhas > 0 && colunas > 0) {
      this.modalDataService.sendDimensions(linhas, colunas);
    } else {
      console.warn('Dimensões inválidas; valores não enviados.');
    }

    console.log('Outro-componente está alterando o estado.');
    this.fecharModal();
    this.estadoBlocosService.toggleEstado();
  }

  // Abre o modal de mostrar específico
  abrirModalEspecifico() {
    console.log('🚀 [ModalComponent] abrirModalEspecifico chamado');

    // Fecha outros modais primeiro
    this.fecharModal();

    const modal = document.getElementById('modalMostraEspecifico');
    console.log('🔍 [ModalComponent] Elemento modal encontrado:', modal);

    if (modal) {
      modal.style.display = 'block'; // Use 'block' ao invés de 'flex'
      console.log('✅ [ModalComponent] Modal aberto com:', {
        indice: this.indiceEspecifico,
        elemento: this.elementoEspecifico
      });
    } else {
      console.error('❌ [ModalComponent] Modal #modalMostraEspecifico NÃO ENCONTRADO!');
    }
  }

  // Abre o modal de mostrar todos
  abrirModalTodos() {
    console.log('🚀 [ModalComponent] abrirModalTodos chamado');
    console.log('🔎 mostrarTodosData no abrirModalTodos:', this.mostrarTodosData);
    this.fecharModal();

    const modal = document.getElementById('modalMostraTodos');
    if (modal) {
      modal.style.display = 'block';
      console.log('✅ [ModalComponent] Modal "mostrar todos" aberto:', this.mostrarTodosData);
      // ensure Angular updates view after modifying data
      this.cdr.detectChanges();
    } else {
      console.error('❌ [ModalComponent] Modal #modalMostraTodos NÃO ENCONTRADO!');
    }
  }

  // Fecha o modal de mostrar específico
  fecharModalEspecifico() {
    console.log('🔒 [ModalComponent] fecharModalEspecifico chamado');
    const modal = document.getElementById('modalMostraEspecifico');
    if (modal) {
      modal.style.display = 'none';
      console.log('✅ Modal fechado');
    }
    // limpa dados armazenados
    this.indiceEspecifico = '';
    this.elementoEspecifico = '';
  }

  // Fecha o modal de mostrar todos
  fecharModalTodos() {
    console.log('🔒 [ModalComponent] fecharModalTodos chamado');
    const modal = document.getElementById('modalMostraTodos');
    if (modal) {
      modal.style.display = 'none';
      console.log('✅ Modal "mostrar todos" fechado');
    }
    this.mostrarTodosData = null;
  }

  // explanation modals --------------------------------------------------
  abrirModalCodigo() {
    // ensure other modals are hidden before showing the help dialog
    this.fecharModal();
    this.fecharModalEspecifico();
    this.fecharModalTodos();

    const modal = document.getElementById('modalCodigo');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  fecharModalCodigo() {
    const modal = document.getElementById('modalCodigo');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  abrirModalMemoria() {
    this.fecharModal();
    this.fecharModalEspecifico();
    this.fecharModalTodos();

    const modal = document.getElementById('modalMemoria');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  fecharModalMemoria() {
    const modal = document.getElementById('modalMemoria');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  abrirModalExecucao() {
    this.fecharModal();
    this.fecharModalEspecifico();
    this.fecharModalTodos();

    const modal = document.getElementById('modalExecucao');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  fecharModalExecucao() {
    const modal = document.getElementById('modalExecucao');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Alterna entre modo normal e tela cheia
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }
}
