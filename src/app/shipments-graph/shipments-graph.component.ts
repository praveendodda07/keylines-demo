import { Component } from '@angular/core';
import { Chart } from 'keylines';

@Component({
  selector: 'app-shipments-graph',
  templateUrl: './shipments-graph.component.html',
  styleUrl: './shipments-graph.component.scss',
})
export class ShipmentsGraphComponent {
  chart!: Chart;

  klChartReady([chart]: [Chart]) {
    this.chart = chart;
    //   this.timebar = timebar;
    //   chartData.items.forEach((element) => {
    //     if (element.type === 'node') {
    //       element.fi = {
    //         c: this.greyColours[0],
    //         t: KeyLines.getFontIcon(
    //           element.d.type === 'person' ? '.fa .fa-user' : '.fa .fa-building'
    //         ),
    //       };
    //     }
    //   });
    // this.chart.load(data as any);

    // this.graph = KeyLines.getGraphEngine();
    // this.graph.load(this.chart.serialize());

    // // FIXME:
    // this.applyTheme();
    // this.layout();

    // // setUpEventHandlers();
    // // // set up the initial look
    // this.onSelection();
  }
}
