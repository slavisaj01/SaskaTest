import { Component, Input, SimpleChanges} from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { Transaction } from '../../../models/transaction';
import { EChartsOption } from 'echarts/types/dist/shared';
import { groupBy, sumBy } from 'lodash';

@Component({
  selector: 'app-treemap-graph',
  imports: [NgxEchartsModule],
  templateUrl: './treemap-graph.component.html',
  styleUrl: './treemap-graph.component.scss'
})
export class TreemapGraphComponent {
 @Input() transactions: Transaction[] = [];

  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] && this.transactions) {
      this.updateChart(this.transactions);
    }
  }

  updateChart(transactions: Transaction[]): void {
    // Filtriramo samo transakcije koje imaju kategoriju
    const filtered = transactions.filter(
      t => t.category && t.category.trim() !== ''
    );

    // Ako podkategorija fali, dodeljujemo "Other"
    const enriched = filtered.map(t => ({
      ...t,
      subcategory: t.subcategory && t.subcategory.trim() !== '' ? t.subcategory : 'Other'
    }));

    const groupedByCategory = groupBy(enriched, 'category');

    const data = Object.entries(groupedByCategory).map(([category, txns]) => {
      const groupedBySub = groupBy(txns, 'subcategory');

      const children = Object.entries(groupedBySub).map(([sub, subTxns]) => ({
        name: sub,
        value: sumBy(subTxns, 'amount')
      }));

      return {
        name: category,
        value: sumBy(txns, 'amount'),
        children
      };
    });

    this.chartOptions = {
      tooltip: {
        formatter: (info: any) => `${info.name}: ${info.value.toFixed(2)} RSD`
      },
      series: [
        {
          type: 'treemap',
          data,
          leafDepth: 1,
          visibleMin: 100,
          roam: false,
          label: {
            show: true,
            formatter: (params: any) => `${params.name}\n${params.value.toFixed(2)} RSD`,
            position: 'inside',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 12
          },
          labelLayout: {
            hideOverlap: false
          },
          breadcrumb: {
            show: true
          }
        }
      ]
    };
  }

}


