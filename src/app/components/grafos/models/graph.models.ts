export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  directed: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
