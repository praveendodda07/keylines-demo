import { Component } from '@angular/core';
import {
  Chart,
  ChartOptions,
  Graph,
  IdMap,
  ImageAlignmentOptions,
  NodeProperties,
} from 'keylines';
import { theme } from '../combo/combo2-data';
import { Events } from '../combo/combo.component';
import {
  EntityType,
  getEntityIcon,
  getEntityTheme,
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
    this.layout();
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
    // this.chart.setProperties(
    //   { id: 'p', c: theme.linkColour, w: 3 },
    //   true /* regex */
    // );
  }
  klChartEvents({ name, args }: Events) {}
}
