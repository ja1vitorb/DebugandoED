import { Component, ElementRef, AfterViewInit, ViewChild, effect, signal, NgZone, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import cytoscape, { Core } from 'cytoscape';
import { GraphService } from './services/graph.service';
import {
  AlgorithmsService,
  BfsMacroTrace,
  DfsMacroTrace,
  DijkstraMacroTrace,
  ColoringMacroTrace,
  TspMacroTrace
} from './services/algorithms.service';
import { GraphData } from './models/graph.models';

interface MemoryRow {
  nome: string;
  endereco: string;
  conteudo: string;
  // Cores (hex/hsl) a mostrar como quadradinhos ao lado do conteúdo — usado
  // pela Coloração pra tornar "coresVizinhos"/"corAtribuida" visíveis, não só texto.
  swatches?: string[];
}

interface MacroStepConfig {
  title: string;
  description: string;
  codeLines: number[];
}

// ---------- Conteúdo estruturado dos modais de ajuda ('?' de cada bloco) ----------
// Mesmo padrão usado no módulo Vetor: um título grande, uma ou mais seções
// (cada uma com subtítulo opcional, texto, um bloco de código opcional e
// imagens explicativas opcionais). As imagens ainda não existem no projeto —
// os caminhos abaixo são só o "contrato" de nome de arquivo esperado.
interface HelpImage {
  src: string;
  alt: string;
}

interface HelpSection {
  subtitle?: string;
  text: string;
  codeBlock?: string;
  images?: HelpImage[];
}

interface HelpContent {
  title: string;
  sections: HelpSection[];
}

type MacroTrace = BfsMacroTrace | DfsMacroTrace | DijkstraMacroTrace | ColoringMacroTrace | TspMacroTrace;

// Endereços fictícios das variáveis locais dos algoritmos, numa faixa de
// memória separada da dos nós/arestas do grafo.
const TRACE_VAR_ADDRESS: Record<string, string> = {
  atual: '0x003000',
  fila: '0x003004',
  pilha: '0x003008',
  visitados: '0x00300C',
  distancias: '0x003010',
  coresVizinhos: '0x003014',
  corAtribuida: '0x003018',
  proximo: '0x00301C',
  custoAcumulado: '0x003020',
  rota: '0x003024',
  candidatos: '0x003028'
};

// ---------- Código de exemplo, macro-passos didáticos e conteúdo de ajuda ----------
// Antes esses eram objetos fixos em português, definidos aqui no escopo do
// módulo. Agora, pra suportar PT/EN, o texto real mora nos arquivos de
// tradução (assets/i18n/pt.json e en.json, chave "GRAPH") e é lido em tempo
// de execução pelos métodos getCodeLines/getMacroSteps/getHelpContent logo
// abaixo da classe — sempre no idioma atualmente selecionado no menu.

@Component({
  selector: 'app-grafos',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './grafos.component.html',
  styleUrl: './grafos.component.scss'
})
export class GrafosComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cyContainer') container!: ElementRef;
  private cy!: Core;
  private firstSelectedNode: string | null = null;
  private mode: 'idle' | 'selectingOrigin' = 'idle';
  pendingAlgorithm: string | null = null;
  private pathPredecessors = new Map<string, string | null>();
  private lastGraphData: GraphData | null = null;

  // Timers de animação em andamento (modo "rodar tudo"), pra poder cancelar
  // tudo de uma vez quando o usuário troca de algoritmo/modo no meio da execução.
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

  private scheduleTimeout(fn: () => void, delay: number) {
    const id = setTimeout(() => {
      this.pendingTimeouts = this.pendingTimeouts.filter(t => t !== id);
      fn();
    }, delay);
    this.pendingTimeouts.push(id);
  }

  private clearPendingTimeouts() {
    this.pendingTimeouts.forEach(id => clearTimeout(id));
    this.pendingTimeouts = [];
  }

  // Guarda qual algoritmo está (ou acabou de ficar) em execução, mesmo depois
  // de 'pendingAlgorithm' ser zerado ao iniciar a animação — é o que permite
  // ao botão "encerrar" (✕) voltar direto pra escolha de modo do MESMO
  // algoritmo, sem precisar trocar e voltar no <select>.
  private lastRunAlgorithm: string | null = null;

  // Status do algoritmo (escolher modo, executando, concluído...) — fica
  // exibido perto do seletor de algoritmo/escolha de modo.
  statusMessage = signal('');
  // Feedback de inserir/excluir nó — fica exibido logo abaixo desses campos.
  nodeActionMessage = signal('');
  // Feedback de conectar nós (só erro) — fica exibido logo abaixo desse campo.
  connectActionMessage = signal('');
  algorithmResult = signal<{ nodeId: string; label: string; distance?: number }[] | null>(null);
  coloringGroups = signal<{ color: string; labels: string[]; nodeIds: string[] }[] | null>(null);

  // Passo atual do histórico final (navegação com setas, reaproveitado após o macro-trace)
  currentStepIndex = signal(0);

  // Painel de código (mostra o "código C" da última ação feita no grafo).
  // Valor inicial de verdade é setado no construtor (depois que o
  // TranslateService existe), via this.t('CODE_SNIPPET.INITIAL').
  codigoAtual = signal<string>('');

  // Painel de memória (tabela fictícia representando nós/arestas na memória)
  memoryRows = signal<MemoryRow[]>([]);

  // Validação do limite de nós no campo de geração aleatória
  nodeCountError = signal('');

  // Modais customizados (substituem o prompt() nativo)
  nodeModalOpen = signal(false);
  nodeModalError = signal('');
  edgeModalOpen = signal(false);
  randomModalOpen = signal(false);
  helpModalOpen = signal(false);
  // Conteúdo estruturado (título + seções) do modal de ajuda aberto no momento.
  activeHelp = signal<HelpContent | null>(null);
  // Menu suspenso (3 listras) da Execução/Simulação — só tem a opção "Exportar".
  exportMenuOpen = signal(false);
  private pendingEdgeWeightSource: string | null = null;
  private pendingEdgeWeightTarget: string | null = null;

  // Modo de execução escolhido pelo usuário: rodar tudo de uma vez, ou passo a passo.
  // São dois caminhos separados (não um dentro do outro).
  runMode = signal<'full' | 'step' | null>(null);

  // ---------- Macro-passos didáticos (modo "passo a passo") ----------
  // Válido para qualquer um dos 5 algoritmos (bfs/dfs/dijkstra/coloring/tsp).
  isTraceAlgorithm = signal(false);
  traceAlgorithm: string | null = null;
  // true quando o TSP em exibição usou a heurística do vizinho mais próximo
  // (passo a passo); false quando usou o algoritmo exato Held-Karp ("rodar
  // tudo") — controla o aviso "heurística aproximada" e a mensagem final.
  tspIsHeuristic = false;
  activeCodeLines: string[] = [];
  activeMacroSteps: MacroStepConfig[] = [];
  macroStepIndex = signal(0);
  private currentTrace: MacroTrace | null = null;
  iterationIndex = signal(-1); // -1 = ainda não rodou nenhuma iteração do passo 3
  traceCodeLines = signal<number[]>([]);
  traceMemoryRows = signal<MemoryRow[]>([]);

  // Nomes dos 5 algoritmos que têm macro-passos/código/ajuda traduzidos.
  private static readonly ALGO_KEYS = ['bfs', 'dfs', 'dijkstra', 'coloring', 'tsp'];

  // Incrementado toda vez que o idioma do site muda (ver onLangChange no
  // construtor) — só serve pra dar ao Angular um motivo de reavaliar os
  // getters/expressões de template que dependem do idioma atual.
  langVersion = signal(0);
  private langChangeSub: Subscription | null = null;

  constructor(
    private graphService: GraphService,
    private algorithmsService: AlgorithmsService,
    private ngZone: NgZone,
    private translate: TranslateService
  ) {
    effect(() => {
      const data = this.graphService.graph();
      this.updateMemoryRows(data);
      if (this.cy) {
        this.renderGraph(data);
      }
    });

    this.activeCodeLines = this.getCodeLines('bfs');
    this.activeMacroSteps = this.getMacroSteps('bfs');
    this.codigoAtual.set('');

    // Sempre que o idioma muda (botão PT/EN do menu superior), reconstrói
    // tudo que já estava calculado no idioma antigo: código ativo, textos
    // de passo e a tabela de memória do algoritmo em andamento, se houver.
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.langVersion.update(v => v + 1);
      this.refreshLangDependentView();
    });
  }

  ngOnDestroy() {
    this.langChangeSub?.unsubscribe();
  }

  // Atalho pra buscar uma chave de tradução dentro do namespace "GRAPH".
  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant('GRAPH.' + key, params);
  }

  private getCodeLines(algo: string): string[] {
    return (this.translate.instant('GRAPH.CODE_LINES.' + algo.toUpperCase()) as string[]) || [];
  }

  private getMacroSteps(algo: string): MacroStepConfig[] {
    return (this.translate.instant('GRAPH.MACRO.' + algo.toUpperCase()) as MacroStepConfig[]) || [];
  }

  private getHelpContent(key: string): HelpContent {
    return this.translate.instant('GRAPH.HELP.' + key.toUpperCase()) as HelpContent;
  }

  // Reconstrói, no idioma atual, o que estiver sendo mostrado agora mesmo
  // (código ativo + passo/iteração do macro-trace, ou a memória "real" do
  // grafo) — chamado ao trocar o idioma, pra não deixar nada "preso" no
  // idioma anterior enquanto a página não muda de estado por conta própria.
  private refreshLangDependentView() {
    if (this.traceAlgorithm) {
      this.activeCodeLines = this.getCodeLines(this.traceAlgorithm);
      this.activeMacroSteps = this.getMacroSteps(this.traceAlgorithm);
      this.applyMacroStep(this.macroStepIndex());
      if (this.macroStepIndex() === 2) {
        this.applyIterationView();
      }
    }
    this.updateMemoryRows(this.graphService.graph());
  }

  // Todos os algoritmos têm um modo "passo a passo" guiado.
  supportsStepMode(algorithm: string | null): boolean {
    return !!algorithm && GrafosComponent.ALGO_KEYS.includes(algorithm);
  }

  // Controla o botão único que alterna entre "Inicializar Grafo" (verde, grafo vazio)
  // e "Reiniciar execução" (vermelho, já existe algo no grafo).
  hasNodes(): boolean {
    return this.graphService.graph().nodes.length > 0;
  }

  onAlgorithmSelected(value: string) {
    this.clearPendingTimeouts();
    this.resetTraceState();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.runMode.set(null);
    this.pendingAlgorithm = null;
    this.lastRunAlgorithm = null;
    this.mode = 'idle';

    // Limpa qualquer cor/destaque deixado no grafo pelo algoritmo anterior
    // (nós visitados, coloridos, caminho destacado etc.) — senão ficava tudo
    // "sujo" ao trocar de algoritmo, mesmo com o histórico de texto já limpo.
    if (this.cy) {
      this.cy.elements().removeClass('visiting visited scanning max-degree consultando em-foco path-highlight selected-for-edge');
      this.resetNodeColors();
    }

    if (!value) {
      this.statusMessage.set('');
      return;
    }

    const data = this.graphService.graph();
    if (data.nodes.length === 0) {
      this.statusMessage.set(this.t('MSG.DRAW_NODE_FIRST'));
      return;
    }

    this.pendingAlgorithm = value;
    this.lastRunAlgorithm = value;

    if (this.supportsStepMode(value)) {
      // Espera o usuário escolher "rodar tudo" ou "passo a passo" antes de seguir.
      this.statusMessage.set(this.t('MSG.CHOOSE_RUN_MODE'));
      return;
    }

    this.runMode.set('full');
    this.mode = 'selectingOrigin';
    this.statusMessage.set(this.t('MSG.CLICK_ORIGIN_NODE'));
  }

  // Confirma o modo de execução (chamado pelos botões "Rodar tudo" / "Passo a passo").
  chooseRunMode(mode: 'full' | 'step') {
    if (!this.pendingAlgorithm) return;
    this.runMode.set(mode);

    // Coloração não depende de um nó de origem: roda direto.
    if (this.pendingAlgorithm === 'coloring') {
      const data = this.graphService.graph();
      const algo = this.pendingAlgorithm;
      this.lastRunAlgorithm = algo;
      this.pendingAlgorithm = null;
      this.runMode.set(null);
      if (mode === 'step') {
        this.runColoringMacro(data);
      } else {
        this.runColoring(data);
      }
      return;
    }

    this.mode = 'selectingOrigin';
    this.statusMessage.set(this.t('MSG.CLICK_ORIGIN_NODE'));
  }

  onNodeCountInput(value: string) {
    const num = Number(value);
    if (num > 10) {
      this.nodeCountError.set(this.t('MSG.MAX_NODES'));
    } else {
      this.nodeCountError.set('');
    }
  }

  openRandomModal() {
    this.randomModalOpen.set(true);
  }

  closeRandomModal() {
    this.randomModalOpen.set(false);
  }

  confirmRandomGraph(nodeCountStr: string, maxWeightStr: string, directed: boolean, connected: boolean) {
    const nodeCount = Math.min(Number(nodeCountStr) || 6, 10);
    const maxWeight = Number(maxWeightStr) || 20;
    this.graphService.generateRandomGraph(nodeCount, maxWeight, directed, connected);
    this.statusMessage.set('');
    this.nodeActionMessage.set('');
    this.connectActionMessage.set('');
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.nodeCountError.set('');
    this.randomModalOpen.set(false);
    this.resetTraceState();
    this.codigoAtual.set(
      this.t('CODE_SNIPPET.RANDOM_GRAPH', {
        directed: directed ? 1 : 0,
        nodeCount,
        maxWeight,
        connected: connected ? 1 : 0
      })
    );
  }

  // Botão vermelho "Reiniciar execução" (igual ao do Vetor): limpa tudo e começa do zero.
  resetAll() {
    this.clearPendingTimeouts();
    this.graphService.clearGraph();

    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.lastRunAlgorithm = null;
    this.runMode.set(null);
    this.firstSelectedNode = null;
    this.pendingEdgeWeightSource = null;
    this.pendingEdgeWeightTarget = null;
    this.lastGraphData = null;
    this.pathPredecessors = new Map();

    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.nodeCountError.set('');
    this.statusMessage.set(this.t('MSG.EXECUTION_RESTARTED'));
    this.nodeActionMessage.set('');
    this.connectActionMessage.set('');
    this.resetTraceState();

    this.codigoAtual.set('');

    if (this.cy) {
      this.cy.elements().removeClass('visiting visited scanning max-degree consultando em-foco path-highlight selected-for-edge');
      this.resetNodeColors();
    }
  }

  // ---------- Inserir/excluir/conectar nó (mesmo padrão de campo+botão do módulo Vetor) ----------
  // Alternativa acessível à manipulação por toque/clique direto no grafo.

  addNodeByLabel(label: string) {
    if (!label || !label.trim()) return;

    const nome = label.trim();
    const data = this.graphService.graph();
    if (this.graphService.hasNodeLabel(nome)) {
      this.nodeActionMessage.set(this.t('MSG.NODE_EXISTS', { name: nome }));
      return;
    }
    if (data.nodes.length >= 10) {
      this.nodeActionMessage.set(this.t('MSG.MAX_NODES'));
      return;
    }

    this.graphService.addNode(nome);
    this.resetTraceState();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.nodeActionMessage.set(this.t('MSG.NODE_INSERTED', { name: nome }));
    this.codigoAtual.set(this.t('CODE_SNIPPET.ADD_NODE', { name: nome }));
  }

  removeNodeByLabel(label: string) {
    if (!label || !label.trim()) return;

    const nome = label.trim();
    const data = this.graphService.graph();
    const node = data.nodes.find(n => n.label === nome);

    if (!node) {
      this.nodeActionMessage.set(this.t('MSG.NODE_NOT_FOUND', { name: nome }));
      return;
    }

    this.graphService.removeNode(node.id);
    this.resetTraceState();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.firstSelectedNode = null;
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.runMode.set(null);
    this.nodeActionMessage.set(this.t('MSG.NODE_REMOVED', { name: nome }));
    this.codigoAtual.set(this.t('CODE_SNIPPET.REMOVE_NODE', { name: nome }));
  }

  // Conecta dois nós pelo nome, com peso — alternativa ao clique duplo no grafo.
  connectNodesByLabel(labelA: string, labelB: string, weightStr: string) {
    const nomeA = (labelA || '').trim();
    const nomeB = (labelB || '').trim();

    if (!nomeA || !nomeB) {
      this.connectActionMessage.set(this.t('MSG.CONNECT_NEED_TWO_NAMES'));
      return;
    }
    if (nomeA === nomeB) {
      this.connectActionMessage.set(this.t('MSG.CONNECT_SAME_NODE'));
      return;
    }

    const data = this.graphService.graph();
    const nodeA = data.nodes.find(n => n.label === nomeA);
    const nodeB = data.nodes.find(n => n.label === nomeB);

    if (!nodeA || !nodeB) {
      const faltando = !nodeA ? nomeA : nomeB;
      this.connectActionMessage.set(this.t('MSG.NODE_NOT_FOUND', { name: faltando }));
      return;
    }

    const weight = Number(weightStr) || 1;
    this.graphService.addEdge(nodeA.id, nodeB.id, weight);
    this.resetTraceState();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    // Sem mensagem de sucesso aqui (só erro) — e agora fica no campo certo,
    // logo abaixo de "Conectar Nós", não mais embaixo do seletor de algoritmo.
    this.connectActionMessage.set('');

    this.codigoAtual.set(
      this.t('CODE_SNIPPET.ADD_EDGE', { source: nomeA, target: nomeB, weight })
    );
  }

  ngAfterViewInit() {
    this.cy = cytoscape({
      container: this.container.nativeElement,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'label': 'data(weight)',
            'curve-style': 'bezier'
          }
        },
        {
          selector: 'node.selected-for-edge',
          style: { 'background-color': '#f59e0b', 'border-width': 3, 'border-color': '#f59e0b' }
        },
        {
          selector: 'node.visiting',
          style: { 'background-color': '#ef4444' }
        },
        {
          selector: 'node.visited',
          style: { 'background-color': '#22c55e' }
        },
        {
          selector: 'node.path-highlight',
          style: { 'border-width': 5, 'border-color': '#000000' }
        },
        {
          selector: 'edge.path-highlight',
          style: { 'line-color': '#000000', 'width': 4, 'z-index': 999 }
        },
        {
          selector: 'node.scanning',
          style: { 'background-color': '#fbbf24' }
        },
        {
          selector: 'node.max-degree',
          style: { 'background-color': '#dc2626', 'border-width': 4, 'border-color': '#000000' }
        },
        {
          // Vizinho já colorido sendo consultado (Coloração passo a passo) —
          // só a borda muda, pra não esconder a cor que ele já recebeu.
          selector: 'node.consultando',
          style: { 'border-width': 4, 'border-color': '#000000', 'border-style': 'dashed' }
        },
        {
          // Nó sendo processado nesta iteração (Coloração passo a passo).
          selector: 'node.em-foco',
          style: { 'border-width': 5, 'border-color': '#2563eb', 'border-style': 'solid' }
        }
      ]
    });

    this.renderGraph(this.graphService.graph());

    this.cy.on('tap', (event) => {
      if (event.target === this.cy && this.mode === 'idle') {
        this.nodeModalError.set('');
        this.nodeModalOpen.set(true);
      }
    });

    this.cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();

      if (this.mode === 'selectingOrigin') {
        this.runAlgorithm(nodeId);
        return;
      }

      if (!this.firstSelectedNode) {
        this.firstSelectedNode = nodeId;
        event.target.addClass('selected-for-edge');
      } else if (this.firstSelectedNode !== nodeId) {
        this.pendingEdgeWeightSource = this.firstSelectedNode;
        this.pendingEdgeWeightTarget = nodeId;
        this.edgeModalOpen.set(true);
      } else {
        event.target.removeClass('selected-for-edge');
        this.firstSelectedNode = null;
      }
    });
  }

  // ---------- Modais customizados ----------

  confirmCreateNode(label: string) {
    if (!label || !label.trim()) {
      this.nodeModalOpen.set(false);
      return;
    }

    const nome = label.trim();
    // Mesmas regras do campo "Inserir nó" do painel: sem nome repetido e no máximo 10 nós.
    // O modal fica aberto mostrando o erro, pra pessoa corrigir o nome.
    if (this.graphService.hasNodeLabel(nome)) {
      this.nodeModalError.set(this.t('MSG.NODE_EXISTS', { name: nome }));
      return;
    }
    if (this.graphService.graph().nodes.length >= 10) {
      this.nodeModalError.set(this.t('MSG.MAX_NODES'));
      return;
    }

    this.nodeModalOpen.set(false);
    this.graphService.addNode(nome);
    this.resetTraceState();
    this.codigoAtual.set(this.t('CODE_SNIPPET.ADD_NODE', { name: label.trim() }));
  }

  cancelCreateNode() {
    this.nodeModalError.set('');
    this.nodeModalOpen.set(false);
  }

  confirmCreateEdge(weightStr: string) {
    this.edgeModalOpen.set(false);
    const source = this.pendingEdgeWeightSource;
    const target = this.pendingEdgeWeightTarget;
    this.pendingEdgeWeightSource = null;
    this.pendingEdgeWeightTarget = null;

    if (!source || !target) return;

    const weight = Number(weightStr) || 1;
    const data = this.graphService.graph();
    const originLabel = data.nodes.find(n => n.id === source)?.label ?? '?';
    const targetLabel = data.nodes.find(n => n.id === target)?.label ?? '?';

    this.graphService.addEdge(source, target, weight);
    this.resetTraceState();

    this.codigoAtual.set(
      this.t('CODE_SNIPPET.ADD_EDGE', { source: originLabel, target: targetLabel, weight })
    );

    this.cy.$id(source).removeClass('selected-for-edge');
    this.firstSelectedNode = null;
  }

  cancelCreateEdge() {
    this.edgeModalOpen.set(false);
    if (this.pendingEdgeWeightSource) {
      this.cy.$id(this.pendingEdgeWeightSource).removeClass('selected-for-edge');
    }
    this.pendingEdgeWeightSource = null;
    this.pendingEdgeWeightTarget = null;
    this.firstSelectedNode = null;
  }

  // key: 'painel' | 'codigo' | 'memoria' | 'execucao' — ver getHelpContent.
  openHelp(key: string) {
    const content = this.getHelpContent(key);
    if (!content) return;
    this.activeHelp.set(content);
    this.helpModalOpen.set(true);
  }

  closeHelp() {
    this.helpModalOpen.set(false);
  }

  // ---------- Menu suspenso de exportação (3 listras da Execução/Simulação) ----------

  toggleExportMenu() {
    this.exportMenuOpen.update(v => !v);
  }

  closeExportMenu() {
    this.exportMenuOpen.set(false);
  }

  onExportClick() {
    this.exportMenuOpen.set(false);
    this.exportGraphAsPdf();
  }

  // Remove qualquer cor customizada deixada por uma execução anterior (Coloração define
  // 'background-color' direto via style(), o que tem prioridade sobre as classes
  // .visited/.visiting/etc. do stylesheet — por isso precisa ser removido, não sobrescrito,
  // senão os nós visitados não mudam de cor nas próximas execuções).
  private resetNodeColors() {
    this.cy.nodes().removeStyle('background-color');
    this.cy.nodes().removeClass('visiting visited scanning max-degree consultando em-foco selected-for-edge path-highlight');
    this.cy.edges().removeClass('path-highlight');
  }

  // ---------- Exportar o grafo em PDF (botão "save" da Execução/Simulação) ----------

  // Gera um PDF de uma página só com uma imagem do grafo como está desenhado
  // no momento (cores, destaques etc. inclusos). Não usa nenhuma biblioteca
  // externa: o Cytoscape já exporta o grafo como JPEG, e aqui montamos à mão
  // um PDF mínimo (um objeto de página + uma imagem) com esse JPEG dentro —
  // evita ter que adicionar uma dependência nova só pra isso.
  exportGraphAsPdf() {
    if (!this.cy || this.graphService.graph().nodes.length === 0) {
      this.statusMessage.set(this.t('MSG.DRAW_GRAPH_FIRST_EXPORT'));
      return;
    }

    const scale = 2; // resolução maior que a tela, pra ficar nítido impresso
    const jpgDataUrl = this.cy.jpg({
      full: true,
      scale,
      bg: '#ffffff',
      quality: 1
    }) as unknown as string;

    const img = new Image();
    img.onload = () => {
      const pxWidth = img.naturalWidth;
      const pxHeight = img.naturalHeight;
      // Página do PDF no mesmo tamanho "visual" do grafo (a imagem embutida
      // fica com o dobro da resolução, por causa do scale acima).
      const widthPt = pxWidth / scale;
      const heightPt = pxHeight / scale;

      const base64 = jpgDataUrl.substring(jpgDataUrl.indexOf(',') + 1);
      const pdfBytes = this.buildSingleImagePdf(base64, pxWidth, pxHeight, widthPt, heightPt);
      this.downloadBytes(pdfBytes, 'grafo.pdf', 'application/pdf');
    };
    img.onerror = () => {
      this.statusMessage.set(this.t('MSG.EXPORT_IMAGE_ERROR'));
    };
    img.src = jpgDataUrl;
  }

  // Monta um PDF mínimo válido (1.4) com uma única página contendo uma
  // imagem JPEG (filtro DCTDecode) esticada pra preencher a página inteira.
  private buildSingleImagePdf(
    jpegBase64: string,
    imgWidthPx: number,
    imgHeightPx: number,
    pageWidthPt: number,
    pageHeightPt: number
  ): Uint8Array {
    const binary = atob(jpegBase64);
    const imgBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      imgBytes[i] = binary.charCodeAt(i);
    }

    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];
    const offsets: number[] = [0, 0, 0, 0, 0, 0]; // índice 0 não usado
    let pos = 0;

    const pushText = (str: string) => {
      const bytes = encoder.encode(str);
      parts.push(bytes);
      pos += bytes.length;
    };
    const pushBytes = (bytes: Uint8Array) => {
      parts.push(bytes);
      pos += bytes.length;
    };

    pushText('%PDF-1.4\n');

    offsets[1] = pos;
    pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    offsets[2] = pos;
    pushText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    offsets[3] = pos;
    pushText(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] ` +
      `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
    );

    offsets[4] = pos;
    pushText(
      `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
    );
    pushBytes(imgBytes);
    pushText('\nendstream\nendobj\n');

    const content = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im0 Do\nQ`;
    offsets[5] = pos;
    pushText(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);

    const xrefStart = pos;
    pushText('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i <= 5; i++) {
      pushText(`${offsets[i].toString().padStart(10, '0')} 00000 n \n`);
    }
    pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

    const total = parts.reduce((sum, p) => sum + p.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }

  private downloadBytes(bytes: Uint8Array, filename: string, mimeType: string) {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private runAlgorithm(originId: string) {
    const algo = this.pendingAlgorithm;
    const mode = this.runMode();
    this.runMode.set(null);
    this.lastRunAlgorithm = algo;

    if (algo === 'tsp') {
      if (mode === 'step') {
        this.runTspMacro(originId);
      } else {
        this.runTsp(originId);
      }
      return;
    }

    if (algo === 'bfs') {
      if (mode === 'step') {
        this.runBfsMacro(originId);
      } else {
        this.runBfsFull(originId);
      }
      return;
    }

    if (algo === 'dfs') {
      if (mode === 'step') {
        this.runDfsMacro(originId);
      } else {
        this.runDfsFull(originId);
      }
      return;
    }

    if (algo === 'dijkstra') {
      if (mode === 'step') {
        this.runDijkstraMacro(originId);
      } else {
        this.runDijkstraFull(originId);
      }
      return;
    }
  }

  // ---------- "Rodar tudo de uma vez" (anima a visita e mostra o histórico completo) ----------

  private runBfsFull(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.bfsMacroTrace(data, originId);
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.coloringGroups.set(null);
    this.animateMacroTraceFull('bfs', trace);
  }

  private runDfsFull(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.dfsMacroTrace(data, originId);
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.coloringGroups.set(null);
    this.animateMacroTraceFull('dfs', trace);
  }

  private runDijkstraFull(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.dijkstraMacroTrace(data, originId);
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.coloringGroups.set(null);
    this.animateMacroTraceFull('dijkstra', trace);
  }

  // Roda um macro-trace automaticamente (sem precisar clicar em "próximo"),
  // usado no modo "rodar tudo de uma vez" — mas atualizando a tabela de
  // Memória a cada iteração, igual ao modo passo a passo faz manualmente.
  // Não liga 'isTraceAlgorithm', então o painel de Passo a Passo (título,
  // descrição, stepper) continua escondido; só a memória e o grafo se movem.
  private animateMacroTraceFull(algo: string, trace: MacroTrace, delay = 700) {
    this.resetNodeColors();
    this.algorithmResult.set(null);
    this.traceAlgorithm = algo;
    this.currentTrace = trace;
    this.activeCodeLines = this.getCodeLines(algo);
    this.activeMacroSteps = this.getMacroSteps(algo);
    this.macroStepIndex.set(0);
    this.iterationIndex.set(-1);
    this.statusMessage.set(this.t('MSG.RUNNING'));
    this.applyIterationView();

    const total = trace.iterations.length;
    for (let i = 0; i < total; i++) {
      this.scheduleTimeout(() => {
        this.ngZone.run(() => {
          this.iterationIndex.set(i);
          this.applyIterationView();
        });
      }, (i + 1) * delay);
    }

    this.scheduleTimeout(() => {
      this.ngZone.run(() => {
        this.applyMacroStep(3);
      });
    }, total * delay + delay);
  }

  // ---------- Macro-execução (4 passos didáticos, modo "passo a passo") ----------

  // Prepara o estado comum a qualquer algoritmo em modo passo a passo e
  // mostra o Passo 1.
  private startMacroTrace(algo: string, trace: MacroTrace) {
    this.resetNodeColors();
    this.traceAlgorithm = algo;
    this.currentTrace = trace;
    this.activeCodeLines = this.getCodeLines(algo);
    this.activeMacroSteps = this.getMacroSteps(algo);
    this.isTraceAlgorithm.set(true);
    this.iterationIndex.set(-1);
    this.macroStepIndex.set(0);
    this.statusMessage.set('');
    this.applyMacroStep(0);
  }

  private runBfsMacro(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.bfsMacroTrace(data, originId);
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.coloringGroups.set(null);
    this.algorithmResult.set(null);
    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.startMacroTrace('bfs', trace);
  }

  private runDfsMacro(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.dfsMacroTrace(data, originId);
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.coloringGroups.set(null);
    this.algorithmResult.set(null);
    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.startMacroTrace('dfs', trace);
  }

  private runDijkstraMacro(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.dijkstraMacroTrace(data, originId);
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.coloringGroups.set(null);
    this.algorithmResult.set(null);
    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.startMacroTrace('dijkstra', trace);
  }

  private runColoringMacro(data: GraphData) {
    this.lastGraphData = data;
    this.pathPredecessors = new Map();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.cy.elements().removeClass('visiting visited scanning max-degree consultando em-foco path-highlight');

    const trace = this.algorithmsService.coloringMacroTrace(data);
    this.startMacroTrace('coloring', trace);
  }

  private runTspMacro(originId: string) {
    const data = this.graphService.graph();
    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.coloringGroups.set(null);
    this.algorithmResult.set(null);

    const trace = this.algorithmsService.tspMacroTrace(data, originId);
    if (!trace) {
      this.resetTraceState();
      this.statusMessage.set(this.t('MSG.NO_ROUTE_NEEDS_CONNECTED'));
      return;
    }

    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.tspIsHeuristic = true;
    this.startMacroTrace('tsp', trace);
  }

  private resetTraceState() {
    this.isTraceAlgorithm.set(false);
    this.currentTrace = null;
    this.traceAlgorithm = null;
    this.tspIsHeuristic = false;
    this.macroStepIndex.set(0);
    this.iterationIndex.set(-1);
  }

  // Mostra a linha de variáveis do algoritmo na tabela de Memória sempre que
  // algum trace está ativo — tanto no modo passo a passo (isTraceAlgorithm)
  // quanto durante a animação do "rodar tudo" (que só liga 'traceAlgorithm').
  get hasTraceMemory(): boolean {
    return !!this.traceAlgorithm;
  }

  // Controla os botões "▶ Rodar tudo" / "⏭ Rodar passo a passo": só aparecem
  // antes do usuário escolher um modo. Depois disso, o mesmo espaço passa a
  // mostrar o botão "✕ Encerrar algoritmo" (ver canCancelExecution).
  get showRunModeChoice(): boolean {
    return !!this.pendingAlgorithm && this.supportsStepMode(this.pendingAlgorithm) && !this.runMode();
  }

  // Controla a visibilidade do botão "✕ Encerrar algoritmo": aparece sempre
  // que há algo em andamento ou já executado (escolhendo origem, animando,
  // passo a passo, ou com um resultado/coloração na tela).
  get canCancelExecution(): boolean {
    return !!this.pendingAlgorithm || !!this.traceAlgorithm || !!this.algorithmResult() || !!this.coloringGroups();
  }

  // Botão "Voltar" que substitui "Reiniciar execução" enquanto o usuário está
  // na tela de escolher "rodar tudo" / "passo a passo" (showRunModeChoice):
  // nesse momento nada foi executado ainda, então não faz sentido só oferecer
  // "apagar o grafo inteiro" pra desistir do algoritmo — isso aqui só
  // desmarca o algoritmo escolhido e volta pro <select>, sem tocar no grafo.
  backToAlgorithmSelection() {
    this.pendingAlgorithm = null;
    this.lastRunAlgorithm = null;
    this.runMode.set(null);
    this.mode = 'idle';
    this.statusMessage.set('');
  }

  // Encerra o algoritmo atual (em qualquer estágio: escolhendo origem,
  // animando ou já com resultado) e volta direto para a escolha de modo
  // ("rodar tudo" / "passo a passo") do MESMO algoritmo — sem precisar
  // trocar pra outro no <select> e voltar.
  cancelExecution() {
    this.clearPendingTimeouts();
    this.resetTraceState();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.mode = 'idle';
    this.firstSelectedNode = null;

    if (this.cy) {
      this.cy.elements().removeClass('visiting visited scanning max-degree consultando em-foco path-highlight selected-for-edge');
      this.resetNodeColors();
    }

    this.pendingAlgorithm = this.lastRunAlgorithm;
    this.runMode.set(null);

    if (this.pendingAlgorithm) {
      this.statusMessage.set(this.t('MSG.CHOOSE_RUN_MODE'));
    } else {
      this.statusMessage.set('');
    }
  }

  private labelOf(id: string | null): string {
    if (!id) return this.t('VAL.NONE');
    return this.lastGraphData?.nodes.find(n => n.id === id)?.label ?? '?';
  }

  private labelsOf(ids: string[]): string {
    return ids.length ? ids.map(id => this.labelOf(id)).join(', ') : this.t('VAL.EMPTY_M');
  }

  private formatDistances(distances: Map<string, number>): string {
    if (!this.lastGraphData) return '';
    return this.lastGraphData.nodes.map(n => {
      const d = distances.get(n.id);
      const shown = d === undefined || d === Infinity ? '∞' : String(d);
      return `${n.label}:${shown}`;
    }).join(', ');
  }

  // Aplica o estado visual (código, memória, grafo) do macro-passo informado,
  // despachando para o algoritmo que estiver em execução no momento.
  private applyMacroStep(stepIndex: number) {
    if (!this.currentTrace) return;

    this.macroStepIndex.set(stepIndex);
    this.traceCodeLines.set(this.activeMacroSteps[stepIndex].codeLines);

    switch (this.traceAlgorithm) {
      case 'bfs': this.applyBfsMacroStep(stepIndex); break;
      case 'dfs': this.applyDfsMacroStep(stepIndex); break;
      case 'dijkstra': this.applyDijkstraMacroStep(stepIndex); break;
      case 'coloring': this.applyColoringMacroStep(stepIndex); break;
      case 'tsp': this.applyTspMacroStep(stepIndex); break;
    }
  }

  // Mostra o estado da iteração atual (this.iterationIndex) do passo 3,
  // despachando para o algoritmo em execução.
  private applyIterationView() {
    switch (this.traceAlgorithm) {
      case 'bfs': this.applyBfsIterationView(); break;
      case 'dfs': this.applyDfsIterationView(); break;
      case 'dijkstra': this.applyDijkstraIterationView(); break;
      case 'coloring': this.applyColoringIterationView(); break;
      case 'tsp': this.applyTspIterationView(); break;
    }
  }

  // ---------- BFS: passo a passo ----------

  private applyBfsMacroStep(stepIndex: number) {
    const trace = this.currentTrace as BfsMacroTrace;

    if (stepIndex <= 1) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.FILA'), endereco: TRACE_VAR_ADDRESS['fila'], conteudo: this.labelsOf(trace.initialQueue) },
        { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(trace.initialVisited) }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      trace.initialVisited.forEach(id => this.cy.$id(id).addClass('visited'));
      return;
    }

    if (stepIndex === 2) {
      this.applyBfsIterationView();
      return;
    }

    const lastIteration = trace.iterations[trace.iterations.length - 1];
    const allVisited = lastIteration ? lastIteration.visitedAfter : trace.initialVisited;

    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.DONE') },
      { nome: this.t('VAR.FILA'), endereco: TRACE_VAR_ADDRESS['fila'], conteudo: this.t('VAL.EMPTY_F') },
      { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(allVisited) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    allVisited.forEach(id => this.cy.$id(id).addClass('visited'));

    this.algorithmResult.set(trace.finalOrder.map(step => ({
      nodeId: step.nodeId,
      label: this.labelOf(step.nodeId),
      distance: step.distance
    })));
    this.currentStepIndex.set(0);
    if (trace.finalOrder.length) {
      this.highlightPath(trace.finalOrder[0].nodeId);
    }
    this.statusMessage.set(this.t('MSG.BFS_DONE'));
  }

  private applyBfsIterationView() {
    const trace = this.currentTrace as BfsMacroTrace;
    const idx = this.iterationIndex();

    if (idx < 0 || !trace.iterations.length) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.FILA'), endereco: TRACE_VAR_ADDRESS['fila'], conteudo: this.labelsOf(trace.initialQueue) },
        { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(trace.initialVisited) }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      trace.initialVisited.forEach(id => this.cy.$id(id).addClass('visited'));
      return;
    }

    const iteration = trace.iterations[idx];
    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.labelOf(iteration.currentId) },
      { nome: this.t('VAR.FILA'), endereco: TRACE_VAR_ADDRESS['fila'], conteudo: this.labelsOf(iteration.queueAfter) },
      { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(iteration.visitedAfter) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    iteration.visitedAfter.forEach(id => this.cy.$id(id).addClass('visited'));
    this.cy.$id(iteration.currentId).removeClass('visited').addClass('visiting');
  }

  // ---------- DFS: passo a passo ----------

  private applyDfsMacroStep(stepIndex: number) {
    const trace = this.currentTrace as DfsMacroTrace;

    if (stepIndex <= 1) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.PILHA'), endereco: TRACE_VAR_ADDRESS['pilha'], conteudo: this.labelsOf(trace.initialStack) },
        { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.t('VAL.EMPTY_M') }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      return;
    }

    if (stepIndex === 2) {
      this.applyDfsIterationView();
      return;
    }

    const lastIteration = trace.iterations[trace.iterations.length - 1];
    const allVisited = lastIteration ? lastIteration.visitedAfter : [];

    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.DONE') },
      { nome: this.t('VAR.PILHA'), endereco: TRACE_VAR_ADDRESS['pilha'], conteudo: this.t('VAL.EMPTY_F') },
      { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(allVisited) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    allVisited.forEach(id => this.cy.$id(id).addClass('visited'));

    this.algorithmResult.set(trace.finalOrder.map(step => ({ nodeId: step.nodeId, label: this.labelOf(step.nodeId) })));
    this.currentStepIndex.set(0);
    if (trace.finalOrder.length) {
      this.highlightPath(trace.finalOrder[0].nodeId);
    }
    this.statusMessage.set(this.t('MSG.DFS_DONE'));
  }

  private applyDfsIterationView() {
    const trace = this.currentTrace as DfsMacroTrace;
    const idx = this.iterationIndex();

    if (idx < 0 || !trace.iterations.length) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.PILHA'), endereco: TRACE_VAR_ADDRESS['pilha'], conteudo: this.labelsOf(trace.initialStack) },
        { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.t('VAL.EMPTY_M') }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      return;
    }

    const it = trace.iterations[idx];
    this.traceMemoryRows.set([
      {
        nome: this.t('VAR.ATUAL'),
        endereco: TRACE_VAR_ADDRESS['atual'],
        conteudo: this.labelOf(it.currentId) + (it.wasAlreadyVisited ? this.t('MSG.ALREADY_VISITED_IGNORED') : '')
      },
      { nome: this.t('VAR.PILHA'), endereco: TRACE_VAR_ADDRESS['pilha'], conteudo: this.labelsOf(it.stackAfter) },
      { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(it.visitedAfter) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    it.visitedAfter.forEach(id => this.cy.$id(id).addClass('visited'));
    if (!it.wasAlreadyVisited) {
      this.cy.$id(it.currentId).removeClass('visited').addClass('visiting');
    }
  }

  // ---------- Dijkstra: passo a passo ----------

  private applyDijkstraMacroStep(stepIndex: number) {
    const trace = this.currentTrace as DijkstraMacroTrace;

    if (stepIndex <= 1) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.DIST'), endereco: TRACE_VAR_ADDRESS['distancias'], conteudo: this.formatDistances(trace.initialDistances) },
        { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.t('VAL.EMPTY_M') }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      return;
    }

    if (stepIndex === 2) {
      this.applyDijkstraIterationView();
      return;
    }

    const lastIteration = trace.iterations[trace.iterations.length - 1];
    const finalDistances = lastIteration ? lastIteration.distancesAfter : trace.initialDistances;
    const allVisited = lastIteration ? lastIteration.visitedAfter : [];

    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.DONE') },
      { nome: this.t('VAR.DIST'), endereco: TRACE_VAR_ADDRESS['distancias'], conteudo: this.formatDistances(finalDistances) },
      { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(allVisited) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    allVisited.forEach(id => this.cy.$id(id).addClass('visited'));

    this.algorithmResult.set(trace.finalOrder.map(step => ({
      nodeId: step.nodeId,
      label: this.labelOf(step.nodeId),
      distance: step.distance
    })));
    this.currentStepIndex.set(0);
    if (trace.finalOrder.length) {
      this.highlightPath(trace.finalOrder[0].nodeId);
    }
    this.statusMessage.set(this.t('MSG.DIJKSTRA_DONE'));
  }

  private applyDijkstraIterationView() {
    const trace = this.currentTrace as DijkstraMacroTrace;
    const idx = this.iterationIndex();

    if (idx < 0 || !trace.iterations.length) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.DIST'), endereco: TRACE_VAR_ADDRESS['distancias'], conteudo: this.formatDistances(trace.initialDistances) },
        { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.t('VAL.EMPTY_M') }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      return;
    }

    const it = trace.iterations[idx];
    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.labelOf(it.currentId) },
      { nome: this.t('VAR.DIST'), endereco: TRACE_VAR_ADDRESS['distancias'], conteudo: this.formatDistances(it.distancesAfter) },
      { nome: this.t('VAR.VISITADOS'), endereco: TRACE_VAR_ADDRESS['visitados'], conteudo: this.labelsOf(it.visitedAfter) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    it.visitedAfter.forEach(id => this.cy.$id(id).addClass('visited'));
    this.cy.$id(it.currentId).removeClass('visited').addClass('visiting');
  }

  // ---------- Coloração: passo a passo ----------

  private applyColoringMacroStep(stepIndex: number) {
    const trace = this.currentTrace as ColoringMacroTrace;

    if (stepIndex <= 1) {
      this.resetNodeColors();
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.CORES_VIZINHOS'), endereco: TRACE_VAR_ADDRESS['coresVizinhos'], conteudo: this.t('VAL.NONE_F') },
        { nome: this.t('VAR.COR_ATRIBUIDA'), endereco: TRACE_VAR_ADDRESS['corAtribuida'], conteudo: this.t('VAL.NONE_F') }
      ]);
      return;
    }

    if (stepIndex === 2) {
      this.applyColoringIterationView();
      return;
    }

    const groupMap = new Map<string, { labels: string[]; nodeIds: string[] }>();
    trace.iterations.forEach(it => {
      if (!groupMap.has(it.assignedColor)) {
        groupMap.set(it.assignedColor, { labels: [], nodeIds: [] });
      }
      groupMap.get(it.assignedColor)!.labels.push(this.labelOf(it.currentId));
      groupMap.get(it.assignedColor)!.nodeIds.push(it.currentId);
    });
    const groups = Array.from(groupMap.entries()).map(([color, { labels, nodeIds }]) => ({ color, labels, nodeIds }));
    this.coloringGroups.set(groups);

    this.cy.nodes().removeClass('consultando em-foco');
    trace.iterations.forEach(it => this.cy.$id(it.currentId).style('background-color', it.assignedColor));

    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.DONE') },
      { nome: this.t('VAR.CORES_VIZINHOS'), endereco: TRACE_VAR_ADDRESS['coresVizinhos'], conteudo: '-' },
      { nome: this.t('VAR.COR_ATRIBUIDA'), endereco: TRACE_VAR_ADDRESS['corAtribuida'], conteudo: this.t('MSG.COLORS_USED', { count: groups.length }) }
    ]);
    this.statusMessage.set(this.t('MSG.COLORING_DONE', { count: groups.length }));
  }

  private applyColoringIterationView() {
    const trace = this.currentTrace as ColoringMacroTrace;
    const idx = this.iterationIndex();

    this.resetNodeColors();

    if (idx < 0 || !trace.iterations.length) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('VAL.NONE') },
        { nome: this.t('VAR.CORES_VIZINHOS'), endereco: TRACE_VAR_ADDRESS['coresVizinhos'], conteudo: this.t('VAL.NONE_F') },
        { nome: this.t('VAR.COR_ATRIBUIDA'), endereco: TRACE_VAR_ADDRESS['corAtribuida'], conteudo: this.t('VAL.NONE_F') }
      ]);
      return;
    }

    // Pinta todos os nós já coloridos em iterações anteriores (ou nesta).
    for (let i = 0; i <= idx; i++) {
      const done = trace.iterations[i];
      this.cy.$id(done.currentId).style('background-color', done.assignedColor);
    }

    const it = trace.iterations[idx];

    // Destaca o nó em processamento e os vizinhos já coloridos que foram
    // consultados pra decidir a cor dele — assim dá pra ver de onde vem
    // cada cor da lista "coresVizinhos", em vez de só ler o texto.
    this.cy.$id(it.currentId).addClass('em-foco');
    it.coloredNeighborIds.forEach(id => this.cy.$id(id).addClass('consultando'));

    this.traceMemoryRows.set([
      { nome: this.t('VAR.ATUAL'), endereco: TRACE_VAR_ADDRESS['atual'], conteudo: this.t('MSG.DEGREE_LABEL', { label: this.labelOf(it.currentId), degree: it.degree }) },
      {
        nome: this.t('VAR.CORES_VIZINHOS'),
        endereco: TRACE_VAR_ADDRESS['coresVizinhos'],
        conteudo: it.usedColors.length ? this.labelsOf(it.coloredNeighborIds) : this.t('VAL.NONE_F'),
        swatches: it.usedColors
      },
      { nome: this.t('VAR.COR_ATRIBUIDA'), endereco: TRACE_VAR_ADDRESS['corAtribuida'], conteudo: it.assignedColor, swatches: [it.assignedColor] }
    ]);
  }

  // ---------- TSP: passo a passo (heurística do vizinho mais próximo) ----------

  private applyTspMacroStep(stepIndex: number) {
    const trace = this.currentTrace as TspMacroTrace;

    if (stepIndex <= 1) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.CANDIDATOS'), endereco: TRACE_VAR_ADDRESS['candidatos'], conteudo: this.t('VAL.NONE_YET') },
        { nome: this.t('VAR.ATUAL_PROXIMO'), endereco: TRACE_VAR_ADDRESS['proximo'], conteudo: this.t('MSG.STARTED_AT', { label: this.labelOf(trace.originId) }) },
        { nome: this.t('VAR.CUSTO_ACUMULADO'), endereco: TRACE_VAR_ADDRESS['custoAcumulado'], conteudo: '0' },
        { nome: this.t('VAR.ROTA'), endereco: TRACE_VAR_ADDRESS['rota'], conteudo: this.labelsOf([trace.originId]) }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      this.cy.$id(trace.originId).addClass('visited');
      this.highlightRouteEdges([trace.originId]);
      return;
    }

    if (stepIndex === 2) {
      this.applyTspIterationView();
      return;
    }

    this.traceMemoryRows.set([
      { nome: this.t('VAR.CANDIDATOS'), endereco: TRACE_VAR_ADDRESS['candidatos'], conteudo: this.t('VAL.DONE') },
      { nome: this.t('VAR.ATUAL_PROXIMO'), endereco: TRACE_VAR_ADDRESS['proximo'], conteudo: this.t('MSG.RETURNED_TO_ORIGIN') },
      { nome: this.t('VAR.CUSTO_ACUMULADO'), endereco: TRACE_VAR_ADDRESS['custoAcumulado'], conteudo: String(trace.finalCost) },
      { nome: this.t('VAR.ROTA'), endereco: TRACE_VAR_ADDRESS['rota'], conteudo: this.labelsOf(trace.finalRoute) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    trace.finalRoute.forEach(id => this.cy.$id(id).addClass('visited'));
    // Desenha o ciclo completo (todas as arestas percorridas, incluindo a volta à origem).
    this.highlightRouteEdges(trace.finalRoute);

    this.algorithmResult.set(trace.finalRoute.map(nodeId => ({ nodeId, label: this.labelOf(nodeId) })));
    this.currentStepIndex.set(0);
    const metodo = this.t(this.tspIsHeuristic ? 'TSP_METHOD.HEURISTIC' : 'TSP_METHOD.EXACT');
    this.statusMessage.set(this.t('MSG.TSP_DONE', { method: metodo, cost: trace.finalCost }));
  }

  private applyTspIterationView() {
    const trace = this.currentTrace as TspMacroTrace;
    const idx = this.iterationIndex();

    if (idx < 0 || !trace.iterations.length) {
      this.traceMemoryRows.set([
        { nome: this.t('VAR.CANDIDATOS'), endereco: TRACE_VAR_ADDRESS['candidatos'], conteudo: this.t('VAL.NONE_YET') },
        { nome: this.t('VAR.ATUAL_PROXIMO'), endereco: TRACE_VAR_ADDRESS['proximo'], conteudo: this.t('MSG.STARTED_AT', { label: this.labelOf(trace.originId) }) },
        { nome: this.t('VAR.CUSTO_ACUMULADO'), endereco: TRACE_VAR_ADDRESS['custoAcumulado'], conteudo: '0' },
        { nome: this.t('VAR.ROTA'), endereco: TRACE_VAR_ADDRESS['rota'], conteudo: this.labelsOf([trace.originId]) }
      ]);
      this.cy.nodes().removeClass('visiting visited');
      this.cy.$id(trace.originId).addClass('visited');
      this.highlightRouteEdges([trace.originId]);
      return;
    }

    const it = trace.iterations[idx];
    this.traceMemoryRows.set([
      {
        nome: this.t('VAR.CANDIDATOS'),
        endereco: TRACE_VAR_ADDRESS['candidatos'],
        conteudo: this.formatCandidates(it.candidates, it.toId)
      },
      {
        nome: this.t('VAR.ATUAL_PROXIMO'),
        endereco: TRACE_VAR_ADDRESS['proximo'],
        conteudo: this.t('MSG.EDGE_COST_LABEL', { from: this.labelOf(it.fromId), to: this.labelOf(it.toId), cost: it.edgeCost })
      },
      { nome: this.t('VAR.CUSTO_ACUMULADO'), endereco: TRACE_VAR_ADDRESS['custoAcumulado'], conteudo: String(it.totalCostAfter) },
      { nome: this.t('VAR.ROTA'), endereco: TRACE_VAR_ADDRESS['rota'], conteudo: this.labelsOf(it.routeAfter) }
    ]);

    this.cy.nodes().removeClass('visiting visited');
    it.visitedAfter.forEach(id => this.cy.$id(id).addClass('visited'));
    this.cy.$id(it.toId).removeClass('visited').addClass('visiting');
    // Mostra o trajeto formado até aqui (arestas diretas, quando existirem no grafo).
    this.highlightRouteEdges(it.routeAfter);
  }

  // ---------- Navegação manual do macro-trace (uma iteração/passo por clique, sem auto-play) ----------

  nextIteration() {
    if (!this.currentTrace) return;
    const total = this.macroIterationsCount;
    const next = Math.min(this.iterationIndex() + 1, total - 1);
    this.iterationIndex.set(next);
    this.applyIterationView();
  }

  prevIteration() {
    const prev = Math.max(this.iterationIndex() - 1, -1);
    this.iterationIndex.set(prev);
    this.applyIterationView();
  }

  nextMacroStep() {
    const next = Math.min(this.macroStepIndex() + 1, this.activeMacroSteps.length - 1);
    this.applyMacroStep(next);
  }

  prevMacroStep() {
    const prev = Math.max(this.macroStepIndex() - 1, 0);
    this.applyMacroStep(prev);
  }

  get canAdvanceMacroStep(): boolean {
    if (!this.currentTrace) return false;
    if (this.macroStepIndex() === 2) {
      // só libera o "próximo" quando todas as iterações já foram mostradas
      return this.iterationIndex() >= this.macroIterationsCount - 1;
    }
    return this.macroStepIndex() < this.activeMacroSteps.length - 1;
  }

  get macroIterationsCount(): number {
    return this.currentTrace?.iterations.length ?? 0;
  }

  private runTsp(originId: string) {
    const data = this.graphService.graph();
    const trace = this.algorithmsService.tspExactMacroTrace(data, originId);

    this.mode = 'idle';
    this.pendingAlgorithm = null;
    this.coloringGroups.set(null);
    this.resetTraceState();

    if (!trace) {
      this.statusMessage.set(this.t('MSG.NO_ROUTE_NEEDS_CONNECTED'));
      return;
    }

    this.lastGraphData = data;
    this.pathPredecessors = trace.predecessors;
    this.tspIsHeuristic = false;
    // Mesma animação com memória sincronizada que BFS/DFS/Dijkstra/Coloração
    // usam no "rodar tudo" — só que aqui a rota já vem pronta do algoritmo
    // exato (Held-Karp); a tabela só reproduz o resultado passo a passo.
    this.animateMacroTraceFull('tsp', trace);
  }

  private runColoring(data: GraphData) {
    this.lastGraphData = data;
    this.pathPredecessors = new Map();
    this.algorithmResult.set(null);
    this.coloringGroups.set(null);
    this.resetTraceState();
    this.cy.elements().removeClass('visiting visited scanning max-degree consultando em-foco path-highlight');
    this.resetNodeColors();

    const degrees = this.algorithmsService.getNodeDegrees(data);
    const scanDelay = 200;

    this.statusMessage.set(this.t('MSG.SEARCHING_MAX_DEGREE'));

    degrees.forEach((d, index) => {
      this.scheduleTimeout(() => {
        this.ngZone.run(() => {
          this.cy.nodes().removeClass('scanning');
          this.cy.$id(d.nodeId).addClass('scanning');
        });
      }, index * scanDelay);
    });

    const scanTotalTime = degrees.length * scanDelay;
    const maxDegreeNode = degrees[0];

    this.scheduleTimeout(() => {
      this.ngZone.run(() => {
        this.cy.nodes().removeClass('scanning');
        this.cy.$id(maxDegreeNode.nodeId).addClass('max-degree');
        const label = data.nodes.find(n => n.id === maxDegreeNode.nodeId)?.label ?? '?';
        this.statusMessage.set(this.t('MSG.MAX_DEGREE_NODE', { label, degree: maxDegreeNode.degree }));
      });

      this.scheduleTimeout(() => {
        this.ngZone.run(() => {
          this.cy.$id(maxDegreeNode.nodeId).removeClass('max-degree');
          const trace = this.algorithmsService.coloringMacroTrace(data);
          this.animateMacroTraceFull('coloring', trace);
        });
      }, 1000);
    }, scanTotalTime);
  }

  // ---------- Navegação do histórico final (setas, por nó) ----------

  goToStep(index: number) {
    const results = this.algorithmResult();
    if (!results || index < 0 || index >= results.length) return;
    this.currentStepIndex.set(index);
    this.highlightPath(results[index].nodeId);
  }

  nextStep() {
    const results = this.algorithmResult();
    if (!results) return;
    this.goToStep(Math.min(this.currentStepIndex() + 1, results.length - 1));
  }

  prevStep() {
    this.goToStep(Math.max(this.currentStepIndex() - 1, 0));
  }

  // Destaca, no grafo, a sequência de nós de 'routeIds' e as arestas diretas
  // entre nós consecutivos (quando existirem) — usado pelo TSP passo a passo
  // pra mostrar o trajeto se formando, e o ciclo fechado no resultado final.
  private highlightRouteEdges(routeIds: string[]) {
    if (!this.lastGraphData) return;

    this.cy.elements().removeClass('path-highlight');

    routeIds.forEach(id => this.cy.$id(id).addClass('path-highlight'));

    for (let i = 0; i < routeIds.length - 1; i++) {
      const a = routeIds[i];
      const b = routeIds[i + 1];
      const edge = this.lastGraphData.edges.find(e =>
        (e.source === a && e.target === b) ||
        (!this.lastGraphData!.directed && e.source === b && e.target === a)
      );
      if (edge) {
        this.cy.$id(edge.id).addClass('path-highlight');
      }
    }
  }

  // Formata a comparação de candidatos do TSP passo a passo: cada nó ainda
  // não visitado com sua distância até o nó atual, destacando o escolhido —
  // é o que explica por que ele é o "mais próximo".
  private formatCandidates(candidates: { nodeId: string; distance: number }[], chosenId: string): string {
    if (!candidates.length) {
      // Algoritmo exato (Held-Karp): a rota inteira é calculada de uma vez,
      // não nó a nó — não existe uma comparação de "candidatos" pra mostrar aqui.
      return this.t('MSG.NO_ROUTE_YET');
    }
    return candidates
      .map(c => {
        const text = `${this.labelOf(c.nodeId)}:${c.distance}`;
        return c.nodeId === chosenId ? `[${text}]` : text;
      })
      .join('  ');
  }

  highlightPath(targetId: string) {
    if (!this.lastGraphData) return;

    this.cy.elements().removeClass('path-highlight');

    const nodeIds: string[] = [];
    const edgeIds: string[] = [];
    let current: string | null = targetId;

    while (current !== null) {
      nodeIds.push(current);
      const prev: string | null = this.pathPredecessors.get(current) ?? null;

      if (prev !== null) {
        const edge = this.lastGraphData.edges.find(e =>
          (e.source === prev && e.target === current) ||
          (!this.lastGraphData!.directed && e.source === current && e.target === prev)
        );
        if (edge) edgeIds.push(edge.id);
      }

      current = prev;
    }

    nodeIds.forEach(id => this.cy.$id(id).addClass('path-highlight'));
    edgeIds.forEach(id => this.cy.$id(id).addClass('path-highlight'));
  }

  highlightColorGroup(nodeIds: string[]) {
    this.cy.elements().removeClass('path-highlight');
    nodeIds.forEach(id => this.cy.$id(id).addClass('path-highlight'));
  }

  clearHighlight() {
    this.cy.elements().removeClass('path-highlight');
  }

  private renderGraph(data: GraphData) {
    this.cy.elements().remove();
    data.nodes.forEach(n => this.cy.add({ data: { id: n.id, label: n.label } }));
    data.edges.forEach(e => this.cy.add({ data: { id: e.id, source: e.source, target: e.target, weight: e.weight } }));
    this.cy.layout({ name: 'cose' }).run();
  }

  // ---------- Painel de memória (tabela fictícia) ----------

  private updateMemoryRows(data: GraphData) {
    const rows: MemoryRow[] = [];

    data.nodes.forEach((n, i) => {
      rows.push({
        nome: this.t('MEMVAR.NODE_LABEL', { i }),
        endereco: this.toHexAddress(0x1000 + i * 4),
        conteudo: `"${n.label}"`
      });
    });

    data.edges.forEach((e, i) => {
      const originLabel = data.nodes.find(n => n.id === e.source)?.label ?? '?';
      const targetLabel = data.nodes.find(n => n.id === e.target)?.label ?? '?';
      rows.push({
        nome: this.t('MEMVAR.EDGE', { i }),
        endereco: this.toHexAddress(0x2000 + i * 8),
        conteudo: this.t('MEMCONTENT.EDGE', { source: originLabel, target: targetLabel, weight: e.weight })
      });
    });

    this.memoryRows.set(rows);
  }

  private toHexAddress(n: number): string {
    return '0x' + n.toString(16).toUpperCase().padStart(6, '0');
  }
}
