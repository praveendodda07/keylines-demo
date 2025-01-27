import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChartService } from '../services/chart.service';
import {
  Chart,
  ChartOptions,
  ChartPointerEventProps,
  Glyph,
  Link,
  LinkProperties,
  Node,
  NodeProperties,
} from 'keylines';
import { theme } from '../combo/combo2-data';
import { getEntityIcon, getEntityTheme } from './data';
import { ChartEvents, Entites, NodeTooltip } from '../@types/chart.types';
import { ProtoApiService } from '../services/proto-api.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-proto-1',
  templateUrl: './proto-1.component.html',
  styleUrl: './proto-1.component.scss',
})
export class Proto1Component implements OnInit, AfterViewInit {
  private chartService!: ChartService;
  public chartOptions!: ChartOptions;

  private tooltipContainer!: Element;
  private templateHtml!: string;
  private viewWidth!: number;
  private viewHeight!: number;

  public tooltip: NodeTooltip = {
    id: null,
    element: null,
  };

  private readonly nodeBaseSize = 26;

  constructor(private apiService: ProtoApiService) {
    this.chartService = new ChartService();
  }

  private data: (Node | Link)[] = [];
  ngOnInit(): void {
    this.chartOptions = this.chartService.setChartOptions({
      selectedNode: theme.selectedNode,
      selectedLink: theme.selectedLink,
    });
  }
  ngAfterViewInit(): void {
    this.templateHtml = (
      document.getElementById('tt_html') as Element
    ).innerHTML;
    this.tooltipContainer = document.querySelector(
      '#tooltip-container'
    ) as Element;
  }

  fetchNodes(nodeId?: string) {
    this.apiService
      .fetchNodes(nodeId)
      .pipe(
        map((res) => {
          return res.filter(
            (item) => !this.data.find((dataItem) => item.id == dataItem.id)
          );
        })
      )
      .subscribe(async (res) => {
        if (!res.length) return;
        this.data.push(...res);

        res.forEach((item) => {
          this.chartService.chart.setItem(item);
        });

        this.applyTheme();
        this.chartService.layout('adaptive');
      });
  }
  klChartReady([chart]: [Chart]) {
    this.chartService.initializeChart(chart);
    this.chartService.chart.load({
      type: 'LinkChart',
      items: this.data,
    });

    this.chartService.initizeGraph(KeyLines.getGraphEngine());
    this.chartService.graph.load(this.chartService.chart.serialize());

    let { width, height } = this.chartService.chart.viewOptions();
    this.viewWidth = width;
    this.viewHeight = height;

    this.fetchNodes();
  }
  klChartEvents({ name, args }: ChartEvents) {
    // if (name == 'selection-change') {
    //   this.onSelection();
    // }

    if (name == 'double-click') {
      this.openNode();
    }

    if (name == 'view-change') {
      const { width: newWidth, height: newHeight } =
        this.chartService.chart.viewOptions();
      if (this.viewWidth !== newWidth || this.viewHeight !== newHeight) {
        this.closeTooltip();
        this.viewWidth = newWidth;
        this.viewHeight = newHeight;
      }
      this.updateTooltipPosition();
    }

    if (name == 'hover') {
      this.handleTooltip(args as ChartPointerEventProps);
    }

    if (name == 'drag-move') {
      this.updateTooltipPosition();
    }
  }

  openNode() {
    const [id] = this.chartService.chart.selection();
    if (!id) return;
    this.fetchNodes(id);
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
    const nodeProps: NodeProperties[] = [];
    const linkProps: LinkProperties[] = [];

    // node styles
    this.chartService.chart.each({ type: 'node' }, (item) => {
      const rTheme = getEntityTheme(item.d.entity);
      // const countryGlyph = this.getCountryGlyph(item);
      // const g = countryGlyph !== null ? [countryGlyph] : [];

      let color = rTheme.iconColour;
      let glyphs: Glyph[] = [];
      if (item.d?.entity == 'Plant') {
        glyphs = this.generatePlantGlyphs(item.d);
        if (item.d?.isExternal) {
          color = 'red';
        }
      }

      nodeProps.push({
        id: item.id,
        u: undefined,
        g: glyphs,
        c: color,
        fi: {
          t: KeyLines.getFontIcon(getEntityIcon(item.d.entity)),
          c: 'white',
        },
        b: theme.borderColour,
        bw: 2,
      });
    });
    this.chartService.chart.setProperties(nodeProps);

    // link styles
    this.chartService.chart.each({ type: 'link' }, (item) => {
      const data = this.chartService.chart.getItem(item.id2) as Node;

      linkProps.push({
        c: data.c || theme.linkColour,
        w: 3,
        id: item.id,
      });
    });

    this.chartService.chart.setProperties(linkProps);
  }

  private generatePlantGlyphs(data: any): Glyph[] {
    const shipmentsGlyph: Glyph = {
      p: 'ne',
      e: 1,
      c: 'yellow',
      t: data?.shipments || 0,
      fc: 'black',
    };

    const orderGlyph: Glyph = {
      p: 'se',
      e: 1,
      c: 'red',
      t: data?.order || 0,
      fc: 'white',
    };
    return [shipmentsGlyph, orderGlyph];
  }

  private handleTooltip({ id }: ChartPointerEventProps) {
    if (!id) return this.closeTooltip();
    const item = this.chartService.chart.getItem(id);
    if (item && item.type === 'node') {
      const tooltipContext = this.getTooltipContext(item?.d, item.d.entity);

      if (!tooltipContext) return this.closeTooltip();

      const html = this.templateHtml;

      // Add it to the DOM
      this.tooltipContainer.innerHTML = html;
      this.tooltip.element = document.getElementById('tooltip') as HTMLElement;

      this.tooltip.element.innerHTML = tooltipContext;
      this.tooltip.id = id;
      this.updateTooltipPosition();
    } else if (this.tooltip.element) {
      this.closeTooltip();
    }
  }
  private getTooltipContext(data: Record<string, any>, entity: Entites) {
    let tooltipHtml = ``;
    if (entity == Entites.DC) {
      tooltipHtml = `<b>Location:</b> ${data?.['location'] || ''}`;
    }

    if (entity == Entites.Plant) {
      tooltipHtml = `
        <div><b>Purchase Order:</b> ${data?.['order'] || 0}</div>
        <div><b>Shipments Count:</b> ${data?.['shipments'] || 0}</div>
      `;
    }
    return tooltipHtml;
  }
  private closeTooltip() {
    if (this.tooltip.element) {
      this.tooltip.element.style.opacity = '' + 0;
    }
    this.tooltip.id = null;
    this.tooltip.element = null;
  }

  private updateTooltipPosition() {
    if (this.tooltip.id && this.tooltip.element) {
      const { id, element } = this.tooltip;
      const item = this.chartService.chart.getItem(id) as Node;
      const coordinates = this.chartService.chart.viewCoordinates(
        item.x || 0,
        item.y || 0
      );
      const x = coordinates.x;
      const y = coordinates.y;

      const zoom = this.chartService.chart.viewOptions().zoom;
      const arrowTipOffset = 8;
      // get the size of the node on screen
      const nodeSize = this.nodeBaseSize * (item.e || 1) * zoom;

      element.style.opacity = '' + 0;
      // allow fade in and out to animate
      element.style.transition = 'opacity 0.3s ease';
      // scale the size of the tooltip depending on zoom level
      const zoomTransform = Math.max(0.75, Math.min(2, zoom));

      element.style.transform = `scale(${zoomTransform}`;
      const top =
        y - element.clientHeight - nodeSize * zoomTransform - arrowTipOffset;
      element.style.left = `${x - (element.clientWidth / 2) * zoomTransform}px`;
      element.style.top = `${top}px`;
      element.style.opacity = '' + 1;
    }
  }
}
