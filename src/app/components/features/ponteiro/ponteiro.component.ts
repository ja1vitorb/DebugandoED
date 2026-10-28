import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';


class Variavel {
  private static proxId = 1;
  public id: number;
  public apontaPara: number = 0;
  public isInserted: boolean = false;

  constructor(
    public nome: string,
    public VariavelOuPonteiro: string,
    public tipo: string,
    public memoria: string,
    public lixoMemoria: string
  ) {
    this.id = Variavel.proxId++;
  }
}

class gerenciaVariaveis {
  public VariavelOuPonteiro: Variavel[] = []
  private baseAleatoria: number = 0;

  adicionar(nome: string, VariavelOuPonteiro: string, tipo: string) {
    if (this.verificaNome(nome)) {
      if (this.verificaNomeExistente(nome)) {
        if (this.VariavelOuPonteiro.length === 0) {
          this.baseAleatoria = Math.floor(Math.random() * 8000) + 1000;
        }
        const item = new Variavel(nome, VariavelOuPonteiro, tipo, this.geraEndereco(), this.geraLixoMemoria());
        this.VariavelOuPonteiro.push(item);
      }
      else {
        alert(`${nome}: Este nome de variável já está em uso`);
      }
    } else {
      alert("Nome de variável inválido!");
    }

  }

  verificaNomeExistente(nome: string): boolean {
    let nomeExiste = true;
    for (const item of this.VariavelOuPonteiro) {
      if (item.nome == nome) {
        nomeExiste = false;
      }
    }
    return nomeExiste;
  }

  geraLixoMemoria(tamanho: number = 6): string {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%¨&*()_+-=[]{}?/|";
    let resultado = "";
    for (let i = 0; i < tamanho; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      resultado += caracteres.charAt(indiceAleatorio);
    }
    return resultado;
  }

  geraBase(): number {
    const min = 100;
    const max = 2000;
    const aleatorio = Math.floor(Math.random() * (max - min + 1) + min);
    return aleatorio * 4
  }

  geraEndereco(): string {
    const deslocamento = this.VariavelOuPonteiro.length * 4;
    const numero = this.baseAleatoria + deslocamento;

    return `0x${numero.toString().padStart(4, '0')}`;
  }

  verificaNome(nome: string) {
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    return regex.test(nome);
  }



  limparVariaveis() {
    this.VariavelOuPonteiro = [];
  }

  deletaIndice(nome: string) {
    this.VariavelOuPonteiro = this.VariavelOuPonteiro.filter(item => item.nome !== nome);
  }

  apontaPara(nomePonteiro: string, nomeVariavelAlvo: string): boolean {
    const ponteiro = this.VariavelOuPonteiro.find(item => item.nome === nomePonteiro);
    const variavel = this.VariavelOuPonteiro.find(item => item.nome === nomeVariavelAlvo);

    if (!ponteiro || !variavel) {
      alert("Ponteiro ou variável alvo não encontrados");
      return false;
    }

    if (ponteiro.VariavelOuPonteiro !== 'ponteiro') {
      alert(`${nomePonteiro} não é um ponteiro`);
      return false;
    }

    ponteiro.apontaPara = variavel.id;
    return true;
  }
}

@Component({
  selector: 'app-ponteiro',
  imports: [TranslateModule, CommonModule],
  templateUrl: './ponteiro.component.html',
  styleUrl: './ponteiro.component.scss'
})



export class PonteiroComponent {
  ListaPonteirosEVariaveis: Variavel[] = []
  public gerenciaPonteiros = new gerenciaVariaveis();
  tituloPag = 'POINTER.TITLE_MAIN';
  icon = 'interrogaSimbol.svg'
  reset = 'reset.svg'
  mostra = 'mostraIcon.svg'
  apaga = 'apaga.svg'
  insere = 'insere.svg'
  inicia = 'inicializaVet.svg'

  resetPonteiro = './PrintPonteiro/ponteiroReinicia.png'
  criaPonteiro = './PrintPonteiro/criaPonteiro.png'
  criaApontamento = './PrintPonteiro/ponteiroAponta.png'
  mostraPonteiros = './PrintPonteiro/ponteiroMostra.png'
  inserePonteiro = './PrintPonteiro/ponteiroInsere.png'
  codigoPonteiro = './PrintPonteiro/codigoPonteiro.png'
  memoriaPonteiro = './PrintPonteiro/ponteiroMemoria.png'
  execucaoPonteiro = './PrintPonteiro/ponteiroExecucao.png'

  ponteiroInicializado: boolean = false;
  caixas: string[] = [];
  enderecos: string[] = [];
  elementosModificados: boolean[] = [];
  codigo: string = '';

  // Propriedades para gerenciar apontadores
  ponteiroPorApontar: string = '';
  variaveisDisponiveis: Variavel[] = [];


  // Adicione esta propriedade na classe PonteiroComponent
  abaExplicacaoAtiva: string = 'criar';

  abrirAjuda(id: string) {
    const modal = document.getElementById(id) as HTMLElement;
    if (modal) modal.style.display = "block";
  }

  fecharAjuda(id: string) {
    const modal = document.getElementById(id) as HTMLElement;
    if (modal) modal.style.display = "none";
  }

  // Funções de controle da Modal
  abrirModalExplicaPonteiro() {
    const modal = document.getElementById("explicacao-modal-ponteiro") as HTMLElement;
    if (modal) {
      modal.style.display = "block";
      this.abaExplicacaoAtiva = 'criar'; // Aba padrão ao abrir
    }
  }

  fecharModalExplicaPonteiro() {
    const modal = document.getElementById("explicacao-modal-ponteiro") as HTMLElement;
    if (modal) {
      modal.style.display = "none";
    }
  }

  exibirExplicaPonteiro(aba: string) {
    this.abaExplicacaoAtiva = aba;
  }

  abrirModal() {
    // Lógica para abrir o modal de ajuda
    const modal = document.getElementById("modal") as HTMLElement;
    modal.style.display = "block"
  }

  // Adicione este método dentro da classe PonteiroComponent
  inserirValorVariavel(nomeVariavel: string, novoValor: string) {
    if (!nomeVariavel || novoValor === '') {
      alert("Selecione uma variável e digite um valor.");
      return;
    }

    const index = this.ListaPonteirosEVariaveis.findIndex(item => item.nome === nomeVariavel);

    if (index !== -1) {
      const item = this.ListaPonteirosEVariaveis[index];
      let valorTratado = novoValor;

      // --- VALIDAÇÃO E TRATAMENTO DE FLOAT ---
      if (item.tipo === 'float') {
        // Troca vírgula por ponto caso o usuário use o padrão brasileiro
        valorTratado = valorTratado.replace(',', '.');

        const regexFloat = /^-?\d*(\.\d+)?$/;
        if (!regexFloat.test(valorTratado)) {
          alert(`Erro: A variável "${nomeVariavel}" é do tipo Float. Insira apenas números.`);
          return;
        }

        // Se for um número válido mas não contiver ponto, adiciona o .0
        if (!valorTratado.includes('.')) {
          valorTratado = parseFloat(valorTratado).toFixed(1);
        }
      }

      // --- VALIDAÇÃO DE INTEIRO ---
      else if (item.tipo === 'int') {
        const regexInt = /^-?\d+$/;
        if (!regexInt.test(valorTratado)) {
          alert(`Erro: A variável "${nomeVariavel}" é do tipo Inteiro.`);
          return;
        }
      }

      // --- ATUALIZAÇÃO DOS ARRAYS ---
      this.caixas[index] = valorTratado;
      this.elementosModificados[index] = true;
      this.ListaPonteirosEVariaveis[index].isInserted = true;

      // Atualiza o código exibido
      const formatacao = item.tipo === 'char' ? `'${valorTratado}'` : valorTratado;
      this.codigo = `${nomeVariavel} = ${formatacao};`;
    }
  }



  abrirModalCriaPonteiro() {
    const modal = document.getElementById("modalAponta") as HTMLElement;
    modal.style.display = "block";
  }

  VariavelPonteiroAdiciona(VariavelOuPonteiro: string, tipo: string, nomeElemento: HTMLInputElement) {
    const nome = nomeElemento.value;

    if (!nome) return;

    this.gerenciaPonteiros.adicionar(nome, VariavelOuPonteiro, tipo);
    this.ListaPonteirosEVariaveis = [...this.gerenciaPonteiros.VariavelOuPonteiro];

    // Define o código APENAS para a criação atual
    const asterisco = VariavelOuPonteiro === 'ponteiro' ? '*' : '';
    this.codigo = `${tipo} ${asterisco}${nome};`;

    nomeElemento.value = '';
  }

  iniciaPonteiro() {
    const modal = document.getElementById("modal") as HTMLElement;
    modal.style.display = "none";
    this.ponteiroInicializado = true;

    // Se os endereços ainda não foram gerados (primeira vez), inicializamos
    if (this.enderecos.length === 0) {
      this.caixas = [];
      this.enderecos = [];
      this.elementosModificados = [];
      const baseAleatoria = Math.floor(Math.random() * 8000) + 1000;

      for (let i = 0; i < this.ListaPonteirosEVariaveis.length; i++) {
        this.adicionarNovoEspacoMemoria(i, baseAleatoria);
      }
    } else {
      // Se já existem, apenas adicionamos o que falta (novas variáveis criadas)
      const baseExistente = parseInt(this.enderecos[0].replace('0x', ''), 16);
      for (let i = this.enderecos.length; i < this.ListaPonteirosEVariaveis.length; i++) {
        this.adicionarNovoEspacoMemoria(i, baseExistente);
      }
    }
  }



  geraLixoMemoria(tamanho: number = 6): string {
    const caracteres = "abcdef0123456789!@#$%&*+-"
    let resultado = "";
    for (let i = 0; i < tamanho; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      resultado += caracteres.charAt(indiceAleatorio);
    }
    return resultado;
  }

  adicionarNovoEspacoMemoria(index: number, base: number) {
    const deslocamento = index * 4;
    const numero = base + deslocamento;
    this.enderecos.push(`0x${numero.toString(16).padStart(4, '0').toUpperCase()}`);

    const item = this.ListaPonteirosEVariaveis[index];

    // Se for ponteiro e já estiver apontando, coloca o endereço alvo, senão lixo
    if (item.VariavelOuPonteiro === 'ponteiro' && item.apontaPara > 0) {
      const indexAlvo = this.ListaPonteirosEVariaveis.findIndex(v => v.id === item.apontaPara);
      this.caixas.push(indexAlvo !== -1 ? this.enderecos[indexAlvo] : this.geraLixoMemoria());
    } else {
      this.caixas.push(this.geraLixoMemoria());
    }

    this.elementosModificados.push(false);
  }

  reiniciaPag() {
    // Lógica para reiniciar a página
  }

  abreModalApontador(nomePonteiro: string) {
    this.ponteiroPorApontar = nomePonteiro;
    this.variaveisDisponiveis = this.ListaPonteirosEVariaveis.filter(
      item => item.nome !== nomePonteiro
    );
  }

  confirmApontador(nomeVariavelAlvo: string) {
    if (!this.ponteiroPorApontar || !nomeVariavelAlvo) {
      alert("Selecione um ponteiro e uma variável alvo");
      return;
    }

    if (this.gerenciaPonteiros.apontaPara(this.ponteiroPorApontar, nomeVariavelAlvo)) {
      this.ListaPonteirosEVariaveis = [...this.gerenciaPonteiros.VariavelOuPonteiro];
      this.ponteiroPorApontar = '';
      this.variaveisDisponiveis = [];
      alert(`${this.ponteiroPorApontar} agora aponta para ${nomeVariavelAlvo}`);
    }
  }

  fecharModal() {
    const modal = document.getElementById("modal") as HTMLElement;
    modal.style.display = "none"
  }

  fecharModalAponta() {
    const modal = document.getElementById("modalAponta") as HTMLElement;
    modal.style.display = "none"
  }

  criarApontamento() {
    const selectPonteiro = document.getElementById("ponteiro") as HTMLSelectElement;
    const selectApontado = document.getElementById("apontado") as HTMLSelectElement;
    const nomePonteiro = selectPonteiro.value;
    const nomeApontado = selectApontado.value;

    if (!nomePonteiro || !nomeApontado) return;

    if (this.gerenciaPonteiros.apontaPara(nomePonteiro, nomeApontado)) {
      this.ListaPonteirosEVariaveis = [...this.gerenciaPonteiros.VariavelOuPonteiro];

      // Define o código APENAS para o apontamento atual
      const alvo = this.ListaPonteirosEVariaveis.find(v => v.nome === nomeApontado);
      const prefixoAlvo = alvo?.VariavelOuPonteiro === 'ponteiro' ? '' : '&';
      this.codigo = `${nomePonteiro} = ${prefixoAlvo}${nomeApontado};`;

      this.atualizarCaixas();
      this.fecharModalAponta();
    }
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

  getSvgWidth(): number {
    return 1000;
  }

  getSvgHeight(): number {
    // Altura total baseada no número de linhas
    // Cada linha tem: 80px (caixa)
    const itemHeight = 80; // 80px caixa
    return Math.max(this.ListaPonteirosEVariaveis.length * itemHeight + 32, 100); // +32 para padding total
  }

  atualizarCaixas() {
    // Não resetamos o array this.caixas para não perder os dados inseridos
    for (let i = 0; i < this.ListaPonteirosEVariaveis.length; i++) {
      const item = this.ListaPonteirosEVariaveis[i];

      // Só mexemos na caixa se for um ponteiro que aponta para algo
      if (item.VariavelOuPonteiro === 'ponteiro' && item.apontaPara > 0) {
        const indexAlvo = this.ListaPonteirosEVariaveis.findIndex(v => v.id === item.apontaPara);

        if (indexAlvo !== -1) {
          // O ponteiro agora recebe o endereço da variável alvo
          this.caixas[i] = this.enderecos[indexAlvo];
          // Marcamos como modificado para manter a lógica visual se necessário
          this.elementosModificados[i] = true;
        }
      }
      // Se for uma variável comum ou ponteiro nulo, não fazemos NADA.
      // Isso preserva o valor que já estava lá (seja lixo ou valor azul).
    }
  }

  getCorClasse(i: number): string {
    const item = this.ListaPonteirosEVariaveis[i];
    if (item.VariavelOuPonteiro === 'ponteiro' && item.apontaPara > 0) {
      return 'vermelho-claro';
    } else if (item.isInserted) {
      return 'azul';
    } else {
      return 'vermelho';
    }
  }

  gerarCodigo() {
    // 1. Resetamos a string para garantir que o texto anterior suma
    let code = '';
    let declaracoes = '';
    let atribuicoes = '';

    for (let i = 0; i < this.ListaPonteirosEVariaveis.length; i++) {
      const item = this.ListaPonteirosEVariaveis[i];

      // Parte 1: Gerar Declarações baseadas no tipo selecionado
      const tipoC = item.tipo === 'int' ? 'int' : (item.tipo === 'float' ? 'float' : 'char');
      if (item.VariavelOuPonteiro === 'ponteiro') {
        declaracoes += `${tipoC} *${item.nome};\n`;
      } else {
        declaracoes += `${tipoC} ${item.nome};\n`;
      }

      // Parte 2: Gerar Atribuições de Valores (Valores que você inseriu no input)
      // Usamos a array 'caixas' para pegar o valor atual que está na memória
      if (item.VariavelOuPonteiro === 'variavel' && this.elementosModificados[i]) {
        const valor = this.caixas[i];
        // Se for char, coloca aspas simples, se não, coloca o valor direto
        const valorFormatado = item.tipo === 'char' ? `'${valor}'` : valor;
        atribuicoes += `${item.nome} = ${valorFormatado};\n`;
      }

      // Parte 3: Gerar Apontamentos
      if (item.VariavelOuPonteiro === 'ponteiro' && item.apontaPara > 0) {
        const alvo = this.ListaPonteirosEVariaveis.find(v => v.id === item.apontaPara);
        if (alvo) {
          if (alvo.VariavelOuPonteiro === 'ponteiro') {
            atribuicoes += `${item.nome} = ${alvo.nome};\n`;
          } else {
            atribuicoes += `${item.nome} = &${alvo.nome};\n`;
          }
        }
      }
    }

    // Une as partes no código final
    this.codigo = declaracoes + atribuicoes;
  }

  reiniciaTudo() {
    this.gerenciaPonteiros.limparVariaveis();
    this.ListaPonteirosEVariaveis = [];
    this.ponteiroInicializado = false;
    this.caixas = [];
    this.enderecos = [];
    this.elementosModificados = [];
    this.codigo = '';
  }


  getSetas(): any[] {
    const setas: any[] = [];

    const caixaHeight = 80;      // Altura da caixa definida no CSS
    const gapEntreLinhas = 0;   // Sem gap entre linhas
    const itemHeight = caixaHeight + gapEntreLinhas;
    const offsetCentroY = caixaHeight / 2;  // Centraliza no meio da altura da caixa

    const xPartida = 208;        // Centro horizontal da caixa

    const cores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];

    let corIndex = 0;

    for (let i = 0; i < this.ListaPonteirosEVariaveis.length; i++) {
      const ponteiro = this.ListaPonteirosEVariaveis[i];

      if (ponteiro.VariavelOuPonteiro === 'ponteiro' && ponteiro.apontaPara > 0) {
        const indexAlvo = this.ListaPonteirosEVariaveis.findIndex(item => item.id === ponteiro.apontaPara);

        if (indexAlvo !== -1) {
          // Posicionamento Y considerando o gap entre as linhas
          const yOrigem = (i * itemHeight) + offsetCentroY;
          const yDestino = (indexAlvo * itemHeight) + offsetCentroY;

          // Largura da curva varia para evitar sobreposição
          const larguraCurva = 50 + (corIndex * 20);

          // Desenha saindo do ponteiro, indo para a esquerda, subindo/descendo e indo para o alvo
          const path = `M ${xPartida} ${yOrigem} 
                             L ${xPartida - larguraCurva} ${yOrigem} 
                             L ${xPartida - larguraCurva} ${yDestino} 
                             L ${xPartida} ${yDestino}`;

          const cor = cores[corIndex % cores.length];
          corIndex++;

          setas.push({ path: path, stroke: cor });
        }
      }
    }
    return setas;
  }

  mostrarPonteiros() {
    const modal = document.getElementById("modalMostraPonteiros") as HTMLElement;
    modal.style.display = "block";
  }

  fechaMostraPonteiros() {
    const modal = document.getElementById("modalMostraPonteiros") as HTMLElement;
    modal.style.display = "none";
  }


  getNomeAlvo(idAlvo: number): string {
    if (!idAlvo || idAlvo <= 0) {
      return '-';
    }
    const alvo = this.ListaPonteirosEVariaveis.find(v => v.id === idAlvo);
    return alvo ? alvo.nome : '-';
  }

  getConteudoAlvo(idAlvo: number): string {
    if (idAlvo <= 0) return '-';
    const indexAlvo = this.ListaPonteirosEVariaveis.findIndex(v => v.id === idAlvo);

    if (indexAlvo !== -1 && this.caixas[indexAlvo] !== undefined) {
      return this.caixas[indexAlvo];
    }
    return '-';
  }

  reiniciarTudo() {
    // 1. Limpa a lógica de gerenciamento (Lista interna)
    this.gerenciaPonteiros.limparVariaveis();

    // 2. Reseta todas as propriedades de controle da tela
    this.ListaPonteirosEVariaveis = [];
    this.ponteiroInicializado = false;
    this.caixas = [];
    this.enderecos = [];
    this.elementosModificados = [];
    this.codigo = '';

    // 3. Reseta a base de endereços hexadecimais para que novos sejam gerados na próxima vez
    // (Acessando a propriedade privada se você a criou como sugeri anteriormente)
    // Se você usou uma base fixa no iniciaPonteiro, garanta que ela seja zerada:
    // this.baseFixa = 0; 

    console.log("Sistema reiniciado: pronto para novas variáveis.");

    window.location.reload()
  }
}
