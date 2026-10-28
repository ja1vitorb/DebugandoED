import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

class Node<T> {
  public value: T;
  public next: Node<T> | null = null;
  public memoria: string;

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
  selector: 'app-listainsere-ordenado',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './listainsere-ordenado.component.html',
  styleUrl: './listainsere-ordenado.component.scss'
})
export class ListainsereOrdenadoComponent {
  tituloPag = 'LINKED_LIST_ORDENATE.TITLE';

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
  listaInsere = './printListas/ListaEncadeada_inicio/listaInsereOrdenado.png';
  listaMostraEspecifico = './printListas/ListaEncadeada_inicio/listaMostraEspecifico.png';
  listaRemover = './printListas/ListaEncadeada_inicio/listaRemoveFim.png';
  listaCodigoInsereInicio = './printListas/ListaEncadeada_inicio/listaCodigoInsereOrdenado.png';
  listaCodigoRemoveInicio = './printListas/ListaEncadeada_inicio/listaCodigoRemoveOrdenado.png';

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

  ultimoNoInserido: any = null;

criaLista(valorInicialInput: HTMLInputElement) {
  const valor = valorInicialInput.value;
  if (valor === "") {
    alert("Insira um valor para iniciar a lista!");
    return;
  }

  // 1. Cria o nó
  this.head = new Node(valor);
  
  // 2. Define como último inserido ANTES de atualizar a memória
  this.ultimoNoInserido = this.head; 
  
  this.listaCriada = true;

  // 3. Agora a memória saberá que este nó deve receber o rótulo 'valor'
  this.atualizarListaVisual();
  this.atualizarMemoriaSimulada();
  
  valorInicialInput.value = '';

  this.gerarCodigo(`
noptr *info;
info = (struct no*) malloc(sizeof(noptr));
if (!info) {
    printf("ERRO, Sem Memoria!");
} else {
    info->conteudo = ${valor};
    info->next = NULL;
    head = info;
}`);
}

  readonly LIMITE_MAXIMO = 20;



  inserirOrdenado(valorInput: HTMLInputElement) {
    const valor = Number(valorInput.value);
    if (isNaN(valor) || !this.listaCriada) return;

    const novoNo = new Node(valor);
    // Guardamos a referência do nó que está sendo inserido agora
    this.ultimoNoInserido = novoNo;

    if (this.head === null || Number(this.head.value) >= valor) {
      novoNo.next = this.head;
      this.head = novoNo;
    } else {
      let atual = this.head;
      while (atual.next !== null && Number(atual.next.value) < valor) {
        atual = atual.next;
      }
      novoNo.next = atual.next;
      atual.next = novoNo;
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();
    valorInput.value = '';
  }

  inserirNoFim(valorInput: HTMLInputElement) {
    const valor = valorInput.value;
    if (valor === "" || !this.listaCriada) return;

    if (this.elementosParaExibir.length >= this.LIMITE_MAXIMO) {
      alert(`Limite de ${this.LIMITE_MAXIMO} elementos atingido.`);
      return;
    }

    const novoNo = new Node(valor);

    // Lógica de Inserção no Fim
    if (this.head === null) {
      this.head = novoNo;
    } else {
      let atual = this.head;
      while (atual.next !== null) {
        atual = atual.next;
      }
      atual.next = novoNo;
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();
    valorInput.value = '';

    this.gerarCodigo(`
noptr *info, *p;
info = (struct no*) malloc(sizeof(noptr));
info->conteudo = ${valor};
info->next = NULL;

if (head == NULL) {
    head = info;
} else {
    p = head;
    while (p->next != NULL) {
        p = p->next;
    }
    p->next = info;
}`);
  }

  inserirNoInicio(valorInput: HTMLInputElement) {

    const valor = valorInput.value;
    if (valor === "" || !this.listaCriada) return;

    if (this.elementosParaExibir.length >= this.LIMITE_MAXIMO) {
      alert(`Limite de ${this.LIMITE_MAXIMO} elementos atingido para esta simulação.`);
      return;
    }

    const novoNo = new Node(valor);
    novoNo.next = this.head;
    this.head = novoNo;
    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada()
    valorInput.value = '';

    this.gerarCodigo(`
noptr *info;
info = (struct no*) malloc(sizeof(noptr));

if (!info) {
    printf("ERRO, Sem Memoria!");
} else {
    valor = ${valor};
    // Simulando a lógica de inserção no início
    info->conteudo = valor;
    info->next = head;
    head = info;
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

  removeFim() {
    if (!this.head) {
      alert("A lista já está vazia!");
      return;
    }

    let valorRemovido;

    // Caso 1: Apenas um elemento
    if (this.head.next === null) {
      valorRemovido = this.head.value;
      this.head = null;
      this.listaCriada = false;
    } else {
      // Caso 2: Percorrer até o penúltimo
      let atual = this.head;
      while (atual.next!.next !== null) {
        atual = atual.next!;
      }
      valorRemovido = atual.next!.value;
      atual.next = null; // Remove a referência do último
    }

    this.atualizarListaVisual();
    this.atualizarMemoriaSimulada();

    this.gerarCodigo(`
if (head == NULL) {
    printf("Lista Vazia!");
} else if (head->next == NULL) {
    free(head);
    head = NULL;
} else {
    noptr *p = head;
    while (p->next->next != NULL) {
        p = p->next;
    }
    free(p->next);
    p->next = NULL;
    // Removido: ${valorRemovido}
}`);
  }

  // Atalho para manter compatibilidade com seu HTML anterior se necessário
  deletarNoFim() {
    this.removeFim();
  }


  deletarNoInicio() {
    this.removeInicio();
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
  linhaAbaixoInicio: any = { info: 'valor', endereco: '0x0009', conteudo: '12' }; // Exemplo fixo do seu print
  linhaFixaUltimoNo: any = null;

  atualizarMemoriaSimulada() {
    const todosOsBlocos: any[] = [];
    let atual = this.head;

    while (atual !== null) {
      // Verifica se o endereço bate com o que acabamos de inserir
      const ehOUltimoInserido = this.ultimoNoInserido && atual.memoria === this.ultimoNoInserido.memoria;

      const dadosNo = {
        info: ehOUltimoInserido ? 'valor' : '', // Marcamos 'valor' no Info
        endereco: atual.memoria,
        conteudo: atual.value,
        proximo: atual.next ? atual.next.memoria : 'NULL',
        isReal: true
      };

      todosOsBlocos.push(dadosNo);

      // Preenche a variável que o HTML usa para a segunda linha fixa
      if (ehOUltimoInserido) {
        this.linhaFixaUltimoNo = dadosNo;
      }

      atual = atual.next;
    }
    // Geração de lixo mantida conforme solicitado anteriormente
    for (let i = 0; i < 12; i++) {
      const addr = `0x${Math.floor(Math.random() * 0x8000 + 0x1000).toString(16).toUpperCase()}`;
      if (!todosOsBlocos.find(b => b.endereco === addr)) {
        todosOsBlocos.push({
          info: '...',
          endereco: addr,
          conteudo: (Math.random() + 1).toString(36).substring(8).toUpperCase(),
          proximo: (Math.random() + 1).toString(36).substring(8).toUpperCase(),
          isReal: false
        });
      }
    }

    this.memoriaSimuladaRestante = todosOsBlocos.sort((a, b) => a.endereco.localeCompare(b.endereco));
    this.inicioMemoria = this.head ? this.head.memoria : 'NULL';
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
