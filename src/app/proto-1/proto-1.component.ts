import { Component, OnInit } from '@angular/core';
import { ChartService } from '../services/chart.service';
import { Chart, ChartOptions, LinkProperties, NodeProperties } from 'keylines';
import { theme } from '../combo/combo2-data';
import { getEntityIcon, getEntityTheme, shipmentData } from './data';
import { ChartEvents } from '../@types/chart.types';

@Component({
  selector: 'app-proto-1',
  templateUrl: './proto-1.component.html',
  styleUrl: './proto-1.component.scss',
})
export class Proto1Component implements OnInit {
  private chartService!: ChartService;
  public chartOptions!: ChartOptions;
  constructor() {
    this.chartService = new ChartService();
  }

  ngOnInit(): void {
    this.chartOptions = this.chartService.setChartOptions({
      selectedNode: theme.selectedNode,
      selectedLink: theme.selectedLink,
    });
  }

  klChartReady([chart]: [Chart]) {
    this.chartService.initializeChart(chart);
    this.chartService.chart.load(shipmentData);

    this.chartService.initizeGraph(KeyLines.getGraphEngine());
    this.chartService.graph.load(this.chartService.chart.serialize());

    this.applyTheme();
    setTimeout(() => {
      this.chartService.layout();
    }, 10);
  }
  klChartEvents({ name, args }: ChartEvents) {
    if (name == 'selection-change') {
      this.onSelection();
    }

    if (name == 'double-click') {
      // this.openNode();
      this.setSelection();
    }
  }

  async setSelection() {
    const selectedId = this.chartService.chart.selection();
    if (!selectedId.length) return;
    this.chartService.chart.lock(true);
    console.log(this.chartService.chart.selection());

    this.chartService.graph.neighbours();
    const results = await this.chartService.chart.filter(
      (item) => {
        return false;
      },
      { type: 'node', time: 300 }
    );

    this.chartService.layout('adaptive');
    this.chartService.chart.lock(false);

    // console.log(results);
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

  foregroundSelection(ids: string[]) {
    if (ids.length === 0) {
      // restore all the elements in the foreground
      this.chartService.chart.foreground(() => true, { type: 'all' });
      // clear revealed items
      this.chartService.chart.combo().reveal([]);
    } else {
      // find the connections for all of the selected ids
      const neighbours = this.chartService.graph.neighbours(ids);
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
}
