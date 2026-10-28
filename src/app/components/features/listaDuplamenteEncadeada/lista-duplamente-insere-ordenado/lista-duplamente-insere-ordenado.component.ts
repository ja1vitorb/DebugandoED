import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

class Node<T> {
  public value: T;
  public memoria: string;
  public next: Node<T> | null = null;
  public prev: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
    this.memoria = this.gerarEnderecoAleatorio();
  }

  private gerarEnderecoAleatorio(): string {
    // Aumentamos o range para 0x3000 (12288 posições) para espalhar mais
    const enderecoHex = Math.floor(Math.random() * 0x3000 + 0x1000).toString(16).toUpperCase();
    return `0x${enderecoHex}`;
  }
}

export class Linkedlist<T> {
  private head: Node<T> | null = null;
  private size: number = 0;


  public add(value: T): void {
    const newNode = new Node(value);

    if (this.head === null) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newNode;
    }

    this.size++;
  }

  public remove(value: T): boolean {
    if (this.head === null) return false;

    if (this.head.value === value) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this.size--
        return true;
      }
      current = current.next;
    }

    return false;
  }

  public getSize(): number {
    return this.size;
  }

  public toArray(): T[] {
    const result: T[] = []
    let current = this.head;

    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}


@Component({
  selector: 'app-lista-duplamente-insere-ordenado',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './lista-duplamente-insere-ordenado.component.html',
  styleUrl: './lista-duplamente-insere-ordenado.component.scss'
})
export class ListaDuplamenteInsereOrdenadoComponent {
  tituloPag = 'DOUBLY_LINKED_LIST_ORDENATE.TITLE';

  icon = 'interrogaSimbol.svg';
  reset = 'reset.svg';
  mostra = 'mostraIcon.svg';
  apaga = 'apaga.svg';
  insere = 'insere.svg';
  inicia = 'inicializaVet.svg';

  listaCriada: boolean = false;
  head: Node<any> | null = null;
  elementosParaExibir: any[] = [];
  enderecoInicio = '0x004';
  readonly ITENS_POR_LINHA = 3;
  valorBusca: any = '';
  posicaoEncontrada: number | string = -1;
  atual: Node<any> | null = null;
  p: Node<any> | null = null;

  listaCria = './printListas/ListaEncadeada_inicio/listaCria.png';
  listaCodigo = './printListas/ListaEncadeada_inicio/listaCodigo.png';
  listaMemoria = './printListas/ListaEncadeada_inicio/listaMemoria.png';
  listaExecucao = './printListas/ListaEncadeada_inicio/listaExecucao.png';
  listaReinicia = './printListas/ListaEncadeada_inicio/listaReinicia.png';
  listaMostraTodos = './printListas/ListaEncadeada_inicio/listaMostraTodos.png';
  listaInsere = './printListas/ListaEncadeada_inicio/listaDuplamenteInsereOrdenado.png';
  listaMostraEspecifico = './printListas/ListaEncadeada_inicio/listaDuplamentoMostraEspecifico.png';
  listaRemover = './printListas/ListaEncadeada_inicio/listaDuplamenteRemoveOrdenado.png';
  listaCodigoInsereInicio = './printListas/ListaEncadeada_inicio/listaDuplamenteCodigoInsereOrdenado.png';
  listaCodigoRemoveInicio = './printListas/ListaEncadeada_inicio/listaDuplamenteCodigoRemoveOrdenado.png';

  abaExplicacao: string = 'reiniciar';

  abrirModalExplicaLista() {
    const modal = document.getElementById("explicacao-modal-lista");
    if (modal) {
      modal.style.display = "flex";
      this.abaExplicacao = 'reiniciar';
    }
  }

  abrirAjuda(id: string) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  }

  abrirAjudaSecoesLista(idAba: string) {
    const modal = document.getElementById('modal-ajuda-secoes-lista');
    if (modal) {
      this.abaExplicacao = idAba;
      modal.style.display = "flex";
    }
  }

  fecharAjuda(id: string) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  }

  fecharModalExplicaLista() {
    const modal = document.getElementById("explicacao-modal-lista");
    if (modal) modal.style.display = "none";
  }



  abreModalMostraEspecifico(selectElement: HTMLSelectElement) {
    const indexAlvo = parseInt(selectElement.value);

    // Validação básica
    if (isNaN(indexAlvo) || !this.head) {
      alert("Selecione uma posição válida!");
      return;
    }

    // 1. Abrir o modal pelo DOM
    const modal = document.getElementById('modalMostraPosicao') as HTMLElement;
    if (modal) {
      modal.style.display = 'block';
    }

    // 2. Lógica de "Andar" na lista encadeada
    this.p = this.head; // p começa no início
    let contador = 0;

    // O loop faz o ponteiro 'p' pular de nó em nó até chegar no índice selecionado
    while (this.p !== null && contador < indexAlvo) {
      this.p = this.p.next;
      contador++;
    }

    this.posicaoEncontrada = indexAlvo;

    const codigoBusca = `valor = ${this.valorBusca};
int con = 0;
int aux = 0;
p = inicio;
while(p){
  if(p->dados == valor){
    aux = con;
  }
  p = p->prox;
  con++;
  }
  printf("%d", aux);`;

    this.gerarCodigoNoElemento('textCodInicio', codigoBusca);
  }

  fechaModalMostraEspecifico() {
    const modal = document.getElementById('modalMostraPosicao') as HTMLElement;
    modal.style.display = 'none';
  }


  abreModalMostraLista() {
    const modal = document.getElementById('modalMostraLista') as HTMLElement;
    modal.style.display = 'block';

    const codigoLoop = `p = inicio;
while ( p ){
  printf ( " %d ", p -> dados );
  p = p -> prox;
}`;

    this.gerarCodigoNoElemento('textCodTodasFila', codigoLoop);
  }

  gerarCodigoNoElemento(idElemento: string, instrucao: string) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
      elemento.innerText = instrucao;
    }
  }

  fechaModalMostraLista() {
    const modal = document.getElementById('modalMostraLista') as HTMLElement;
    modal.style.display = 'none';
  }



  criaLista(valorInicialInput: HTMLInputElement) {
    const valor = valorInicialInput.value;
    if (valor === "") {
      alert("Insira um valor para iniciar a lista!");
      return;
    }
    this.head = new Node(valor);
    this.listaCriada = true;

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada()
    valorInicialInput.value = '';

    this.gerarCodigo(`
typedef struct lista {
  int dados;
  struct lista * prox;
  struct lista * ant;
} noptr;

noptr *inicio;

// Alocação do primeiro nó
noptr *novo = (noptr*) malloc(sizeof(noptr));
novo->dados = ${valor};
novo->prox = NULL;
novo->ant = NULL;
inicio = novo;`
    );
  }

  readonly LIMITE_MAXIMO = 20;


  inserirOrdenado(valorInput: HTMLInputElement) {
    const valor = Number(valorInput.value);
    if (isNaN(valor) || !this.listaCriada) return;

    if (this.elementosParaExibir.length >= this.LIMITE_MAXIMO) {
      alert(`Limite de ${this.LIMITE_MAXIMO} elementos atingido.`);
      return;
    }

    const novoNo = new Node(valor);
    this.ultimoNoInserido = novoNo;

    // Caso 1: Lista vazia ou valor menor que o primeiro (Insere no Início)
    if (this.head === null || Number(this.head.value) >= valor) {
      novoNo.next = this.head;
      novoNo.prev = null;
      if (this.head !== null) {
        this.head.prev = novoNo;
      }
      this.head = novoNo;
    }
    else {
      // Caso 2: Percorrer para encontrar a posição correta
      let p = this.head;
      while (p.next !== null && Number(p.next.value) < valor) {
        p = p.next;
      }

      // Ajuste de ponteiros para inserir entre 'p' e 'p.next'
      novoNo.next = p.next;
      novoNo.prev = p;

      if (p.next !== null) {
        p.next.prev = novoNo;
      }
      p.next = novoNo;
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();
    valorInput.value = '';

    this.gerarCodigo(`
noptr *novo, *p;
novo = (noptr*) malloc(sizeof(noptr));
novo->dados = ${valor};

if (inicio == NULL || inicio->dados >= ${valor}) {
    novo->prox = inicio;
    novo->ant = NULL;
    if (inicio != NULL) inicio->ant = novo;
    inicio = novo;
} else {
    p = inicio;
    while (p->prox != NULL && p->prox->dados < ${valor}) {
        p = p->prox;
    }
    novo->prox = p->prox;
    novo->ant = p;
    if (p->prox != NULL) p->prox->ant = novo;
    p->prox = novo;
}`);
  }

  inserirNoInicio(valorInput: HTMLInputElement) {
    const valor = valorInput.value;
    if (valor === "" || !this.listaCriada) return;

    if (this.elementosParaExibir.length >= this.LIMITE_MAXIMO) {
      alert(`Limite de ${this.LIMITE_MAXIMO} elementos atingido.`);
      return;
    }

    const novoNo = new Node(valor);

    // Lógica Duplamente Encadeada:
    novoNo.next = this.head; // Novo aponta para o próximo
    if (this.head) {
      this.head.prev = novoNo; // Antigo head aponta de volta para o novo
    }
    this.head = novoNo; // Head agora é o novo nó

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();
    valorInput.value = '';

    this.gerarCodigo(`
int valor;
noptr *info;
info = ( struct no * ) malloc ( sizeof ( noptr ) );

if ( !info )
{
   printf ( "ERRO,Sem Memoria!" );

} else {
   valor = ${valor};
   
   // Lógica interna da insere_inicio para Duplamente Encadeada:
   info->dados = valor;
   info->prox = inicio;
   info->ant = NULL;

   if (inicio != NULL) {
       inicio->ant = info;
   }
   inicio = info;
}`);
  }



  removeInicio() {
    if (!this.head) {
      alert("A lista já está vazia!");
      this.gerarCodigo("// Lista vazia, nada para remover.");
      return;
    }

    const valorRemovido = this.head.value;

    this.head = this.head.next;

    if (this.head === null) {
      this.listaCriada = false;
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada()

    this.gerarCodigo(`
if (head == NULL) {
    printf("Lista Vazia!");
} else {
    noptr *aux;
    aux = head;          
    // aux guarda o endereço do nó a ser removido
    head = head->next;   
    // head avança para o próximo nó
    free(aux);           
    // libera a memória do nó antigo
    // Removido o valor: ${valorRemovido}
}`);
  }




  deletarNoInicio() {
    this.removeInicio();
  }

  removeFim() {
    if (!this.head) {
      alert("A lista já está vazia!");
      return;
    }

    let valorRemovido;

    if (this.head.next === null) {
      valorRemovido = this.head.value;
      this.head = null;
      this.listaCriada = false;
    } else {
      let p = this.head;
      // Percorre até o último nó
      while (p.next !== null) {
        p = p.next;
      }
      valorRemovido = p.value;
      // O nó anterior ao último passa a apontar para NULL
      if (p.prev) {
        p.prev.next = null;
      }
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();

    this.gerarCodigo(`
if (inicio == NULL) {
    printf("Lista Vazia!");
} else {
    noptr *p = inicio;
    while (p->prox != NULL) {
        p = p->prox;
    }
    if (p->ant == NULL) { // Só tem um elemento
        inicio = NULL;
    } else {
        p->ant->prox = NULL;
    }
    free(p);
    // Removido: ${valorRemovido}
}`);
  }

  deletarNoFim() {
    this.removeFim();
  }

  // Variáveis necessárias na classe
  memoriaSimulada: any[] = [];
  inicioMemoria: string = 'NULL';

  // Variáveis na classe ListaInsereInicioComponent
  primeiroNoMemoria: any = null;
  memoriaSimuladaRestante: any[] = [];

  // No seu componente ListaInsereInicioComponent
  // No seu componente ListaInsereInicioComponent
  // No seu componente ListaInsereInicioComponent
  linhaAbaixoInicio: any = { info: 'DOUBLY_LINKED_LIST.MODAL.VALUE', endereco: '0x0009', conteudo: '12' }; // Exemplo fixo do seu print
  linhaFixaPrimeiroNo: any = null;

  atualizarMemoriaSimulada() {
    const todosOsBlocos: any[] = [];
    let atual = this.head;
    let index = 0;

    let ultimoNoEncontrado: any = null;
    // 1. Mapeia os nós REAIS da lista
    while (atual !== null) {
      const dadosNo = {
        // O Info "valor" agora destaca o último elemento da lista
        info: atual.next === null ? 'DOUBLY_LINKED_LIST.MODAL.VALUE' : '',
        endereco: atual.memoria,
        conteudo: atual.value,
        proximo: atual.next ? atual.next.memoria : 'NULL',
        anterior: atual.prev ? atual.prev.memoria : 'NULL',
        isReal: true
      };

      todosOsBlocos.push(dadosNo);
      if (atual.next === null) {
        ultimoNoEncontrado = dadosNo;
      }
      atual = atual.next;
    }

    this.linhaFixaPrimeiroNo = ultimoNoEncontrado;

    // 2. Gera os LIXOS aleatórios (Sujando os três campos)
    for (let i = 0; i < 10; i++) {
      const addr = `0x${Math.floor(Math.random() * 0x8000 + 0x1000).toString(16).toUpperCase()}`;
      if (!todosOsBlocos.find(b => b.endereco === addr)) {
        todosOsBlocos.push({
          info: '   ',
          endereco: addr,
          conteudo: (Math.random() + 1).toString(36).substring(8).toUpperCase(),
          proximo: (Math.random() + 1).toString(36).substring(8).toUpperCase(),
          anterior: (Math.random() + 1).toString(36).substring(8).toUpperCase(),
          isReal: false
        });
      }
    }

    this.memoriaSimuladaRestante = todosOsBlocos.sort((a, b) => a.endereco.localeCompare(b.endereco));
    this.inicioMemoria = this.head ? this.head.memoria : 'NULL';
  }

  ultimoNoInserido: any = null;

  inserirNoFim(valorInput: HTMLInputElement) {
    const valor = valorInput.value;
    if (valor === "" || !this.listaCriada) return;

    if (this.elementosParaExibir.length >= this.LIMITE_MAXIMO) {
      alert(`Limite de ${this.LIMITE_MAXIMO} elementos atingido.`);
      return;
    }

    const novoNo = new Node(valor);
    this.ultimoNoInserido = novoNo;

    if (this.head === null) {
      this.head = novoNo;
    } else {
      let p = this.head;
      // Percorre até o último nó
      while (p.next !== null) {
        p = p.next;
      }
      // Faz a conexão dupla
      p.next = novoNo;
      novoNo.prev = p;
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();
    valorInput.value = '';

    this.gerarCodigo(`
int valor;
noptr *info, *p;
info = (struct no*) malloc(sizeof(noptr));

if (!info) {
    printf("ERRO, Sem Memoria!");
} else {
    valor = ${valor};
    info->dados = valor;
    info->prox = NULL;

    if (inicio == NULL) {
        info->ant = NULL;
        inicio = info;
    } else {
        p = inicio;
        while (p->prox != NULL) {
            p = p->prox;
        }
        p->prox = info;
        info->ant = p; // Conexão de volta
    }
}`);
  }


  removerPorValor(selectElement: HTMLSelectElement) {
    // Pegamos o valor numérico da opção selecionada
    const valorAlvo = Number(selectElement.value);

    if (selectElement.value === "" || isNaN(valorAlvo)) {
      alert("Selecione um valor válido!");
      return;
    }

    if (!this.head) return;

    let atual: Node<any> | null = this.head;
    let encontrado = false;

    // Percorre a lista
    while (atual !== null) {
      if (Number(atual.value) === valorAlvo) {
        encontrado = true;

        // CASO 1: Remover o primeiro (HEAD)
        if (atual === this.head) {
          this.head = atual.next;
          if (this.head) {
            this.head.prev = null;
          }
        }
        // CASO 2: Remover do meio ou do fim
        else {
          // O próximo do nó anterior passa a ser o próximo do nó atual
          if (atual.prev) {
            atual.prev.next = atual.next;
          }
          // O anterior do nó próximo passa a ser o anterior do nó atual
          if (atual.next) {
            atual.next.prev = atual.prev;
          }
        }

        // MUITO IMPORTANTE: Sair do loop após encontrar e remover
        break;
      }
      // Avança para o próximo nó
      atual = atual.next;
    }

    if (encontrado) {
      // Se a lista esvaziou, resetamos o estado
      if (this.head === null) {
        this.listaCriada = false;
      }

      this.atualizarListaVisual();
      this.atualizarMemoriaSimulada();
      selectElement.value = ""; // Reseta o campo select

      this.gerarCodigo(`
// Removendo nó com valor: ${valorAlvo}
noptr *p = inicio;
while(p != NULL && p->dados != ${valorAlvo}) {
    p = p->prox;
}
if(p != NULL) {
    if(p->ant == NULL) { // Era o primeiro nó
        inicio = p->prox;
        if(inicio) inicio->ant = NULL;
    } else {
        p->ant->prox = p->prox;
        if(p->prox) p->prox->ant = p->ant;
    }
    free(p);
}`);
    } else {
      alert("Valor não encontrado!");
    }
  }

  atualizarListaVisual() {
    this.elementosParaExibir = [];
    let atual = this.head;
    let index = 0;

    while (atual !== null) {
      this.elementosParaExibir.push({
        value: atual.value,
        memoria: atual.memoria,
        nextMemoria: atual.next ? atual.next.memoria : 'NULL',
        prevMemoria: atual.prev ? atual.prev.memoria : 'NULL', // Adicionado
        isLastInRow: (index + 1) % this.ITENS_POR_LINHA === 0
      });
      atual = atual.next;
      index++;
    }
  }

  gerarCodigo(instrucao: string) {
    const preCod = document.getElementById('textCod');
    if (preCod) {
      preCod.innerText = instrucao;
    }
  }



  reiniciaPagina() {
    window.location.reload();
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

}
