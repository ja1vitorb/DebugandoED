import { Injectable, signal } from '@angular/core';
import { GraphData, GraphNode, GraphEdge } from '../models/graph.models';

@Injectable({ providedIn: 'root' })
export class GraphService {
  graph = signal<GraphData>({
    directed: false,
    nodes: [],
    edges: []
  });

  // Já existe um nó com esse nome? (ignora maiúsculas/minúsculas e espaços nas pontas,
  // então "a" e "A " contam como repetidos de "A".)
  hasNodeLabel(label: string): boolean {
    const alvo = label.trim().toLowerCase();
    return this.graph().nodes.some(n => n.label.trim().toLowerCase() === alvo);
  }

  // Retorna false (e não cria nada) se o nome já estiver em uso.
  addNode(label: string): boolean {
    if (this.hasNodeLabel(label)) return false;
    const id = crypto.randomUUID();
    this.graph.update(g => ({
      ...g,
      nodes: [...g.nodes, { id, label }]
    }));
    return true;
  }

  addEdge(source: string, target: string, weight: number) {
    const id = crypto.randomUUID();
    this.graph.update(g => ({
      ...g,
      edges: [...g.edges, { id, source, target, weight }]
    }));
  }

  // Remove um nó e, em cascata, todas as arestas ligadas a ele
  // (senão sobrariam arestas "soltas" apontando para um nó inexistente).
  removeNode(id: string) {
    this.graph.update(g => ({
      ...g,
      nodes: g.nodes.filter(n => n.id !== id),
      edges: g.edges.filter(e => e.source !== id && e.target !== id)
    }));
  }

  toggleDirected() {
    this.graph.update(g => ({ ...g, directed: !g.directed }));
  }

  // Reinicia a execução: volta para um grafo vazio.
  clearGraph() {
    this.graph.set({ directed: false, nodes: [], edges: [] });
  }

  generateRandomGraph(nodeCount: number, maxWeight: number, directed: boolean, connected: boolean) {
    const nodes: GraphNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({ id: crypto.randomUUID(), label: this.generateLabel(i) });
    }

    const edges: GraphEdge[] = [];

    if (connected) {
      for (let i = 1; i < nodes.length; i++) {
        const targetIndex = Math.floor(Math.random() * i);
        edges.push({
          id: crypto.randomUUID(),
          source: nodes[targetIndex].id,
          target: nodes[i].id,
          weight: Math.floor(Math.random() * maxWeight) + 1
        });
      }
    }

    const edgeProbability = 0.3;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const jaExiste = edges.some(e =>
          (e.source === nodes[i].id && e.target === nodes[j].id) ||
          (e.source === nodes[j].id && e.target === nodes[i].id)
        );
        if (!jaExiste && Math.random() < edgeProbability) {
          edges.push({
            id: crypto.randomUUID(),
            source: nodes[i].id,
            target: nodes[j].id,
            weight: Math.floor(Math.random() * maxWeight) + 1
          });
        }
      }
    }

    this.graph.set({ directed, nodes, edges });
  }

  private generateLabel(index: number): string {
    let label = '';
    let n = index;
    do {
      label = String.fromCharCode(65 + (n % 26)) + label;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return label;
  }
}
