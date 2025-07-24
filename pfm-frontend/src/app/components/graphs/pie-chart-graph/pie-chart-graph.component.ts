import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { Transaction } from '../../../models/transaction';


@Component({
  selector: 'app-pie-chart-graph',
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './pie-chart-graph.component.html',
  styleUrls: ['./pie-chart-graph.component.scss']
})
export class PieChartGraphComponent {
  @Input() transactions: Transaction[] = [];

  get chartOptions(): any {
    const categoryMap = new Map<string, number>();

    for (const tx of this.transactions) {
      if (!tx.category || tx.direction !== 'd') continue;
      categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
    }

    const data = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#fff'
        }
      },
      series: [
        {
          name: 'Spending',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data
        }
      ]
    };
  }
}
