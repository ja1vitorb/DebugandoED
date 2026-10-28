import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CurrentStructureService } from '../../../services/current-structure.service';
import { StructureLoaderService } from '../../../services/structure-loader.service';

class Pilha {
  public conteudo: number;
  public lixoMemoria: string;
  public id: number;
  private static proxId = 1;
  public endereco: string; // Alterado para string para exibir 0x...

  constructor(conteudo: number, lixoMemoria: string, endereco: string) {
    this.conteudo = conteudo;
    this.lixoMemoria = lixoMemoria;
    this.id = Pilha.proxId++;
    this.endereco = endereco;
  }
}

@Component({
  selector: 'app-pilha',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './pilha.component.html',
  styleUrl: './pilha.component.scss'
})
export class PilhaComponent implements OnInit, OnDestroy {
  tituloPag = 'STACK.TITLE';
  icon = 'interrogaSimbol.svg';
  reset = 'reset.svg';
  mostra = 'mostraIcon.svg';
  apaga = 'apaga.svg';
  insere = 'insere.svg';
  inicia = 'inicializaVet.svg';

  reiniciaPilha = './PrintPilha/pilhaReinicia.png';
  mostraTodos = './PrintPilha/pilhaMostraTodos.png';
  inserePilha = './PrintPilha/pilhaInsere.png';
  mostraEspecificoPilha = './PrintPilha/pilhaMostraEspecifico.png';
  removePilha = './PrintPilha/pilhaRemove.png';
  pushPilha = './PrintPilha/pilhaPush.png';
  popPilha = './PrintPilha/pilhaPop.png';
  criaPilha = './PrintPilha/pilhaCria.png';
  codigoPilha = './PrintPilha/pilhaCodigo.png';
  memoriaPilha = './PrintPilha/pilhaMemoria.png';
  execucaoPilha = './PrintPilha/pilhaExecucao.png';

  topoA: number = -1;
  topoB: number = -1;

  pilhaInicializada: boolean = false;



  // Arrays para armazenar as duas pilhas
  pilhaA: Pilha[] = [];
  pilhaB: Pilha[] = [];

  conteudoTopo: string | number = '';

  constructor(
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

  /**
   * Carrega pilha salva se houver uma pendente
   */

  // Adicione no topo da classe
  abaExplicacao: string = 'criar';


  // Abre a ajuda específica do Painel (Reiniciar, Inserir, Push, Pop)
  abrirModalPilha() {
    const modal = document.getElementById("explicacao-modal-pilha");
    if (modal) {
      this.abaExplicacao = 'reiniciar'; // Define aba padrão
      modal.style.display = "flex";
    }
  }

  // Abre a ajuda das seções técnicas (Código, Memória, Execução)
  abrirAjudaSecoes(idAba: string) {
    const modal = document.getElementById("modal-ajuda-secoes");
    if (modal) {
      this.abaExplicacao = idAba;
      modal.style.display = "flex";
    }
  }

  // Abre a modal de aviso (Pilha não inicializada)
  abrirAjuda(idModal: string) {
    const modal = document.getElementById(idModal);
    if (modal) {
      modal.style.display = "flex";
    }
  }

  // Função para fechar qualquer modal pelo ID (usada nos botões OK/Fechar)
  fecharAjuda(idModal: string) {
    const modal = document.getElementById(idModal);
    if (modal) {
      modal.style.display = "none";
    }
  }
  fecharModalPilha() {
    const modal = document.getElementById("explicacao-modal-pilha");
    if (modal) modal.style.display = "none";
  }
  private loadPendingStructure(): void {
    const pendingData = this.structureLoaderService.getPendingLoad();

    if (pendingData && pendingData.structureType === 'PILHA') {
      this.pilhaInicializada = true;

      // Restaura metadados
      if (pendingData.metadata) {
        this.topoA = pendingData.metadata.topoA || -1;
        this.topoB = pendingData.metadata.topoB || -1;
      }

      // Restaura pilhas
      this.pilhaA = [];
      this.pilhaB = [];

      if (pendingData.elements) {
        pendingData.elements.forEach((element: any) => {
          const pilha = new Pilha(
            element.conteudo,
            element.lixoMemoria,
            element.endereco
          );

          if (element.tipo === 'A') {
            this.pilhaA.push(pilha);
          } else if (element.tipo === 'B') {
            this.pilhaB.push(pilha);
          }
        });
      }

      this.updateCurrentStructure();
      alert('Pilha carregada com sucesso!');
    }
  }

  /**
   * Atualiza o estado da estrutura atual para salvamento
   */
  private updateCurrentStructure(): void {
    const elements = [
      ...this.pilhaA.map(p => ({ ...p, tipo: 'A' })),
      ...this.pilhaB.map(p => ({ ...p, tipo: 'B' }))
    ];

    this.currentStructureService.setCurrentStructure({
      type: 'PILHA',
      name: `Pilha [A:${this.topoA + 1}, B:${this.topoB + 1}]`,
      data: {
        structureType: 'PILHA',
        size: elements.length,
        elements: elements,
        metadata: {
          topoA: this.topoA,
          topoB: this.topoB
        }
      },
      canSave: this.pilhaInicializada && elements.length > 0
    });
  }

  abrirTopoPilha() {
    const modal = document.getElementById("modalMostraTopo") as HTMLElement;
    modal.style.display = "block";

    // Se o topo for -1, a pilha está logicamente vazia (só tem lixo)
    if (this.topoA === -1) {
      this.conteudoTopo = "Pilha Vazia";
    } else {
      // Captura o valor real que está no índice do topo
      this.conteudoTopo = this.pilhaA[this.topoA].conteudo;
    }

    if (modal) modal.style.display = "flex";
  }

  gerarCodigoNoElemento(idElemento: string, instrucao: string) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
      elemento.innerText = instrucao;
    }
  }

  abrirModalTodas() {
    const modal = document.getElementById("modalMostraPilha");
    if (modal) {
      modal.style.display = "block";

      // Gera o código do loop em C
      const codigoLoop = `int i;\nfor (int i = p->topo; i >= 0; i--) {\n    printf("%d ", p->pilha[i]);\n}`;

      // Injeta no parágrafo do modal
      this.gerarCodigoNoElemento('textCodTodas', codigoLoop);
    }
  }

  fecharModalTodas() {
    const modal = document.getElementById("modalMostraPilha");
    if (modal) modal.style.display = "none";
  }

  gerarCodigoLoopPilha(): string {
    const tamanho = this.topoA + 1;
    if (this.topoA === -1) return "// Pilha vazia";

    // Retorna o código C para percorrer a pilha do topo para a base
    return `for (int i = p->topo; i >= 0; i--) {\n    printf("%d ", p->pilha[i]);\n}`;
  }

  fecharTopoPilha() {
    const modal = document.getElementById("modalMostraTopo") as HTMLElement;
    modal.style.display = "none";
  }

  // Função para criar as pilhas com o mesmo tamanho
  // Dentro da sua classe PilhaComponent
  criarPilhas(inputElement: HTMLInputElement | string | number) {

    const valor = (inputElement instanceof HTMLInputElement) ? inputElement.value : inputElement;
    const numTamanho = Number(valor);

    if (!numTamanho || numTamanho <= 0) return;

    this.pilhaA = [];
    this.pilhaB = [];
    this.topoA = -1; // Topo inicia em -1, invalidando as posições (lixo)
    this.topoB = -1;
    const baseEndereco = 4000;

    for (let i = 0; i < numTamanho; i++) {
      const endA = `0x${(baseEndereco + i * 4).toString(16).toUpperCase()}`;
      const endB = `0x${(baseEndereco + 500 + i * 4).toString(16).toUpperCase()}`;

      // Chamamos sua função geraLixoMemoria() para preencher o conteúdo inicial
      const lixoInicialA = this.geraLixoMemoria();
      const lixoInicialB = this.geraLixoMemoria();

      this.pilhaA.push(new Pilha(lixoInicialA as any, lixoInicialA, endA));
      this.pilhaB.push(new Pilha(lixoInicialB as any, lixoInicialB, endB));
    }

    this.pilhaInicializada = true;

    this.fecharModal();

    this.updateCurrentStructure(); // Atualiza estado para salvar

    if (inputElement instanceof HTMLInputElement) {
      inputElement.value = "";
    }

    this.gerarCodigo(
      `const int tamanhoPilha ${numTamanho};

struct stack
{
  int pilha [ tamanhoPilha ] ;
  int topo ;
};

int main( )
{
  struct stack * p ;
  struct stack * p1 ;
  p -> topo = -1;
  p1 -> topo = -1;
}`
    );
  }

  geraLixoMemoria(): string {
    const chars = "ABCDEF0123456789";
    let res = "";
    for (let i = 0; i < 4; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  }

  iniciaPilha() {
    // Exemplo: iniciando com tamanho 5
    this.criarPilhas(5);
  }

  abrirModal() {
    const modal = document.getElementById("modalPilha") as HTMLElement;
    if (modal) modal.style.display = "flex"; // Flex ajuda na centralização
  }

  fecharModal() {
    const modal = document.getElementById("modalPilha") as HTMLElement;
    if (modal) modal.style.display = "none";
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

  empilhar(inputElement: HTMLInputElement) {
    const valor = inputElement.value;
    const numValor = Number(valor);

    if (isNaN(numValor) || valor === '') {
      alert("Insira um valor válido!");
      return;
    }
    if (this.topoA >= this.pilhaA.length - 1) {
      alert("Stack Overflow!");
      return;
    }
    this.topoA++;
    this.pilhaA[this.topoA].conteudo = numValor;
    this.gerarCodigo(`push(&p, ${numValor});`);

    inputElement.value = '';
    inputElement.focus(); // Mantém o foco para a próxima inserção

    this.updateCurrentStructure(); // Atualiza estado para salvar

  }

  // Função auxiliar para atualizar o texto do código
  gerarCodigo(instrucao: string) {
    const preCod = document.getElementById('textCod');
    if (preCod) {
      preCod.innerText = instrucao;
    }
  }

  desempilhar(escolha: string) {
    if (!escolha) {
      alert("Selecione qual pilha deseja desempilhar (Pop)!");
      return;
    }

    if (escolha === 'p') {
      if (this.topoA < 0) {
        alert("Stack Underflow! A pilha p já está vazia.");
        return;
      }
      // Remove o conteúdo (volta a ser lixo visualmente)
      this.pilhaA[this.topoA].conteudo = 0;
      this.topoA--;
      this.gerarCodigo(`pop(&p);`);
    }
    else if (escolha === 'p1') {
      if (this.topoB < 0) {
        alert("Stack Underflow! A pilha p1 já está vazia.");
        return;
      }
      this.pilhaB[this.topoB].conteudo = 0;
      this.topoB--;
      this.gerarCodigo(`pop(&p1);`);
    }

    this.updateCurrentStructure(); // Atualiza estado para salvar
    console.log(`Elemento removido. Novos topos -> p: ${this.topoA}, p1: ${this.topoB}`);
  }


  get elementosNaPilha() {
    // Filtramos pelo índice i comparado ao topoA atual
    return this.pilhaA
      .filter((item, index) => index <= this.topoA)
      .reverse(); // Mantém a ordem do topo primeiro para facilitar a remoção
  }

  async removerEspecifico(idItem: string) {
    const id = Number(idItem);
    if (!id) return;

    const indexAlvo = this.pilhaA.findIndex(p => p.id === id);
    if (indexAlvo === -1) return;

    this.gerarCodigo(`// Manobra de deslocamento: mantendo rastro na memória...`);

    // 1. SUBIDA (Cópia para p1):
    // Movemos os itens para a auxiliar. Em p, eles ficam vermelhos conforme o topo desce.
    while (this.topoA > indexAlvo) {
      this.topoB++;
      // Copia o valor para p1
      this.pilhaB[this.topoB].conteudo = this.pilhaA[this.topoA].conteudo;

      // O valor permanece na célula de p, mas o topo desce (fica vermelho no HTML)
      this.topoA--;
    }

    this.gerarCodigo(
      `int x = -1, aux = 0;

while (valorRemover != x)
{
   x = pop(p);
   push(p1, x);  
}

while (aux != -1)
{
   x = pop(p1);
   aux = push(p, x);  
}`
    );

    // 2. REMOÇÃO DO ALVO:
    // O alvo é "pulado". O topo desce mais uma vez.
    this.topoA--;

    // 3. DESCIDA E REORGANIZAÇÃO (p1 -> p):
    // Os valores voltam da auxiliar e sobrescrevem as posições em p.
    let ponteiroLeituraB = this.topoB;

    while (ponteiroLeituraB >= 0) {
      this.topoA++;
      // O valor da auxiliar preenche a nova posição em p (deslocamento)
      this.pilhaA[this.topoA].conteudo = this.pilhaB[ponteiroLeituraB].conteudo;

      // Mantemos o valor na p1 como cópia/lixo, mas invalidamos o topoB
      ponteiroLeituraB--;
      this.topoB--;

    }
  }

  reiniciarExecucao() {
    // 1. Limpa os dados das pilhas
    this.pilhaA = [];
    this.pilhaB = [];

    // 2. Reseta os índices dos topos
    this.topoA = -1;
    this.topoB = -1;

    // 3. Volta ao estado de "não inicializado"
    // Isso fará com que o botão "Criar" reapareça e as áreas de memória sumam
    this.pilhaInicializada = false;

    // 4. Limpa o painel de código
    this.gerarCodigo("");

    console.log("Sistema resetado para o estado inicial.");

    window.location.reload();
  }
}