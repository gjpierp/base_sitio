import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'ui-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-chart.component.html',
  styleUrls: ['./ui-chart.component.css'],
})
export class UiChartComponent implements AfterViewInit, OnChanges {
  @Input() type: 'bar' | 'line' | 'pie' = 'bar';
  @Input() data: any;
  @Input() options: any;
  @Input() width: string = '100%';
  @Input() height: string = '320px';

  private chart: any;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      this.chart.destroy();
      this.renderChart();
    }
  }

  private async renderChart() {
    const Chart = (await import('chart.js/auto')).default;
    const canvas = this.el.nativeElement.querySelector('canvas');
    if (canvas && Chart) {
      this.chart = new Chart(canvas, {
        type: this.type,
        data: this.data,
        options: this.options,
      });
    }
  }
}
