import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

class Fila {
  public conteudo: any;
  public endereco: string;
  public id: number;
  public lixoOriginal: any;
  private static proxId = 1;

  constructor(conteudo: any, endereco: string) {
    this.conteudo = conteudo;
    this.endereco = endereco;
    this.id = Fila.proxId++;
    this.lixoOriginal = conteudo;
  }

  gerarLixoMemoria(): string {
    const caracteres = '0123456789ABCDEF#!@$*&%+?';
    let resultado = '';

    for (let i = 0; i < 4; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      resultado += caracteres.charAt(indiceAleatorio);
    }

    return resultado;
  }
}

@Component({
  selector: 'app-fila-troca',
  imports: [CommonModule, TranslateModule],
  templateUrl: './fila-troca.component.html',
  styleUrl: './fila-troca.component.scss'
})
export class FilaTrocaComponent {

  tituloPag = 'QUEUE_SWAP.TITLE';
  icon = 'interrogaSimbol.svg';
  reset = 'reset.svg';
  mostra = 'mostraIcon.svg';
  apaga = 'apaga.svg';
  insere = 'insere.svg';
  inicia = 'inicializaVet.svg';


  fila: Fila[] = [];
  inicio: number = -1;
  fim: number = -1;
  filaCriada: boolean = false;
  conteudoInicio: string | number = '';
  indiceExibido: number = 0;
  abaExplicacao: string = 'reiniciar';

  filaReinicia = './PrintFilaBasica/filaReinicia.png';
  filaInsere = './PrintFilaBasica/filaInsere.png'
  filaMostraTodos = './PrintFilaBasica/filaMostraTodos.png';
  filaMostraEspecifico = './PrintFilaBasica/filaMostraEspecifico.png';
  filaRemover = './PrintFilaBasica/filaRemover.png';
  filaInsert = './PrintFilaBasica/filaInsert.png';
  filaRemove = './PrintFilaBasica/filaRemove.png';

  filaCria = './PrintFilaBasica/filaCria.png';

  filaCodigo = './PrintFilaBasica/filaCodigo.png';
  filaMemoria = './PrintFilaBasica/filaMemoria.png';
  filaExecucao = './PrintFilaBasica/filaExecucao.png';

  gerarCodigo(instrucao: string) {
    const preCod = document.getElementById('textCod');
    if (preCod) {
      preCod.innerText = instrucao;
    }
  }

  // Funções de controle
  abrirModalExplicaFila() {
    const modal = document.getElementById("explicacao-modal-fila");
    if (modal) {
      modal.style.display = "flex";
      this.abaExplicacao = 'reiniciar'; // Aba inicial padrão
    }
  }

  fecharModalExplicaFila() {
    const modal = document.getElementById("explicacao-modal-fila");
    if (modal) modal.style.display = "none";
  }
  // Abre modais simples (como o de erro)
  abrirAjuda(id: string) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  }

  // Abre a modal de seções (Código/Memória/Execução) definindo a aba ativa
  abrirAjudaSecoesFila(idAba: string) {
    const modal = document.getElementById('modal-ajuda-secoes-fila');
    if (modal) {
      this.abaExplicacao = idAba;
      modal.style.display = "flex";
    }
  }

  abrirInicioFilaComSelecao(indiceSelecionado: string) {
    // Se não houver seleção ou fila vazia, não faz nada
    if (indiceSelecionado === "" || this.inicio === this.fim) {
      alert("Selecione um item válido ou insira elementos na fila.");
      return;
    }

    const idx = Number(indiceSelecionado);

    // Atualiza o conteúdo que o modal vai mostrar baseado no índice escolhido
    if (this.fila[idx]) {
      this.conteudoInicio = this.fila[idx].conteudo;

      // Atualiza dinamicamente o índice no código printf do modal
      // Note que usamos uma variável para o índice no HTML do modal: f->fila[{{ indiceExibido }}]
      this.indiceExibido = idx;
    }

    const modal = document.getElementById("modalMostraInicio") as HTMLElement;
    if (modal) {
      modal.style.display = "flex";
    }
  }

  fecharAjuda(id: string) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  }

  abrirInicioFila() {
    if (this.fila && this.fila[this.inicio]) {
      this.conteudoInicio = this.fila[this.inicio].conteudo;
    }

    const modal = document.getElementById("modalMostraInicio") as HTMLElement;
    modal.style.display = "block";
  }

  fecharInicioFila() {
    const modal = document.getElementById("modalMostraInicio") as HTMLElement;
    modal.style.display = "none";
  }

  fecharModalCriaFila() {
    const modal = document.getElementById('modalFilaBasica') as HTMLElement;
    modal.style.display = 'none';
  }

  gerarLixoMemoria(): string {
    const caracteres = '0123456789ABCDEF#!@$*&%+?';
    let resultado = '';
    for (let i = 0; i < 4; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      resultado += caracteres.charAt(indiceAleatorio);
    }
    return resultado;
  }

  criarFila(tamanhoInput: HTMLInputElement) {
    let tamanho = Number(tamanhoInput.value);

    if (!tamanho || tamanho <= 0) return;
    if (tamanho > 30) tamanho = 30; // Limite de 30 posições

    this.fila = [];
    // Definimos como 0 para os ponteiros aparecerem na primeira caixa
    this.inicio = 0;
    this.fim = 0;

    const baseEndereco = 5000;

    for (let i = 0; i < tamanho; i++) {
      const endereco = `0x${(baseEndereco + i * 4).toString(16).toUpperCase()}`;
      const lixo = this.gerarLixoMemoria();
      this.fila.push(new Fila(lixo, endereco));
    }

    this.filaCriada = true;
    console.log("Fila criada. Ponteiros inicializados em 0.");

    this.fecharModalCriaFila();
    tamanhoInput.value = '';

    this.gerarCodigo(
      `struct fila
{
  int fila [ ${tamanho} ] ;
  int fim ;
  int inicio ;
};

int main( )
{
   struct fila * f ;
   f -> fim = 0;
   f -> inicio = 0;
}`
    );
  }

  // Função para Inserir (Enqueue)
  enfileirar(valorInput: HTMLInputElement) {
    const valor = valorInput.value;
    if (valor === "" || !this.fila.length) return;

    // Se o fim já ultrapassou o último índice, a fila está fisicamente cheia
    if (this.fim >= this.fila.length) {
      console.warn("Fila Cheia: Limite do buffer atingido.");
      return;
    }

    // Insere na posição atual do fim
    this.fila[this.fim].conteudo = valor;

    // Incrementa o fim. Se for a última posição, ele irá para fila.length
    this.fim++;

    valorInput.value = '';

    this.gerarCodigo(`insert ( f , ${valor} ) ;

// a função se encontra descrita
// no modal da interrogação.`);
  }

  desenfileirar(indiceSelecionado: string) {
    if (this.fim === 0) {
      alert("Fila Vazia!");
      return;
    }

    // Se não houver seleção, definimos um padrão (geralmente o início)
    const idx = indiceSelecionado === "inicio" ? 0 : Number(indiceSelecionado);

    // Validação de segurança
    if (idx < 0 || idx >= this.fim) {
      alert("Selecione um índice válido para remover.");
      return;
    }

    const valorRemovido = this.fila[idx].conteudo;

    // MANOBRA DE REAJUSTE: 
    // Começamos o shift a partir do índice que foi removido
    for (let i = idx; i < this.fim - 1; i++) {
      this.fila[i].conteudo = this.fila[i + 1].conteudo;
    }

    // Decrementamos o fim (o valor da última posição válida agora é lixo e ficará vermelho)
    this.fim--;

    this.gerarCodigo(
      `int i;
for (i = ${idx}; i < f->fim - 1; i++) {
    f->fila[i] = f->fila[i + 1];
}
f->fim--;`
    );
  }

  abrirModalCriaFila() {
    const modal = document.getElementById('modalFilaBasica') as HTMLElement;
    modal.style.display = 'block';
  }

  reiniciaPagina() {
    window.location.reload();
  }


  abrirModalTodas() {
    const modal = document.getElementById("modalMostraFila");
    if (modal) {
      modal.style.display = "flex";

      // Lógica do código C para percorrer a Fila
      let codigoLoop = "";

      if (this.inicio === this.fim) {
        codigoLoop = "";
      } else {
        codigoLoop = `int i;
for (i = f->inicio; i < f->fim; i++) {
    printf("%d ", f->fila[i]);
}`;
      }

      // Injeta o código no elemento específico do modal
      this.gerarCodigoNoElemento('textCodTodasFila', codigoLoop);
    }
  }

  // Função auxiliar (caso ainda não tenha no seu arquivo de Fila)
  gerarCodigoNoElemento(idElemento: string, instrucao: string) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
      elemento.innerText = instrucao;
    }
  }

  fecharModalTodas() {
    const modal = document.getElementById("modalMostraFila");
    if (modal) modal.style.display = "none";
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }


}
