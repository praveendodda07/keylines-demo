import {
  Chart,
  ChartOptions,
  Graph,
  IdMap,
  ImageAlignmentOptions,
} from 'keylines';

export class ChartService {
  private _chart!: Chart;
  private _graph!: Graph;

  private chartOptions: ChartOptions = {
    drag: {
      links: false,
      panAtBoundary: false,
    },
    overview: { icon: false },
    truncateLabels: { maxLength: 15 },
    // imageAlignment: this.imageAlignment,
    //   selectedNode: theme.selectedNode,
    //   selectedLink: theme.selectedLink,
    // logo: { u: '/assets/Logo.png' },
    iconFontFamily: 'Font Awesome 5 Free Solid',
    arrows: 'small',
    linkEnds: { avoidLabels: false },
    minZoom: 0.02,
    handMode: true,
    zoom: {
      adaptiveStyling: true,
    },
  };

  private imageAlignmentDefinitions: IdMap<ImageAlignmentOptions> = {
    'fa-user': { dy: -10, e: 0.9 },
    'fa-boxes': { dy: -10, e: 0.8 },
    'fa-truck': { dy: 0, e: 0.8 },
    'fa-route': { dy: 0, e: 0.8 },
    'fa-sitemap': { dy: 0, e: 0.8 },
    'fa-users': { dy: 0, e: 0.8 },
    'fa-globe-americas': { dy: 0, e: 1.4 },
    'fa-warehouse': { dy: 0, e: 0.8 },
    'fa-industry': { dy: 0, e: 0.8 },
    'fa-truck-moving': { dy: 0, e: 0.8 },
    'fa-plane': { dy: 0, e: 0.8 },
  };

  get chart() {
    return this._chart;
  }

  get graph() {
    return this._graph;
  }

  constructor() {
    this.configureImageAlignments();
  }

  private configureImageAlignments() {
    const icons = Object.keys(this.imageAlignmentDefinitions);

    let imageAlignment: IdMap<ImageAlignmentOptions> = {};

    icons.forEach((icon) => {
      imageAlignment[KeyLines.getFontIcon(icon)] =
        this.imageAlignmentDefinitions[icon];
    });

    this.setChartOptions({ imageAlignment });
  }

  public setChartOptions(chartOptions: ChartOptions) {
    this.chartOptions = { ...this.chartOptions, ...chartOptions };
    return this.getChartOptions();
  }

  public getChartOptions() {
    return this.chartOptions;
  }

  public initializeChart(chart: Chart) {
    this._chart = chart;
  }

  public initizeGraph(graph: Graph) {
    this._graph = graph;
  }
  public layout(mode?: 'full' | 'adaptive') {
    return this.chart.layout('organic', { mode });
  }
}
