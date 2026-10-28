import { Injectable } from '@angular/core';
import { GraphData } from '../models/graph.models';

export interface AlgorithmStep {
  nodeId: string;
  distance?: number;
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  predecessors: Map<string, string | null>;
}

export interface ColoringStep {
  nodeId: string;
  degree: number;
  color: string;
}

export interface TspResult {
  route: string[];
  totalCost: number;
  exact: boolean;
}

// Uma "iteração" da fase que repete no BFS: um nó saindo da fila
// e seus vizinhos ainda não visitados sendo descobertos.
export interface BfsIteration {
  currentId: string;
  queueBefore: string[];
  visitedBefore: string[];
  newlyVisitedIds: string[];
  queueAfter: string[];
  visitedAfter: string[];
}

export interface BfsMacroTrace {
  initialQueue: string[];
  initialVisited: string[];
  iterations: BfsIteration[];
  finalOrder: AlgorithmStep[];
  predecessors: Map<string, string | null>;
}

// Uma "iteração" da fase que repete no DFS (iterativo, com pilha explícita):
// desempilha um nó; se ainda não visitado, marca e empilha os vizinhos.
export interface DfsIteration {
  currentId: string;
  stackBefore: string[];
  visitedBefore: string[];
  wasAlreadyVisited: boolean;
  pushedIds: string[];
  stackAfter: string[];
  visitedAfter: string[];
}

export interface DfsMacroTrace {
  initialStack: string[];
  iterations: DfsIteration[];
  finalOrder: AlgorithmStep[];
  predecessors: Map<string, string | null>;
}

// Uma "iteração" da fase que repete no Dijkstra: escolhe o nó não visitado
// de menor distância e relaxa a distância dos seus vizinhos.
export interface DijkstraIteration {
  currentId: string;
  distancesBefore: Map<string, number>;
  visitedBefore: string[];
  distancesAfter: Map<string, number>;
  visitedAfter: string[];
}

export interface DijkstraMacroTrace {
  initialDistances: Map<string, number>;
  iterations: DijkstraIteration[];
  finalOrder: AlgorithmStep[];
  predecessors: Map<string, string | null>;
}

// Uma "iteração" da fase que repete na Coloração: pega o próximo nó (por grau
// decrescente) e atribui a ele a menor cor ainda não usada pelos vizinhos.
export interface ColoringIteration {
  currentId: string;
  degree: number;
  usedColors: string[];
  assignedColor: string;
  // IDs dos vizinhos já coloridos consultados para decidir a cor
  // (permite destacar no grafo quem "vetou" cada cor usada).
  coloredNeighborIds: string[];
}

export interface ColoringMacroTrace {
  orderedIds: string[];
  iterations: ColoringIteration[];
}

// Uma "iteração" da fase que repete no TSP (versão didática, vizinho mais
// próximo): a partir do nó atual, move para o nó não visitado mais próximo.
export interface TspIteration {
  fromId: string;
  toId: string;
  edgeCost: number;
  totalCostAfter: number;
  routeAfter: string[];
  visitedAfter: string[];
  // Todos os candidatos (ainda não visitados) considerados nesta iteração,
  // com a distância de cada um até o nó atual, ordenados do mais perto pro
  // mais longe — mostra por que o escolhido é o "mais próximo".
  candidates: { nodeId: string; distance: number }[];
}

export interface TspMacroTrace {
  originId: string;
  iterations: TspIteration[];
  finalRoute: string[];
  finalCost: number;
  predecessors: Map<string, string | null>;
}

type AdjacencyList = Map<string, { neighbor: string; weight: number }[]>;

@Injectable({ providedIn: 'root' })
export class AlgorithmsService {

  buildAdjacencyList(data: GraphData): AdjacencyList {
    const adj: AdjacencyList = new Map();
    data.nodes.forEach(n => adj.set(n.id, []));

    data.edges.forEach(e => {
      adj.get(e.source)?.push({ neighbor: e.target, weight: e.weight });
      if (!data.directed) {
        adj.get(e.target)?.push({ neighbor: e.source, weight: e.weight });
      }
    });

    return adj;
  }

  bfs(data: GraphData, originId: string): AlgorithmResult {
    const adj = this.buildAdjacencyList(data);
    const visited = new Set<string>([originId]);
    const order: AlgorithmStep[] = [];
    const predecessors = new Map<string, string | null>();
    predecessors.set(originId, null);
    const queue: string[] = [originId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push({ nodeId: current });

      for (const { neighbor } of adj.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          predecessors.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    return { steps: order, predecessors };
  }

  // Versão do BFS que agrupa a execução em "macro-passos" didáticos:
  // 1) inicializar fila/visitados, 2) verificar fila, 3) fase que repete
  // (desenfileirar + visitar vizinhos), 4) finalização.
  // Cada item de "iterations" é uma repetição completa da fase 3.
  bfsMacroTrace(data: GraphData, originId: string): BfsMacroTrace {
    const adj = this.buildAdjacencyList(data);
    const visitedSet = new Set<string>([originId]);
    const visitedOrder: string[] = [originId];
    const queue: string[] = [originId];
    const predecessors = new Map<string, string | null>();
    predecessors.set(originId, null);

    const initialQueue = [...queue];
    const initialVisited = [...visitedOrder];

    const iterations: BfsIteration[] = [];
    const finalOrder: AlgorithmStep[] = [];

    while (queue.length > 0) {
      const queueBefore = [...queue];
      const visitedBefore = [...visitedOrder];
      const current = queue.shift()!;
      finalOrder.push({ nodeId: current });

      const newlyVisitedIds: string[] = [];
      for (const { neighbor } of adj.get(current) ?? []) {
        if (!visitedSet.has(neighbor)) {
          visitedSet.add(neighbor);
          visitedOrder.push(neighbor);
          predecessors.set(neighbor, current);
          queue.push(neighbor);
          newlyVisitedIds.push(neighbor);
        }
      }

      iterations.push({
        currentId: current,
        queueBefore,
        visitedBefore,
        newlyVisitedIds,
        queueAfter: [...queue],
        visitedAfter: [...visitedOrder]
      });
    }

    return { initialQueue, initialVisited, iterations, finalOrder, predecessors };
  }

  dfs(data: GraphData, originId: string): AlgorithmResult {
    const adj = this.buildAdjacencyList(data);
    const visited = new Set<string>();
    const order: AlgorithmStep[] = [];
    const predecessors = new Map<string, string | null>();
    predecessors.set(originId, null);

    const visit = (nodeId: string) => {
      visited.add(nodeId);
      order.push({ nodeId });

      for (const { neighbor } of adj.get(nodeId) ?? []) {
        if (!visited.has(neighbor)) {
          predecessors.set(neighbor, nodeId);
          visit(neighbor);
        }
      }
    };

    visit(originId);
    return { steps: order, predecessors };
  }

  // Versão iterativa do DFS (pilha explícita) agrupada em macro-passos didáticos:
  // 1) empilhar a origem, 2) verificar a pilha, 3) fase que repete
  // (desempilhar + marcar visitado + empilhar vizinhos), 4) finalização.
  dfsMacroTrace(data: GraphData, originId: string): DfsMacroTrace {
    const adj = this.buildAdjacencyList(data);
    const visited = new Set<string>();
    const predecessors = new Map<string, string | null>();
    const order: AlgorithmStep[] = [];
    const stack: string[] = [originId];
    predecessors.set(originId, null);

    const initialStack = [...stack];
    const iterations: DfsIteration[] = [];

    while (stack.length > 0) {
      const stackBefore = [...stack];
      const visitedBefore = Array.from(visited);
      const current = stack.pop()!;
      const wasAlreadyVisited = visited.has(current);
      const pushedIds: string[] = [];

      if (!wasAlreadyVisited) {
        visited.add(current);
        order.push({ nodeId: current });

        const neighbors = adj.get(current) ?? [];
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const { neighbor } = neighbors[i];
          if (!visited.has(neighbor)) {
            if (!predecessors.has(neighbor)) {
              predecessors.set(neighbor, current);
            }
            stack.push(neighbor);
            pushedIds.push(neighbor);
          }
        }
      }

      iterations.push({
        currentId: current,
        stackBefore,
        visitedBefore,
        wasAlreadyVisited,
        pushedIds,
        stackAfter: [...stack],
        visitedAfter: Array.from(visited)
      });
    }

    return { initialStack, iterations, finalOrder: order, predecessors };
  }

  dijkstra(data: GraphData, originId: string): AlgorithmResult {
    const adj = this.buildAdjacencyList(data);
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string | null>();
    const visited = new Set<string>();
    const order: AlgorithmStep[] = [];

    data.nodes.forEach(n => distances.set(n.id, Infinity));
    distances.set(originId, 0);
    predecessors.set(originId, null);

    while (visited.size < data.nodes.length) {
      let currentId: string | null = null;
      let currentDistance = Infinity;

      for (const [nodeId, dist] of distances.entries()) {
        if (!visited.has(nodeId) && dist < currentDistance) {
          currentId = nodeId;
          currentDistance = dist;
        }
      }

      if (currentId === null) break;

      visited.add(currentId);
      order.push({ nodeId: currentId, distance: currentDistance });

      for (const { neighbor, weight } of adj.get(currentId) ?? []) {
        if (visited.has(neighbor)) continue;
        const newDistance = currentDistance + weight;
        if (newDistance < (distances.get(neighbor) ?? Infinity)) {
          distances.set(neighbor, newDistance);
          predecessors.set(neighbor, currentId);
        }
      }
    }

    return { steps: order, predecessors };
  }

  // Dijkstra agrupado em macro-passos didáticos: 1) inicializar distâncias,
  // 2) verificar se ainda há nó não visitado, 3) fase que repete (escolher o
  // nó não visitado de menor distância e relaxar seus vizinhos), 4) finalização.
  dijkstraMacroTrace(data: GraphData, originId: string): DijkstraMacroTrace {
    const adj = this.buildAdjacencyList(data);
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string | null>();
    const visited = new Set<string>();
    const order: AlgorithmStep[] = [];

    data.nodes.forEach(n => distances.set(n.id, Infinity));
    distances.set(originId, 0);
    predecessors.set(originId, null);

    const initialDistances = new Map(distances);
    const iterations: DijkstraIteration[] = [];

    while (visited.size < data.nodes.length) {
      let currentId: string | null = null;
      let currentDistance = Infinity;

      for (const [nodeId, dist] of distances.entries()) {
        if (!visited.has(nodeId) && dist < currentDistance) {
          currentId = nodeId;
          currentDistance = dist;
        }
      }

      if (currentId === null) break;

      const distancesBefore = new Map(distances);
      const visitedBefore = Array.from(visited);

      visited.add(currentId);
      order.push({ nodeId: currentId, distance: currentDistance });

      for (const { neighbor, weight } of adj.get(currentId) ?? []) {
        if (visited.has(neighbor)) continue;
        const newDistance = currentDistance + weight;
        if (newDistance < (distances.get(neighbor) ?? Infinity)) {
          distances.set(neighbor, newDistance);
          predecessors.set(neighbor, currentId);
        }
      }

      iterations.push({
        currentId,
        distancesBefore,
        visitedBefore,
        distancesAfter: new Map(distances),
        visitedAfter: Array.from(visited)
      });
    }

    return { initialDistances, iterations, finalOrder: order, predecessors };
  }

  getNodeDegrees(data: GraphData): { nodeId: string; degree: number }[] {
    const adj = this.buildAdjacencyList(data);
    return data.nodes
      .map(n => ({ nodeId: n.id, degree: (adj.get(n.id) ?? []).length }))
      .sort((a, b) => b.degree - a.degree);
  }

  welshPowellColoring(data: GraphData): ColoringStep[] {
    const adj = this.buildAdjacencyList(data);
    const ordered = this.getNodeDegrees(data);
    const colorOf = new Map<string, number>();
    const steps: ColoringStep[] = [];

    for (const { nodeId, degree } of ordered) {
      const neighborColors = new Set(
        (adj.get(nodeId) ?? [])
          .map(n => colorOf.get(n.neighbor))
          .filter((c): c is number => c !== undefined)
      );

      let colorIndex = 0;
      while (neighborColors.has(colorIndex)) {
        colorIndex++;
      }

      colorOf.set(nodeId, colorIndex);
      steps.push({ nodeId, degree, color: this.colorForIndex(colorIndex) });
    }

    return steps;
  }

  // Coloração agrupada em macro-passos didáticos: 1) ordenar por grau decrescente,
  // 2) verificar se ainda há nó sem cor, 3) fase que repete (olhar as cores dos
  // vizinhos já coloridos e atribuir a menor cor livre), 4) finalização.
  coloringMacroTrace(data: GraphData): ColoringMacroTrace {
    const adj = this.buildAdjacencyList(data);
    const ordered = this.getNodeDegrees(data);
    const colorOf = new Map<string, number>();
    const iterations: ColoringIteration[] = [];

    for (const { nodeId, degree } of ordered) {
      const coloredNeighbors = (adj.get(nodeId) ?? []).filter(n => colorOf.has(n.neighbor));
      const neighborColorIndexes = new Set(
        coloredNeighbors.map(n => colorOf.get(n.neighbor)!)
      );

      let colorIndex = 0;
      while (neighborColorIndexes.has(colorIndex)) {
        colorIndex++;
      }

      colorOf.set(nodeId, colorIndex);

      iterations.push({
        currentId: nodeId,
        degree,
        usedColors: Array.from(neighborColorIndexes).map(c => this.colorForIndex(c)),
        assignedColor: this.colorForIndex(colorIndex),
        coloredNeighborIds: coloredNeighbors.map(n => n.neighbor)
      });
    }

    return { orderedIds: ordered.map(o => o.nodeId), iterations };
  }

  private colorForIndex(index: number): string {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue.toFixed(0)}, 65%, 55%)`;
  }

  buildDistanceMatrix(data: GraphData): Map<string, Map<string, number>> {
    const matrix = new Map<string, Map<string, number>>();

    data.nodes.forEach(originNode => {
      const result = this.dijkstra(data, originNode.id);
      const distances = new Map<string, number>();
      result.steps.forEach(step => {
        distances.set(step.nodeId, step.distance ?? 0);
      });
      matrix.set(originNode.id, distances);
    });

    return matrix;
  }

  private isMatrixComplete(matrix: Map<string, Map<string, number>>, nodeIds: string[]): boolean {
    for (const a of nodeIds) {
      for (const b of nodeIds) {
        if (a !== b && !matrix.get(a)?.has(b)) {
          return false;
        }
      }
    }
    return true;
  }

  tspExact(data: GraphData, originId: string): TspResult | null {
    const matrix = this.buildDistanceMatrix(data);
    const ids = [originId, ...data.nodes.map(n => n.id).filter(id => id !== originId)];
    const n = ids.length;

    if (!this.isMatrixComplete(matrix, ids)) return null;
    if (n === 1) return { route: [originId, originId], totalCost: 0, exact: true };

    const dist = (i: number, j: number) => matrix.get(ids[i])!.get(ids[j])!;
    const FULL = (1 << n) - 1;

    const dp: number[][] = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    const parent: number[][] = Array.from({ length: 1 << n }, () => Array(n).fill(-1));
    dp[1][0] = 0;

    for (let mask = 1; mask <= FULL; mask++) {
      if (!(mask & 1)) continue;
      for (let u = 0; u < n; u++) {
        if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;
        for (let v = 0; v < n; v++) {
          if (mask & (1 << v)) continue;
          const newMask = mask | (1 << v);
          const newDist = dp[mask][u] + dist(u, v);
          if (newDist < dp[newMask][v]) {
            dp[newMask][v] = newDist;
            parent[newMask][v] = u;
          }
        }
      }
    }

    let best = Infinity;
    let bestLast = 1;
    for (let u = 1; u < n; u++) {
      const cost = dp[FULL][u] + dist(u, 0);
      if (cost < best) {
        best = cost;
        bestLast = u;
      }
    }

    const routeIndices: number[] = [];
    let mask = FULL;
    let curr = bestLast;
    while (curr !== -1) {
      routeIndices.push(curr);
      const p = parent[mask][curr];
      mask = mask ^ (1 << curr);
      curr = p;
    }
    routeIndices.reverse();

    const route = routeIndices.map(i => ids[i]);
    route.push(originId);

    return { route, totalCost: best, exact: true };
  }

  // Empacota o resultado do TSP exato (Held-Karp) no mesmo formato de "macro
  // trace" usado pelo passo a passo, só pra permitir reaproveitar a mesma
  // tela/tabela de memória no "Rodar tudo" — sem 'candidates', porque o
  // algoritmo exato não escolhe o próximo nó passo a passo, ele calcula a
  // rota inteira de uma vez (por isso não faz sentido comparar "candidatos").
  tspExactMacroTrace(data: GraphData, originId: string): TspMacroTrace | null {
    const result = this.tspExact(data, originId);
    if (!result) return null;

    const matrix = this.buildDistanceMatrix(data);
    const predecessors = new Map<string, string | null>();
    predecessors.set(originId, null);

    const iterations: TspIteration[] = [];
    let totalCost = 0;
    for (let i = 0; i < result.route.length - 1; i++) {
      const from = result.route[i];
      const to = result.route[i + 1];
      const edgeCost = matrix.get(from)?.get(to) ?? 0;
      totalCost += edgeCost;
      if (!predecessors.has(to)) {
        predecessors.set(to, from);
      }
      iterations.push({
        fromId: from,
        toId: to,
        edgeCost,
        totalCostAfter: totalCost,
        routeAfter: result.route.slice(0, i + 2),
        visitedAfter: result.route.slice(1, i + 2),
        candidates: []
      });
    }

    return { originId, iterations, finalRoute: result.route, finalCost: result.totalCost, predecessors };
  }

  tspHeuristic(data: GraphData, originId: string): TspResult | null {
    const matrix = this.buildDistanceMatrix(data);
    const nodeIds = data.nodes.map(n => n.id);

    if (!this.isMatrixComplete(matrix, nodeIds)) return null;
    if (nodeIds.length === 1) return { route: [originId, originId], totalCost: 0, exact: false };

    const unvisited = new Set(nodeIds.filter(id => id !== originId));
    const route: string[] = [originId];
    let current = originId;

    while (unvisited.size > 0) {
      let nearest: string | null = null;
      let nearestDist = Infinity;
      for (const candidate of unvisited) {
        const d = matrix.get(current)!.get(candidate)!;
        if (d < nearestDist) {
          nearestDist = d;
          nearest = candidate;
        }
      }
      route.push(nearest!);
      unvisited.delete(nearest!);
      current = nearest!;
    }
    route.push(originId);

    const routeCost = (r: string[]) => {
      let total = 0;
      for (let i = 0; i < r.length - 1; i++) {
        total += matrix.get(r[i])!.get(r[i + 1])!;
      }
      return total;
    };

    let bestRoute = route;
    let bestCost = routeCost(route);
    let improved = true;

    while (improved) {
      improved = false;
      for (let i = 1; i < bestRoute.length - 2; i++) {
        for (let j = i + 1; j < bestRoute.length - 1; j++) {
          const newRoute = [
            ...bestRoute.slice(0, i),
            ...bestRoute.slice(i, j + 1).reverse(),
            ...bestRoute.slice(j + 1)
          ];
          const newCost = routeCost(newRoute);
          if (newCost < bestCost) {
            bestRoute = newRoute;
            bestCost = newCost;
            improved = true;
          }
        }
      }
    }

    return { route: bestRoute, totalCost: bestCost, exact: false };
  }

  // TSP agrupado em macro-passos didáticos, usando a heurística do vizinho
  // mais próximo (o "Rodar tudo" continua usando o Held-Karp exato — o passo
  // a passo aqui é só para mostrar a ideia de forma simples, nó a nó).
  // 1) começar na origem, 2) verificar se ainda há nó não visitado,
  // 3) fase que repete (ir para o nó não visitado mais próximo), 4) voltar à origem.
  tspMacroTrace(data: GraphData, originId: string): TspMacroTrace | null {
    const matrix = this.buildDistanceMatrix(data);
    const nodeIds = data.nodes.map(n => n.id);

    if (!this.isMatrixComplete(matrix, nodeIds)) return null;

    const predecessors = new Map<string, string | null>();
    predecessors.set(originId, null);

    if (nodeIds.length === 1) {
      return { originId, iterations: [], finalRoute: [originId, originId], finalCost: 0, predecessors };
    }

    const visited = new Set<string>([originId]);
    const route: string[] = [originId];
    const unvisited = new Set(nodeIds.filter(id => id !== originId));
    let current = originId;
    let totalCost = 0;
    const iterations: TspIteration[] = [];

    while (unvisited.size > 0) {
      let nearest: string | null = null;
      let nearestDist = Infinity;
      const candidates: { nodeId: string; distance: number }[] = [];
      for (const candidate of unvisited) {
        const d = matrix.get(current)!.get(candidate)!;
        candidates.push({ nodeId: candidate, distance: d });
        if (d < nearestDist) {
          nearestDist = d;
          nearest = candidate;
        }
      }
      candidates.sort((a, b) => a.distance - b.distance);

      const from = current;
      route.push(nearest!);
      unvisited.delete(nearest!);
      visited.add(nearest!);
      totalCost += nearestDist;
      if (!predecessors.has(nearest!)) {
        predecessors.set(nearest!, from);
      }
      current = nearest!;

      iterations.push({
        fromId: from,
        toId: nearest!,
        edgeCost: nearestDist,
        totalCostAfter: totalCost,
        routeAfter: [...route],
        visitedAfter: Array.from(visited),
        candidates
      });
    }

    const returnCost = matrix.get(current)!.get(originId)!;
    totalCost += returnCost;
    route.push(originId);

    return { originId, iterations, finalRoute: route, finalCost: totalCost, predecessors };
  }
}
