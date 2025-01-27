import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface NodeData<T> {
  type: 'node';
  data: T;
}

interface EdgeData extends Edge {
  type: 'link';
}

export type Response<T> = NodeData<T> | EdgeData;

interface Data extends Record<string, any> {
  id: string;
  name: string;
  entity: string;
}

interface Edge {
  id1: string;
  id2: string;
  id: string;
}
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly data: Data[] = [
    {
      id: 'MDC',
      name: 'Main DC',
      entity: 'DC',
      location: 'Hyderabad, India',
    },
    {
      id: 'DC1',
      name: 'Ukrain DC',
      entity: 'DC',
      location: 'Kyiv, Ukrain',
    },
    {
      id: 'DC2',
      name: 'China DC',
      entity: 'DC',
      location: 'Beijing, China',
    },
    {
      id: 'DC3',
      name: 'NA RDC',
      entity: 'DC',
      location: 'Amsterdam, NA',
    },
    {
      id: 'DC4',
      name: 'Brazil RDC',
      entity: 'DC',
      location: 'Brasília, Brazil',
    },
    {
      id: 'DC5',
      name: 'Germany DC',
      entity: 'DC',
      location: 'Berlin, Germany',
    },

    {
      id: 'DC6',
      name: 'DC x',
      entity: 'DC',
      location: 'Albany, New York',
    },
    {
      id: 'DC7',
      name: 'Thermofisher CTD',
      entity: 'DC',
      location: 'Paris, France',
    },
    {
      id: 'P1',
      name: 'Ext Plant 1',
      entity: 'Plant',
      isExternal: true,
      order: 1,
      shipments: 2,
    },
    {
      id: 'P2',
      name: 'Ext Plant 2',
      entity: 'Plant',
      isExternal: true,
      order: 2,
      shipments: 2,
    },
    {
      id: 'P3',
      name: 'Ext Plant 3',
      entity: 'Plant',
      isExternal: true,
      order: 3,
      shipments: 2,
    },
    {
      id: 'P4',
      name: 'Plant 1',
      entity: 'Plant',
      order: 4,
      shipments: 2,
    },
    {
      id: 'P5',
      name: 'Plant 2',
      entity: 'Plant',
      order: 5,
      shipments: 2,
    },
    {
      id: 'P6',
      name: 'Plant 3',
      entity: 'Plant',
      order: 6,
      shipments: 6,
    },
  ];

  private readonly edges: Edge[] = [
    {
      id1: 'MDC',
      id2: 'DC1',
      id: 'MDC-089-DC1',
    },
    {
      id1: 'MDC',
      id2: 'DC2',
      id: 'MDC-089-DC2',
    },
    {
      id1: 'MDC',
      id2: 'DC3',
      id: 'MDC-089-DC3',
    },
    {
      id1: 'MDC',
      id2: 'DC4',
      id: 'MDC-089-DC4',
    },
    {
      id1: 'MDC',
      id2: 'DC5',
      id: 'MDC-089-DC5',
    },
    {
      id1: 'MDC',
      id2: 'DC6',
      id: 'MDC-089-DC6',
    },
    {
      id1: 'MDC',
      id2: 'DC7',
      id: 'MDC-089-DC7',
    },

    {
      id1: 'DC7',
      id2: 'P1',
      id: 'DC7-089-P1',
    },
    {
      id1: 'DC7',
      id2: 'P2',
      id: 'DC7-089-P2',
    },
    {
      id1: 'DC7',
      id2: 'P3',
      id: 'DC7-089-P3',
    },
    {
      id1: 'DC7',
      id2: 'P4',
      id: 'DC7-089-P4',
    },
    {
      id1: 'DC7',
      id2: 'P5',
      id: 'DC7-089-P5',
    },
    {
      id1: 'DC7',
      id2: 'P6',
      id: 'DC7-089-P6',
    },
  ];
  constructor() {}

  getNodeData(nodeId?: string): Observable<Response<Data>[]> {
    const data = this.getData(nodeId);
    return of(data);
  }

  getData(nodeId?: string): Response<Data>[] {
    if (!nodeId) {
      const data: Response<Data>[] = this.mapToNodes([this.data[0]]);
      return data.concat(this.getData(this.data[0].id));
    }
    const edges = this.getEdges(nodeId);
    const nodes = this.getNodes(nodeId);

    return [...nodes, ...edges];
  }

  getEdges(nodeId: string) {
    const edgeData = this.edges.filter((edge) =>
      [edge.id1, edge.id2].includes(nodeId)
    );
    return this.mapToEdges(edgeData);
  }

  getNodes(nodeId: string) {
    const edges = this.getEdges(nodeId);
    const nodeIds: string[] = [nodeId];
    edges.forEach((edge) => {
      if (!nodeIds.includes(edge.id1)) {
        nodeIds.push(edge.id1);
      }

      if (!nodeIds.includes(edge.id2)) {
        nodeIds.push(edge.id2);
      }
    });

    nodeIds.shift();
    const nodeData = this.data.filter((item) => nodeIds.includes(item.id));
    return this.mapToNodes(nodeData);
  }

  mapToNodes<T>(data: T[]): NodeData<T>[] {
    return data.map((item) => {
      return {
        type: 'node',
        data: item,
      };
    });
  }

  mapToEdges(edges: Edge[]): EdgeData[] {
    return edges.map((edge) => {
      return {
        ...edge,
        type: 'link',
      };
    });
  }
}
