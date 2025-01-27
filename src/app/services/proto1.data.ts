import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Entites } from '../@types/chart.types';

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
  entity: Entites;
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
      name: 'FCS-Bohemia USA',
      entity: Entites.DC,
    },
    {
      id: 'DC1',
      name: 'FCS-Mexico City MEX',
      entity: Entites.DC,
    },
    {
      id: 'DC2',
      name: 'FCS-Beijing CHN',
      entity: Entites.DC,
    },
    {
      id: 'DC3',
      name: 'Patheon-Groningen NLD',
      entity: Entites.DC,
    },
    {
      id: 'DC4',
      name: 'FCS-Sao Paulo Brasil',
      entity: Entites.DC,
    },
    {
      id: 'DC5',
      name: 'FCS-Horsham GBR',
      entity: Entites.DC,
    },

    {
      id: 'DC6',
      name: 'DC x',
      entity: Entites.DC,
    },
    {
      id: 'DC7',
      name: 'Thermofisher CTD',
      entity: Entites.DC,
    },
    {
      id: 'P1',
      name: 'FCS-Allschwil CHE [1045]',
      entity: Entites.Plant,
      order: 1,
      shipments: 2,
    },
    {
      id: 'P2',
      name: 'Patheon-Cincinnati USA [1025]',
      entity: Entites.Plant,
      order: 1,
      shipments: 2,
    },
    {
      id: 'P3',
      name: 'Patheon-Tilburg NLD [1016]',
      entity: Entites.Plant,
      order: 1,
      shipments: 2,
    },
    {
      id: 'P4',
      name: 'VVS-Lexington USA [1036]',
      entity: Entites.Plant,
      order: 1,
      shipments: 2,
    },
    {
      id: 'P5',
      name: 'FCS-Allschwil CHE [1116]',
      entity: Entites.Plant,
      order: 1,
      shipments: 2,
    },
    {
      id: 'P6',
      name: 'Patheon-Tokyo JPN [1092]',
      entity: Entites.Plant,
      order: 3,
      shipments: 6,
    },
    {
      id: 'S1',
      name: 'Avelos Therapeutics Inc',
      entity: Entites.SHIPMENT,
      customerName: 'Immutep GmbH',
      excursion: ['Origin Delay'],
    },
    {
      id: 'S2',
      name: 'Jazz Pharmaceuticals Ireland Limited',
      entity: Entites.SHIPMENT,
      customerName: 'Avelos Therapeutics Inc',
      excursion: ['Cargo Temperature'],
    },
    {
      id: 'S3',
      name: 'Immutep GmbH',
      entity: Entites.SHIPMENT,
      customerName: 'Immutep GmbH',
      excursion: ['Cargo Temperature'],
    },
    {
      id: 'S4',
      name: 'Aerium Therapeutics Inc',
      entity: Entites.SHIPMENT,
      customerName: 'Avelos Therapeutics Inc',
      excursion: ['Origin Delay'],
    },
    {
      id: 'S5',
      name: 'AstraZeneca Pharma Poland Sp zoo',
      entity: Entites.SHIPMENT,
      customerName: 'Immutep GmbH',
      excursion: ['Origin Delay'],
    },
    {
      id: 'S6',
      name: 'Apogee Therapeutics Inc',
      entity: Entites.SHIPMENT,
      customerName: 'Avelos Therapeutics Inc',
    },
  ];

  // customer, excursion
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

    {
      id1: 'P6',
      id2: 'S1',
      id: 'P6-089-S1',
    },
    {
      id1: 'P6',
      id2: 'S2',
      id: 'P6-089-S2',
    },
    {
      id1: 'P6',
      id2: 'S3',
      id: 'P6-089-S3',
    },
    {
      id1: 'P6',
      id2: 'S4',
      id: 'P6-089-S4',
    },
    {
      id1: 'P6',
      id2: 'S5',
      id: 'P6-089-S5',
    },
    {
      id1: 'P6',
      id2: 'S6',
      id: 'P6-089-S6',
    },

    // {
    //   id1: 'S1',
    //   id2: 'DC2',
    //   id: 'S1-089-S1',
    // },
    // {
    //   id1: 'S2',
    //   id2: 'DC2',
    //   id: 'S2-089-DC2',
    // },
    // {
    //   id1: 'S3',
    //   id2: 'DC2',
    //   id: 'S3-089-DC2',
    // },
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
