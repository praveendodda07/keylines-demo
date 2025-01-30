import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  Chart,
  ChartOptions,
  ChartPointerEventProps,
  CombineOptions,
  ComboDefinition,
  Glyph,
  Link,
  LinkProperties,
  Node,
  NodeProperties,
} from 'keylines';
import { ChartService } from '../services/chart.service';
import { theme } from '../combo/combo2-data';
import { getEntityIcon, getEntityTheme } from './data';
import { ChartEvents, Entites, NodeTooltip } from '../@types/chart.types';
import { ProtoApiService } from '../services/proto-api.service';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { KlComponents, KlComponent } from '../../angular-keylines';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-proto-1',
  templateUrl: './proto-1.component.html',
  styleUrl: './proto-1.component.scss',
  standalone: true,
  imports: [
    KlComponents,
    KlComponent,
    FormsModule,
    MatRadioButton,
    MatRadioGroup,
  ],
})
export class Proto1Component implements OnInit, AfterViewInit {
  private chartService!: ChartService;
  public chartOptions!: ChartOptions;

  private tooltipContainer!: Element;
  private templateHtml!: string;
  private viewWidth!: number;
  private viewHeight!: number;
  public isShipmentsShown = true;

  public tooltip: NodeTooltip = {
    id: null,
    element: null,
  };

  private readonly nodeBaseSize = 26;

  public groupedBy: 'customerName' | 'excursion' | 'none' = 'none';

  constructor(
    private apiService: ProtoApiService,
    private cdr: ChangeDetectorRef
  ) {
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

  combineShipments(shipments: Node[]) {
    const options: CombineOptions = {
      arrange: 'lens',
      animate: false,
      select: false,
    };

    const combineArray: ComboDefinition[] = [];

    const group = shipments.map((shipment) => shipment.id);

    const rTheme = getEntityTheme(Entites.SHIPMENT);
    const combineIds: ComboDefinition = {
      ids: group,
      // d: { region: 'Shipment1', isRegion: true },
      d: {
        entity: Entites.SHIPMENT,
        groupBy: 'shipments',
      },
      label: 'Shipments',
      glyph: null,
      style: {
        e: Math.sqrt(this.getNodeSize(group)),
        c: rTheme.iconColour,
        fc: 'rgb(100,100,100)',
        // fs: theme.countryFontSize,
        fi: {
          t: KeyLines.getFontIcon(getEntityIcon(Entites.SHIPMENT)),
          c: 'white',
        },
        bw: 2,
        b: theme.borderColour,
        sh:
          this.chartService.chart.options().combos?.shape === 'rectangle'
            ? 'box'
            : undefined,
      },
      openStyle: {
        c: rTheme.countryBgColour,
        b: theme.borderColour,
        bw: 5,
      },
    };

    combineArray.push(combineIds);

    return this.chartService.chart
      .combo()
      .combine(combineArray, options)
      .then((comboIds: string[]) => this.openCombos(comboIds))
      .then((comboIds: string[]) => this.applyLinkTheme(comboIds))
      .then(() => this.afterCombine());
  }

  async onGroupChange() {
    const shipmentCombos: Node[] = [];
    const shipmentNodes: Node[] = [];

    this.chartService.chart.each(
      { type: 'node', items: 'toplevel' },
      (item) => {
        if (item.d.groupBy == 'shipments') {
          shipmentCombos.push(item);
        }
      }
    );

    if (!shipmentCombos.length) {
      setTimeout(() => {
        this.groupedBy = 'none';
      }, 100);

      return;
    }

    shipmentCombos.forEach((combo) => {
      const nodes = this.chartService.chart.combo().info(combo.id)?.nodes || [];
      shipmentNodes.push(...nodes);
    });

    await this.unCombineShipments(shipmentCombos);

    if (this.groupedBy == 'none') {
      this.combineShipments(shipmentNodes);
      return;
    }

    this.groupByFilter(
      shipmentNodes,
      this.groupedBy,
      this.groupedBy == 'excursion' ? 'No Excursions' : 'Other'
    );
  }

  async groupByFilter(
    shipmentNodes: Node[],
    groupedBy: 'customerName' | 'excursion',
    defaultGroup = 'Other'
  ) {
    const rTheme = getEntityTheme(Entites.SHIPMENT);

    const options: CombineOptions = {
      arrange: 'lens',
      animate: false,
      select: false,
    };

    let groups: Record<string, string[]> = {};

    shipmentNodes.forEach((node) => {
      if (!node?.d?.[groupedBy]) {
        if (!groups[defaultGroup]) {
          groups[defaultGroup] = [node.id];
        } else {
          groups[defaultGroup].push(node.id);
        }
      } else if (!groups[node.d[groupedBy]]) {
        groups[node.d[groupedBy]] = [node.id];
      } else {
        groups[node.d[groupedBy]].push(node.id);
      }
    });

    const combineArray: ComboDefinition[] = [];
    console.log(groups);

    Object.keys(groups).forEach((group) => {
      const combineIds: ComboDefinition = {
        ids: groups[group],
        d: { entity: Entites.SHIPMENT, groupBy: groupedBy },
        label: group,
        glyph: null,
        style: {
          e: Math.sqrt(this.getNodeSize(groups[group])),
          c: rTheme.iconColour,
          fc: 'rgb(100,100,100)',
          // fs: theme.countryFontSize,
          fi: {
            t: KeyLines.getFontIcon(getEntityIcon(Entites.SHIPMENT)),
            c: 'white',
          },
          bw: 2,
          b: theme.borderColour,
          sh:
            this.chartService.chart.options().combos?.shape === 'rectangle'
              ? 'box'
              : undefined,
        },
        openStyle: {
          c: rTheme.countryBgColour,
          b: theme.borderColour,
          bw: 5,
        },
      };

      combineArray.push(combineIds);
    });

    this.chartService.chart
      .combo()
      .combine(combineArray, options)
      .then(async (comboIds) => {
        let shipmentsCombo: ComboDefinition[] = [
          {
            ids: comboIds,
            // d: { region: 'Shipment1', isRegion: true },
            d: { entity: Entites.SHIPMENT, groupBy: 'shipments' },
            label: 'Shipments',
            glyph: null,
            style: {
              e: Math.sqrt(this.getNodeSize(comboIds)),
              c: rTheme.iconColour,
              fc: 'rgb(100,100,100)',
              // fs: theme.countryFontSize,
              fi: {
                t: KeyLines.getFontIcon(getEntityIcon(Entites.SHIPMENT)),
                c: 'white',
              },
              bw: 2,
              b: theme.borderColour,
              sh:
                this.chartService.chart.options().combos?.shape === 'rectangle'
                  ? 'box'
                  : undefined,
            },
            openStyle: {
              c: rTheme.countryBgColour,
              b: theme.borderColour,
              bw: 5,
            },
          },
        ];
        const shipComboIds = await this.chartService.chart
          .combo()
          .combine(shipmentsCombo, options);

        await this.openCombos([...shipComboIds, ...comboIds]);
        await this.applyLinkTheme(shipComboIds);
        this.afterCombine();
      });
  }

  openCombos(comboIds: string[]) {
    return this.chartService.chart
      .combo()
      .open(comboIds)
      .then(() => comboIds);
  }
  applyLinkTheme(comboIds: string[]) {
    const props: NodeProperties[] = this.getNodeLinks(comboIds).map((id) => {
      return {
        id,
        w: this.getLinkSize(id),
        // c: data.c || theme.linkColour,
      };
    });

    return this.chartService.chart.setProperties(props, false);
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

  getNodeLinks(nodeId: string[]): string[] {
    return this.chartService.chart.graph().neighbours(nodeId).links || [];
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
  isCombo(ids: string | string[], type: 'node' | 'link' | 'all' = 'node') {
    return this.chartService.chart.combo().isCombo(ids, { type });
  }
  fetchNodes(nodeId?: string) {
    this.apiService
      .fetchNodes(nodeId)
      .pipe(
        map((res) =>
          res.filter(
            (item) => !this.data.find((dataItem) => item.id == dataItem.id)
          )
        )
      )
      .subscribe(async (res) => {
        if (!res.length) return;
        this.data.push(...res);

        res.forEach((item) => {
          this.chartService.chart.setItem(item);
        });

        this.chartService.graph.load(this.chartService.chart.serialize());

        if (nodeId) {
          const node = this.chartService.chart.getItem(nodeId);
          if (node?.d.entity == Entites.Plant) {
            this.isShipmentsShown = true;
            this.cdr.detectChanges();
            const shipments = res.filter(
              (item) => item.type == 'node' && item.d.entity == Entites.SHIPMENT
            ) as Node[];
            this.combineShipments(shipments);
          }
        }

        this.applyTheme();
        this.chartService.layout('adaptive');
      });
  }

  private openedRoute: {
    item?: Link;
    route?: (Node | Link)[];
  } = {};

  fetchRoute(edgeId: string) {
    this.apiService
      .fetchRoute(edgeId)
      .pipe(
        map((res) =>
          res.filter(
            (item) => !this.data.find((dataItem) => item.id == dataItem.id)
          )
        )
      )
      .subscribe(async (res) => {
        if (!res.length) return;

        this.openedRoute.route = res;

        res.forEach((item) => {
          this.chartService.chart.setItem(item);
        });

        this.chartService.graph.load(this.chartService.chart.serialize());

        this.openedRoute.item = this.chartService.chart.getItem(edgeId) as Link;

        this.chartService.chart.removeItem(edgeId);

        this.applyTheme();
        this.chartService.layout('adaptive');
      });
  }

  restoreRoute() {
    if (!this.openedRoute.item) return;

    if (this.openedRoute.item) {
      this.chartService.chart.setItem(this.openedRoute.item);
    }

    if (this.openedRoute.route?.length) {
      const ids = this.openedRoute.route.map((item) => item.id);
      this.chartService.chart.removeItem(ids);
    }

    this.openedRoute = {};

    this.chartService.graph.load(this.chartService.chart.serialize());
    this.applyTheme();
    this.chartService.layout('adaptive');
  }
  async afterCombine() {
    return this.chartService.layout('adaptive').then(() => {
      this.foregroundSelection([]);
      this.applyTheme();
    });
  }

  unCombineShipments(shipmentCombos: Node[]) {
    return this.chartService.chart.combo().uncombine(
      shipmentCombos.map((combo) => combo.id),
      { full: true, select: false, animate: false }
    );
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

    // this.fetchNodes('DC7');
    // this.fetchNodes('P6');
  }
  klChartEvents({ name, args }: ChartEvents) {
    if (name == 'selection-change') {
      this.onSelection();
    }

    if (name == 'double-click') {
      this.restoreRoute();

      const [id] = this.chartService.chart.selection();

      if (!id) return;
      const item = this.chartService.chart.getItem(id);

      if (!item) return;

      if (item.type == 'link') {
        this.fetchRoute(id);
      }

      if (item.type == 'node') {
        this.fetchNodes(id);
      }
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

      if (item.d?.entity == 'Shipment') {
        glyphs = this.generateShipmentGlyphs(item.d);
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

  private generateShipmentGlyphs(data: any): Glyph[] {
    if (!data?.excursion?.length) return [];

    const excursionGlyph: Glyph = {
      p: 'ne',
      e: 1,
      c: 'red',
      t: data?.excursion?.length || 0,
      fc: 'white',
    };
    return [excursionGlyph];
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
      const tooltipContext = this.getTooltipContext(item?.d, item.d?.entity);

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
      tooltipHtml = `<b>Location:</b> ${data?.['name'] || ''}`;
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
