import {
  Chart,
  ChartOptions,
  Graph,
  IdMap,
  ImageAlignmentOptions,
} from 'keylines';

export class ChartService {
  private _chart!: Chart;
  public graph!: Graph;

  private chartOptions: ChartOptions = {
    drag: {
      links: false,
      panAtBoundary: false,
    },
    truncateLabels: { maxLength: 15 },
    // imageAlignment: this.imageAlignment,
    //   selectedNode: theme.selectedNode,
    //   selectedLink: theme.selectedLink,
    // logo: { u: '/assets/Logo.png' },
    iconFontFamily: 'Font Awesome 5 Free Solid',
    linkEnds: { avoidLabels: false },
    minZoom: 0.02,
    handMode: true,
  };

  private imageAlignmentDefinitions: IdMap<ImageAlignmentOptions> = {
    'fa-user': { dy: -10, e: 0.9 },
    'fa-boxes': { dy: -10, e: 0.8 },
    'fa-truck': { dy: 0, e: 0.8 },
    'fa-route': { dy: 0, e: 0.8 },
    'fa-sitemap': { dy: 0, e: 0.8 },
    'fa-users': { dy: 0, e: 0.8 },
    'fa-globe-americas': { dy: 0, e: 1.4 },
  };

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

  get chart() {
    return this._chart;
  }
}
