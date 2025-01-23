import { Component } from '@angular/core';
import {
  Chart,
  ChartOptions,
  Graph,
  IdMap,
  ImageAlignmentOptions,
  LinkProperties,
  NodeProperties,
  Node,
  ComboArrangement,
  CombineOptions,
  ComboDefinition,
} from 'keylines';
import { theme } from '../combo/combo2-data';
import { Events } from '../combo/combo.component';
import {
  getEntityIcon,
  getEntityTheme,
  getOrgnizationRegion,
  shipmentData,
} from './shipment-data';
import { Entites } from '../@types/chart.types';
import { ChartService } from '../services/chart.service';

@Component({
  selector: 'app-shipments-graph',
  templateUrl: './shipments-graph.component.html',
  styleUrl: './shipments-graph.component.scss',
})
export class ShipmentsGraphComponent {
  private graph!: Graph;
  private chartService!: ChartService;
  groupedBy!: Entites;
  readonly entities = Entites;

  public chartOptions!: ChartOptions;

  buttonsEnabledStates = {
    combineOrganizations: true,
    layout: true,
  };

  constructor() {
    this.chartService = new ChartService();
  }

  ngOnInit() {
    this.chartOptions = this.chartService.setChartOptions({
      selectedNode: theme.selectedNode,
      selectedLink: theme.selectedLink,
    });
  }

  klChartReady([chart]: [Chart]) {
    this.chartService.initializeChart(chart);
    this.chartService.chart.load(shipmentData);

    this.graph = KeyLines.getGraphEngine();
    this.graph.load(this.chartService.chart.serialize());

    this.applyTheme();
    setTimeout(() => {
      this.layout();
    }, 10);

    // this.closeAll();
  }

  async closeAll() {
    const orgNodes = this.getOrgNodes();
    orgNodes.forEach((org) => {
      const linkedNodes = this.graph.distances(org);
      const childNodes = [];
      for (const key in linkedNodes) {
        if (linkedNodes[key]) {
          childNodes.push(key);
        }
      }

      this.chartService.chart.hide(childNodes);
    });
  }

  getOrgNodes() {
    const orgNodes: string[] = [];
    this.chartService.chart.each({ type: 'node' }, (item) => {
      if (item.d?.entity == 'Organization') {
        orgNodes.push(item.id);
      }
    });
    return orgNodes;
  }
  layout(mode?: 'full' | 'adaptive') {
    return this.chartService.chart.layout('organic', { mode });
  }
  applyTheme() {
    const props: NodeProperties[] = [];
    this.chartService.chart.each({ type: 'node' }, (item) => {
      const rTheme = getEntityTheme(item.d.entity);
      // const countryGlyph = this.getCountryGlyph(item);
      // const g = countryGlyph !== null ? [countryGlyph] : [];

      const g = {
        p: 'ne',
        e: 0.8,
        c: 'rgb(87, 167, 115)',
        t: ' ',
      };
      props.push({
        id: item.id,
        u: undefined,
        g: [],
        c: rTheme.iconColour,
        fi: {
          t: KeyLines.getFontIcon(getEntityIcon(item.d.entity)),
          c: 'white',
        },
        b: theme.borderColour,
        bw: 2,
      });
    });
    // node styles
    this.chartService.chart.setProperties(props);
    // link styles
    // FIXME:
    this.chartService.chart.setProperties(
      { id: 'p', c: theme.linkColour, w: 3 },
      true /* regex */
    );
  }
  klChartEvents({ name, args }: Events) {
    if (name == 'selection-change') {
      this.onSelection();
    }

    if (name == 'double-click') {
      this.openNode();
    }
  }

  openNode() {
    const selectedIds = this.chartService.chart.selection();

    const neighbours = this.graph.neighbours(selectedIds).nodes;
    this.chartService.chart.show(neighbours, {
      animate: true,
      showLinks: true,
    });
    // this.applyTheme();
    console.log(neighbours);

    // [neighbours[0]].forEach((item) => {
    //   console.log(this.graph.distances(item));
    // });
    this.layout('adaptive');
  }

  isOpen = true;
  toggleNodes() {
    // const shipmentNodes = this.chartService.chart.each({type: 'node'}, (item) => {
    //   item.
    // })

    const neighbours = this.chartService.chart.graph().neighbours(['O1']).nodes;

    console.log(neighbours);

    if (this.isOpen) {
      this.chartService.chart.hide(neighbours);
    } else {
      this.chartService.chart.show(neighbours, {
        showLinks: true,
        animate: true,
      });
    }
    this.isOpen = !this.isOpen;
    this.layout();
  }

  groupChange() {
    if (this.groupedBy == Entites.ORGANIZATION) {
      this.combineOrganizations();
    }
  }

  combineOrganizations() {
    // this.enableInput(
    //   ['combineCountry', 'combineRegion', 'uncombine', 'openall', 'layout'],
    //   false
    // );
    // this.combinedByCountry = true;
    this.combine(this.byOrganization, 'lens', Entites.ORGANIZATION).then(() =>
      this.afterCombine()
    );
  }

  groupNodesBy(criteria: Function) {
    const groups: Record<string, string[]> = {};
    this.chartService.chart.each(
      { type: 'node', items: 'toplevel' },
      (item) => {
        const group: string = criteria(item);
        if (group) {
          if (!groups[group]) {
            groups[group] = [];
          }
          groups[group].push(item.id);
        }
      }
    );
    return groups;
  }

  onSelection() {
    // grab current selection
    const selectedIds = this.chartService.chart.selection();

    // filter out any combo items to get only the underlying selection
    const ids = selectedIds.filter(
      (id) => !this.chartService.chart.combo().isCombo(id)
    );
    // remove the combos from the selection
    this.chartService.chart.selection(ids);
    // foreground the filtered selection of items and their connections
    this.foregroundSelection(ids);
  }

  isCombo(ids: string | string[], type: 'node' | 'link' | 'all' = 'node') {
    return this.chartService.chart.combo().isCombo(ids, { type });
  }

  getNodeSize(ids: string[]) {
    let size = 0;
    for (let i = 0; i < ids.length; i++) {
      if (this.isCombo(ids[i])) {
        size += this.chartService.chart.combo().info(ids[i])?.nodes.length || 0;
      } else {
        // regular node
        size += 1;
      }
    }
    return size;
  }

  combine(criteria: Function, arrange: ComboArrangement, entity: Entites) {
    const options: CombineOptions = {
      arrange,
      animate: true,
      time: 1000,
      select: false,
    };
    const groups = this.groupNodesBy(criteria);
    const toClose: string[] = [];
    const combineArray: ComboDefinition[] = [];

    Object.keys(groups).forEach((group) => {
      toClose.push(...groups[group]);
      // ignore the 'unknown region'

      if (group !== 'Unknown Region') {
        const firstItem = this.chartService.chart.getItem(groups[group][0]);
        const isRegion = firstItem?.d.region !== undefined;
        const region = isRegion
          ? firstItem.d.region
          : getOrgnizationRegion(firstItem?.d.organization);
        console.log(firstItem?.d.organization);

        // firstItem?.d.organization;
        const rTheme = getEntityTheme(entity);
        const combineIds: ComboDefinition = {
          ids: groups[group],
          d: { region, isRegion },
          label: region,
          glyph: null,
          style: {
            e: Math.sqrt(this.getNodeSize(groups[group])),
            c: isRegion ? 'white' : rTheme.iconColour,
            fc: 'rgb(100,100,100)',
            fs: isRegion ? theme.regionFontSize : theme.countryFontSize,
            fi: {
              t: KeyLines.getFontIcon(getEntityIcon(entity)),
              c: isRegion ? rTheme.iconColour : 'white',
            },
            bw: 2,
            b: isRegion ? undefined : theme.borderColour,
            sh:
              this.chartService.chart.options().combos?.shape === 'rectangle'
                ? 'box'
                : undefined,
          },
          openStyle: {
            c: isRegion ? rTheme.regionOCColour : rTheme.countryBgColour,
            b: theme.borderColour,
            bw: 5,
          },
        };
        combineArray.push(combineIds);
      }
    });

    // close all groups before we combine
    this.chartService.chart.combo().close(toClose, { animate: false });
    return this.chartService.chart
      .combo()
      .combine(combineArray, options)
      .then((comboIds: string[]) => this.applyLinkTheme(comboIds));
  }

  applyLinkTheme(comboIds: string[]) {
    const props: NodeProperties[] = this.getNodeLinks(comboIds).map((id) => ({
      id,
      w: this.getLinkSize(id),
    }));
    return this.chartService.chart.setProperties(props, false);
  }

  getNodeLinks(nodeId: string[]): string[] {
    return this.chartService.chart.graph().neighbours(nodeId).links || [];
  }

  getLinkSize(id: string) {
    if (this.isCombo(id, 'link')) {
      // set the link thickness
      return (
        3 *
        Math.sqrt(this.chartService.chart.combo().info(id)?.links.length || 0)
      );
    }
    return 3;
  }

  byOrganization(item: Node) {
    return item.d.organization || null;
  }
  afterCombine() {
    this.layout('adaptive').then(() => {
      // this.enableInput(
      //   ['openall', 'combineRegion', 'uncombine', 'layout'],
      //   true
      // );
      // this.enableInput(['combineRegion'], !this.combinedByRegion);
    });
    // reset foregrounded items when nodes are combined
    this.foregroundSelection([]);
    this.applyTheme();
  }

  foregroundSelection(ids: string[]) {
    if (ids.length === 0) {
      // restore all the elements in the foreground
      this.chartService.chart.foreground(() => true, { type: 'all' });
      // clear revealed items
      this.chartService.chart.combo().reveal([]);
    } else {
      // find the connections for all of the selected ids
      const neighbours = this.graph.neighbours(ids);
      const foregroundMap: { [id: string]: boolean } = {};
      const linksToReveal: string[] = [];
      const propsToUpdate: LinkProperties[] = [];
      neighbours?.links?.forEach((linkId) => {
        // build map of neighbouring links to foreground
        foregroundMap[linkId] = true;
        // add neighbouring links to reveal array
        linksToReveal.push(linkId);
      });
      neighbours.nodes.forEach((nodeId) => {
        // add neighbouring nodes to foreground map
        foregroundMap[nodeId] = true;
      });
      const selectedItems = this.chartService.chart.getItem(ids);
      selectedItems.forEach((item) => {
        if (!item) return;
        // add selected items to foreground map
        foregroundMap[item.id] = true;
        if (item.type === 'link') {
          // add only the selected links to the reveal array
          linksToReveal.push(item.id);
        }
      });
      // run foreground on underlying links and nodes
      this.chartService.chart.foreground((item) => foregroundMap[item.id], {
        type: 'all',
      });
      // reveal the links
      this.chartService.chart.combo().reveal(linksToReveal);
      // background all combolinks
      this.chartService.chart
        .combo()
        .find(linksToReveal, { parent: 'first' })
        .forEach((id) => {
          if (
            id !== null &&
            this.chartService.chart?.getItem(id)?.type === 'link'
          ) {
            propsToUpdate.push({ id, bg: true });
          }
        });
      this.chartService.chart.setProperties(propsToUpdate);
    }
  }
}
