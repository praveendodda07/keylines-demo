import { Injectable } from '@angular/core';
import { DataService, Response, Data } from './proto1.data';
import { Observable, map } from 'rxjs';
import { Link, Node } from 'keylines';

@Injectable({
  providedIn: 'root',
})
export class ProtoApiService {
  constructor(private dataService: DataService) {}

  fetchNodes(nodeId?: string): Observable<(Node | Link)[]> {
    return this.dataService
      .getNodeData(nodeId)
      .pipe(map((res) => this.mapToGraph(res)));
  }

  fetchRoute(edgeId: string): Observable<(Node | Link)[]> {
    return this.dataService
      .getRouteData(edgeId)
      .pipe(map((res) => this.mapToGraph(res)));
  }
  mapToGraph(res: Response<Data>[]): (Node | Link)[] {
    return res.map((item) => {
      if (item.type == 'node') {
        return {
          type: 'node',
          id: item.data.id,
          t: item.data.name,
          d: item.data,
          x: 0,
          y: 0,
        };
      } else {
        return {
          type: 'link',
          a1: true,
          a2: true,
          id: item.id,
          id1: item.id1,
          id2: item.id2,
          c: '#696969',
        };
      }
    });
  }
}
