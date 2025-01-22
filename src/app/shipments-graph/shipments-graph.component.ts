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
  EntityType,
  getEntityIcon,
  getEntityTheme,
  getOrgnizationRegion,
  shipmentData,
} from './shipment-data';

@Component({
  selector: 'app-shipments-graph',
  templateUrl: './shipments-graph.component.html',
  styleUrl: './shipments-graph.component.scss',
})
export class ShipmentsGraphComponent {
  private chart!: Chart;
  private graph!: Graph;

  imageAlignment: IdMap<ImageAlignmentOptions> = {};

  public chartOptions: ChartOptions = {
    drag: {
      links: false,
      panAtBoundary: false,
    },
    truncateLabels: { maxLength: 15 },
    // imageAlignment: this.imageAlignment,
    selectedNode: theme.selectedNode,
    selectedLink: theme.selectedLink,
    // logo: { u: '/assets/Logo.png' },
    iconFontFamily: 'Font Awesome 5 Free Solid',
    linkEnds: { avoidLabels: false },
    minZoom: 0.02,
    handMode: true,
  };

  buttonsEnabledStates = {
    combineOrganizations: true,
    layout: true,
  };

  ngOnInit() {
    let imageAlignmentDefinitions: IdMap<ImageAlignmentOptions> = {
      'fa-user': { dy: -10, e: 0.9 },
      'fa-boxes': { dy: -10, e: 0.8 },
      'fa-truck': { dy: 0, e: 0.8 },
      'fa-sitemap': { dy: 0, e: 0.8 },
      'fa-users': { dy: 0, e: 0.8 },
      'fa-globe-americas': { dy: 0, e: 1.4 },
    };
    const icons = Object.keys(imageAlignmentDefinitions);

    icons.forEach((icon) => {
      this.imageAlignment[KeyLines.getFontIcon(icon)] =
        imageAlignmentDefinitions[icon];
    });

    this.chartOptions.imageAlignment = this.imageAlignment;
  }

  klChartReady([chart]: [Chart]) {
    this.chart = chart;
    this.chart.load(shipmentData);

    this.graph = KeyLines.getGraphEngine();
    this.graph.load(this.chart.serialize());

    this.applyTheme();
    setTimeout(() => {
      this.layout();
    }, 10);
  }

  layout(mode?: 'full' | 'adaptive') {
    return this.chart.layout('organic', { mode });
  }
  applyTheme() {
    const props: NodeProperties[] = [];
    this.chart.each({ type: 'node' }, (item) => {
      const rTheme = getEntityTheme(item.d.entity);
      // const countryGlyph = this.getCountryGlyph(item);
      // const g = countryGlyph !== null ? [countryGlyph] : [];

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
    this.chart.setProperties(props);
    // link styles
    // FIXME:
    this.chart.setProperties(
      { id: 'p', c: theme.linkColour, w: 3 },
      true /* regex */
    );
  }
  klChartEvents({ name, args }: Events) {}

  combineOrganizations() {
    // this.enableInput(
    //   ['combineCountry', 'combineRegion', 'uncombine', 'openall', 'layout'],
    //   false
    // );
    // this.combinedByCountry = true;
    this.combine(this.byOrganization, 'lens', 'Organization').then(() =>
      this.afterCombine()
    );
    // this.combine(this.byOrganization, 'lens');
  }

  groupNodesBy(criteria: Function) {
    const groups: { [key: string]: string[] } = {};
    this.chart.each({ type: 'node', items: 'toplevel' }, (item) => {
      const group: string = criteria(item);
      if (group) {
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(item.id);
      }
    });
    return groups;
  }

  isCombo(ids: string | string[], type: 'node' | 'link' | 'all' = 'node') {
    return this.chart.combo().isCombo(ids, { type });
  }

  getNodeSize(ids: string[]) {
    let size = 0;
    for (let i = 0; i < ids.length; i++) {
      if (this.isCombo(ids[i])) {
        size += this.chart.combo().info(ids[i])?.nodes.length || 0;
      } else {
        // regular node
        size += 1;
      }
    }
    return size;
  }

  combine(criteria: Function, arrange: ComboArrangement, entity: EntityType) {
    const options: CombineOptions = {
      arrange,
      animate: true,
      time: 1500,
      select: false,
    };
    const groups = this.groupNodesBy(criteria);
    const toClose: string[] = [];
    const combineArray: ComboDefinition[] = [];

    Object.keys(groups).forEach((group) => {
      toClose.push(...groups[group]);
      // ignore the 'unknown region'

      if (group !== 'Unknown Region') {
        const firstItem = this.chart.getItem(groups[group][0]);
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
              this.chart.options().combos?.shape === 'rectangle'
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
    this.chart.combo().close(toClose, { animate: false });
    return this.chart
      .combo()
      .combine(combineArray, options)
      .then((comboIds: string[]) => this.applyLinkTheme(comboIds));
  }

  applyLinkTheme(comboIds: string[]) {
    const props: NodeProperties[] = this.getNodeLinks(comboIds).map((id) => ({
      id,
      w: this.getLinkSize(id),
    }));
    return this.chart.setProperties(props, false);
  }

  getNodeLinks(nodeId: string[]): string[] {
    return this.chart.graph().neighbours(nodeId).links || [];
  }

  getLinkSize(id: string) {
    if (this.isCombo(id, 'link')) {
      // set the link thickness
      return 3 * Math.sqrt(this.chart.combo().info(id)?.links.length || 0);
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
      this.chart.foreground(() => true, { type: 'all' });
      // clear revealed items
      this.chart.combo().reveal([]);
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
      const selectedItems = this.chart.getItem(ids);
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
      this.chart.foreground((item) => foregroundMap[item.id], { type: 'all' });
      // reveal the links
      this.chart.combo().reveal(linksToReveal);
      // background all combolinks
      this.chart
        .combo()
        .find(linksToReveal, { parent: 'first' })
        .forEach((id) => {
          if (id !== null && this.chart?.getItem(id)?.type === 'link') {
            propsToUpdate.push({ id, bg: true });
          }
        });
      this.chart.setProperties(propsToUpdate);
    }
  }
}
