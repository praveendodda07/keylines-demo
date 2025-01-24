import { Component, OnInit } from '@angular/core';

import type {
  Chart,
  ChartOptions,
  ChartAllEventProps,
  ChartPointerEventProps,
  ImageAlignmentOptions,
  IdMap,
  Graph,
  NodeProperties,
  Node,
  DragStartEventProps,
  ChartEventHandlers,
  CombineOptions,
  ComboArrangement,
  Glyph,
  LinkProperties,
} from 'keylines';

import {
  data,
  getRegion,
  theme,
  getRegionTheme,
  countryComboArrangement,
  countryAliases,
} from './combo2-data.js';
import { ChartEvents } from '../@types/chart.types.js';

export class Tooltip {
  constructor(
    public start: string,
    public end: string,
    public left: string,
    public top: string,
    public tooltipClass: string,
    public arrowClass: string
  ) {}
}

@Component({
  selector: 'app-combo',
  templateUrl: './combo.component.html',
  styleUrl: './combo.component.scss',
})
export class ComboComponent implements OnInit {
  private chart!: Chart;
  private graph!: Graph;

  isDragging = false;
  comboAnimations: any = {};

  combinedByCountry = false;
  combinedByRegion = false;

  buttonsEnabledStates = {
    combineCountry: true,
    combineRegion: true,
    uncombine: false,
    openall: false,
    layout: true,
  };

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

  getCountryGlyph(item: Node): Glyph | null {
    if (!item.d.country || item.d.country === 'Unknown Country') {
      return null;
    }
    let countryFormatted = item.d.country.toLowerCase().replace(/ /g, '-');
    if (countryFormatted in countryAliases) {
      countryFormatted = (countryAliases as any)[countryFormatted];
    }
    return { p: 'ne', u: `./assets/im/flag-icons/${countryFormatted}.svg` };
  }

  applyTheme() {
    const props: NodeProperties[] = [];
    this.chart.each({ type: 'node' }, (item) => {
      const rTheme = getRegionTheme(getRegion(item.d.country));
      const countryGlyph = this.getCountryGlyph(item);
      const g = countryGlyph !== null ? [countryGlyph] : [];
      props.push({
        id: item.id,
        u: undefined,
        g,
        c: rTheme.iconColour,
        fi: { t: KeyLines.getFontIcon('fa-user'), c: 'white' },
        b: theme.borderColour,
        bw: 2,
      });
    });
    // node styles
    this.chart.setProperties(props);
    // link styles
    this.chart.setProperties(
      { id: 'p', c: theme.linkColour, w: 3 },
      true /* regex */
    );
  }

  klChartReady([chart]: [Chart]) {
    this.chart = chart;
    this.chart.load(data);

    this.graph = KeyLines.getGraphEngine();
    this.graph.load(this.chart.serialize());

    // FIXME:
    this.applyTheme();

    this.onSelection();
    setTimeout(() => {
      this.layout();
    }, 1500);
    // this.chart.on('all', (evt) => {
    //   if (
    //     ![
    //       'pointer-move',
    //       'drag-end',
    //       'pointer-up',
    //       'drag-move',
    //       'view-change',
    //       'drag-start',
    //     ].includes(evt.name)
    //   ) {
    //     console.log(evt.name);
    //   }
    // });
  }

  layout(mode?: 'full' | 'adaptive') {
    return this.chart.layout('organic', { mode });
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

  onSelection() {
    // grab current selection
    const selectedIds = this.chart.selection();

    // filter out any combo items to get only the underlying selection
    const ids = selectedIds.filter((id) => !this.chart.combo().isCombo(id));
    // remove the combos from the selection
    this.chart.selection(ids);
    // foreground the filtered selection of items and their connections
    this.foregroundSelection(ids);
  }

  isCombo(ids: string | string[], type: 'node' | 'link' | 'all' = 'node') {
    return this.chart.combo().isCombo(ids, { type });
  }

  openOrCloseCombo(ids: string | string[], open: boolean, cb?: Function) {
    if (Object.keys(this.comboAnimations).length > 0) {
      return false;
    }
    const action = open ? this.chart.combo().open : this.chart.combo().close;
    let targets = Array.isArray(ids) ? ids : [ids];
    targets = targets.filter((id) => {
      if (
        !this.chart.combo().isCombo(id) ||
        this.chart.combo().isOpen(id) === open
      ) {
        return false;
      }
      this.comboAnimations[id] = true;
      return true;
    });
    action(targets, { adapt: 'inCombo', time: 300 })
      .then(() => (targets.length > 0 ? this.layout('adaptive') : null))
      .then(() => {
        targets.forEach((id) => {
          delete this.comboAnimations[id];
        });
        if (cb) {
          cb();
        }
      });
    return targets.length > 0;
  }

  closeCombo(ids: string | string[], cb?: Function) {
    return this.openOrCloseCombo(ids, false, cb);
  }

  openCombo(ids: string | string[], cb?: Function) {
    return this.openOrCloseCombo(ids, true, cb);
  }

  getAllComboIds() {
    const comboIds: string[] = [];
    this.chart.each({ type: 'node', items: 'all' }, ({ id }) => {
      if (this.chart.combo().isCombo(id)) {
        comboIds.push(id);
      }
    });
    return comboIds;
  }

  klChartEvents({ name, args }: ChartEvents) {
    if (name == 'selection-change') {
      this.onSelection();
    }

    if (name == 'drag-start') {
      const { type, id, setDragOptions } = args as DragStartEventProps;

      if (
        type === 'node' &&
        id &&
        this.chart.combo().isOpen(id) &&
        !this.chart.options().handMode
      ) {
        setDragOptions({ type: 'marquee' });
      }
      this.isDragging = true;
    }

    if (name == 'drag-end') {
      this.isDragging = false;
    }

    if (name == 'double-click') {
      const { id, preventDefault, button } = args as ChartPointerEventProps;
      if (id && button === 0) {
        if (this.isCombo(id)) {
          if (this.chart.combo().isOpen(id)) {
            this.closeCombo(id);
          } else {
            this.openCombo(id);
          }
        }
        preventDefault();
      }
    }
  }

  combineCountries() {
    this.enableInput(
      ['combineCountry', 'combineRegion', 'uncombine', 'openall', 'layout'],
      false
    );
    this.combinedByCountry = true;
    this.combine(this.byCountry, countryComboArrangement).then(() =>
      this.afterCombine()
    );
  }

  combineRegions() {
    const regionArrange = this.getRegionArrangement();
    this.enableInput(
      ['combineCountry', 'combineRegion', 'uncombine', 'openall', 'layout'],
      false
    );
    this.combinedByRegion = true;
    if (this.combinedByCountry) {
      this.combine(this.byRegion, regionArrange).then(() =>
        this.afterCombine()
      );
    } else {
      this.combine(this.byCountry, countryComboArrangement).then(() => {
        this.combine(this.byRegion, regionArrange).then(() =>
          this.afterCombine()
        );
      });
    }
  }

  uncombineAll() {
    const combos: string[] = [];
    this.chart.each({ type: 'node', items: 'toplevel' }, (node) => {
      if (this.chart.combo().isCombo(node.id)) {
        combos.push(node.id);
      }
    });
    if (combos.length) {
      this.enableInput(['uncombine', 'openall', 'layout'], false);
      this.chart
        .combo()
        .uncombine(combos, { full: true, select: false })
        .then(() => {
          this.layout('adaptive').then(() => {
            this.combinedByCountry = false;
            this.combinedByRegion = false;
            this.enableInput(
              ['combineCountry', 'combineRegion', 'layout'],
              true
            );
            this.applyTheme();
          });
        });
    }
  }

  getRegionArrangement() {
    return this.chart.options().combos?.shape === 'rectangle'
      ? 'grid'
      : 'concentric';
  }

  enableInput(
    ids: (keyof typeof this.buttonsEnabledStates)[],
    enabled: boolean
  ) {
    ids.forEach((id) => {
      this.buttonsEnabledStates[id] = enabled;
    });
  }

  afterCombine() {
    this.layout('adaptive').then(() => {
      this.enableInput(
        ['openall', 'combineRegion', 'uncombine', 'layout'],
        true
      );
      this.enableInput(['combineRegion'], !this.combinedByRegion);
    });
    // reset foregrounded items when nodes are combined
    this.foregroundSelection([]);
    this.applyTheme();
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
  byRegion(item: Node) {
    return item.d.region || null;
  }

  byCountry(item: Node) {
    return item.d.country || null;
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

  combine(criteria: Function, arrange: ComboArrangement) {
    const options: CombineOptions = {
      arrange,
      animate: true,
      time: 1500,
      select: false,
    };
    const groups = this.groupNodesBy(criteria);
    const toClose: any[] = [];
    const combineArray: any[] = [];
    Object.keys(groups).forEach((group) => {
      toClose.push(...groups[group]);
      // ignore the 'unknown region'
      if (group !== 'Unknown Region') {
        const firstItem = this.chart.getItem(groups[group][0]);
        const isRegion = firstItem?.d.region !== undefined;
        const region = isRegion
          ? firstItem.d.region
          : getRegion(firstItem?.d.country);
        const rTheme = getRegionTheme(region);
        const combineIds = {
          ids: groups[group],
          d: { region, isRegion },
          label: group,
          glyph: null,
          style: {
            e: Math.sqrt(this.getNodeSize(groups[group])),
            c: isRegion ? 'white' : rTheme.iconColour,
            fc: 'rgb(100,100,100)',
            fs: isRegion ? theme.regionFontSize : theme.countryFontSize,
            fi: {
              t: KeyLines.getFontIcon(
                isRegion ? 'fa-globe-americas' : 'fa-users'
              ),
              c: isRegion ? rTheme.iconColour : 'white',
            },
            bw: 2,
            b: isRegion ? null : theme.borderColour,
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
    console.log(comboIds);

    const props: any = this.getNodeLinks(comboIds).map((id) => ({
      id,
      w: this.getLinkSize(id),
    }));
    return this.chart.setProperties(props, false);
  }

  getNodeLinks(nodeId: string[]): string[] {
    console.log(nodeId);

    return this.chart.graph().neighbours(nodeId).links || [];
  }

  getLinkSize(id: string) {
    if (this.isCombo(id, 'link')) {
      // set the link thickness
      return 3 * Math.sqrt(this.chart.combo().info(id)?.links.length || 0);
    }
    return 3;
  }
}
