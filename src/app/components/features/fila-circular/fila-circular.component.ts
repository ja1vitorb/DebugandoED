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
  selector: 'app-fila-circular',
  imports: [CommonModule, TranslateModule],
  templateUrl: './fila-circular.component.html',
  styleUrl: './fila-circular.component.scss'
})
export class FilaCircularComponent {

  tituloPag = 'CIRCLE_QUEUE.TITLE';
  icon = 'interrogaSimbol.svg';
  reset = 'reset.svg';
  mostra = 'mostraIcon.svg';
  apaga = 'apaga.svg';
  insere = 'insere.svg';
  inicia = 'inicializaVet.svg';

  filaReinicia = './PrintFilaBasica/filaReinicia.png';
  filaInsere = './PrintFilaBasica/filaCircularInsere.png'
  filaMostraTodos = './PrintFilaBasica/filaMostraTodos.png';
  filaMostraEspecifico = './PrintFilaBasica/filaCircularMostrarEspecifico.png';
  filaRemover = './PrintFilaBasica/filaCircularRemover.png';
  filaInsert = './PrintFilaBasica/filaInsert.png';
  filaRemove = './PrintFilaBasica/filaRemove.png';

  filaCria = './PrintFilaBasica/filaCria.png';

  filaCodigo = './PrintFilaBasica/filaCodigo.png';
  filaMemoria = './PrintFilaBasica/filaMemoria.png';
  filaExecucao = './PrintFilaBasica/filaCircularExecucao.png'




  fila: Fila[] = [];
  inicio: number = -1;
  fim: number = -1;
  filaCriada: boolean = false;
  abaExplicacao: string = 'reiniciar';
  conteudoInicio: string | number = '';


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

  abrirAjudaSecoesFila(idAba: string) {
    const modal = document.getElementById('modal-ajuda-secoes-fila');
    if (modal) {
      this.abaExplicacao = idAba;
      modal.style.display = "flex";
    }
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
    if (tamanho > 10) tamanho = 10; // Limite de 10 posições

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

    this.atualizarGrafico();

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

    // Lógica de Fila Cheia: (fim + 1) % tamanho == inicio

    // Em uma fila circular, evitamos que o fim atropele o início
    const proximoFim = (this.fim + 1) % this.fila.length;
    if (this.fim === this.inicio && this.fila[this.fim].conteudo !== this.fila[this.fim].lixoOriginal) {
      alert("Fila Cheia (Overflow)!");
      return;
    }

    // APENAS SOBRESCREVE: O valor novo entra no lugar do lixo ou do dado antigo
    this.fila[this.fim].conteudo = valor;

    // O fim avança de forma circular
    this.fim = proximoFim;

    this.atualizarGrafico();
    valorInput.value = '';
    this.gerarCodigo(`f->fila[f->fim] = ${valor};\nf->fim = (f->fim + 1) % ${this.fila.length};`);
  }

  desenfileirar() {
    // Fila Vazia: conteúdo do início é lixo
    if (this.fila[this.inicio].conteudo === this.fila[this.inicio].lixoOriginal) {
      alert("Fila Vazia!");
      return;
    }
    this.inicio = (this.inicio + 1) % this.fila.length;

    this.atualizarGrafico();

    this.gerarCodigo(`f->inicio = (f->inicio + 1) % ${this.fila.length};`);
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

  // No seu componente, adicione/atualize:
  segments: any[] = [];

  // No seu arquivo fila-circular.component.ts

  describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    // Coordenadas do arco externo
    const startOuterX = x + outerRadius * Math.cos(degToRad(startAngle));
    const startOuterY = y + outerRadius * Math.sin(degToRad(startAngle));
    const endOuterX = x + outerRadius * Math.cos(degToRad(endAngle));
    const endOuterY = y + outerRadius * Math.sin(degToRad(endAngle));

    // Coordenadas do arco interno
    const startInnerX = x + innerRadius * Math.cos(degToRad(startAngle));
    const startInnerY = y + innerRadius * Math.sin(degToRad(startAngle));
    const endInnerX = x + innerRadius * Math.cos(degToRad(endAngle));
    const endInnerY = y + innerRadius * Math.sin(degToRad(endAngle));

    // Flag para arcos maiores que 180 graus
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    // Retorna a string do comando 'd' do SVG
    return [
      `M ${startOuterX} ${startOuterY}`, // Move para o início externo
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`, // Desenha arco externo
      `L ${endInnerX} ${endInnerY}`, // Linha para o início interno
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}`, // Desenha arco interno
      "Z" // Fecha o caminho
    ].join(" ");
  }

  atualizarGrafico() {
    const total = this.fila.length;
    if (total === 0) return;
    const angleStep = 360 / total;
    let currentAngle = -90;

    this.segments = this.fila.map((item, i) => {
      let isOcupado = false;

      if (this.inicio < this.fim) {
        // Caso padrão: dados entre inicio e fim
        isOcupado = i >= this.inicio && i < this.fim;
      } else if (this.inicio > this.fim) {
        // Caso circular: dados deram a volta
        isOcupado = i >= this.inicio || i < this.fim;
      } else {
        // NOVO: Quando inicio === fim, a célula só é "ocupada" (azul)
        // se o conteúdo nela não for o lixo inicial de memória.
        isOcupado = item.conteudo !== item.lixoOriginal;
      }

      const middleAngle = currentAngle + (angleStep / 2);
      const rad = (middleAngle * Math.PI) / 180;

      const segment = {
        pathData: this.describeArc(50, 50, 25, 45, currentAngle, currentAngle + angleStep),
        conteudo: item.conteudo,
        isLixo: !isOcupado,
        labelX: 50 + 36 * Math.cos(rad),
        labelY: 50 + 36 * Math.sin(rad),
        pointerX: 50 + 62 * Math.cos(rad),
        pointerY: 50 + 62 * Math.sin(rad)
      };

      currentAngle += angleStep;
      return segment;
    });
  }
  // Seu helper matemático describeArc (mantenha o que você já tem)

}
