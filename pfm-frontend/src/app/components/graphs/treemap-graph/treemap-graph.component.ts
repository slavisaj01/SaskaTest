import { Component, Input, SimpleChanges } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { Transaction } from '../../../models/transaction';
import { EChartsOption } from 'echarts/types/dist/shared';
import { groupBy, sumBy } from 'lodash';
import type { ECharts } from 'echarts/core';

@Component({
  selector: 'app-treemap-graph',
  imports: [NgxEchartsModule],
  templateUrl: './treemap-graph.component.html',
  styleUrl: './treemap-graph.component.scss',
  standalone: true
})
export class TreemapGraphComponent {
  @Input() transactions: Transaction[] = [];

  // ✅ NOVO: glavne i podkategorije koje stižu iz backend-a
  @Input() categories: { code: string; name: string; parentCode?: string | null }[] = [];

  chartOptions: EChartsOption = {};
  public echartsInstance?: ECharts;

  private baseColors: string[] = [
    '#3D58ED', '#9B51E0', '#F299CA', '#2F80ED', '#56CCF2', '#EB5757',
    '#F2C94C', '#6FCF97', '#BB6BD9', '#8A8A8A', '#333333', '#D980FA',
    '#F8C471', '#B2BABB', '#AED6F1', '#D7BDE2', '#F5B7B1', '#CACFD2',
    '#F1948A', '#A569BD',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] && this.transactions) {
      this.updateChart(this.transactions);
    }
  }

  onChartInit(instance: ECharts): void {
    this.echartsInstance = instance;
  }

  // ✅ Helper za prikaz imena glavne kategorije po cat-code
  getCategoryName(code: string): string {
    const category = this.categories.find(c => c.code === code && !c.parentCode);
    return category?.name ?? code;
  }

  updateChart(transactions: Transaction[]): void {
    const filtered = transactions.filter(t => t.category && t.category.trim() !== '');

    const enriched = filtered.map(t => ({
      ...t,
      subcategory: t.subcategory && t.subcategory.trim() !== '' ? t.subcategory : 'Other',
    }));

    const groupedByCategory = groupBy(enriched, 'category');

    const data = Object.entries(groupedByCategory).map(([category, txns], index) => {
      const baseColor = this.baseColors[index % this.baseColors.length];

      const groupedBySub = groupBy(txns, 'subcategory');
      const children = Object.entries(groupedBySub).map(([sub, subTxns], subIndex) => ({
        name: sub,
        value: sumBy(subTxns, 'amount'),
        itemStyle: {
          color: this.shadeColor(baseColor, 20 + subIndex * 8),
        },
      }));

      return {
        name: this.getCategoryName(category), // ✅ Ovde prikazuje ime, ne kod
        value: sumBy(txns, 'amount'),
        children,
        itemStyle: {
          color: baseColor,
        },
      };
    });

    this.chartOptions = {
      tooltip: {
        formatter: (info: any) => `${info.name}: ${info.value.toFixed(2)} RSD`,
      },
      series: [
        {
          type: 'treemap',
          data,
          leafDepth: 1,
          roam: false,
          visibleMin: 0,
          label: {
            show: true,
            formatter: (params: any) => `${params.name}\n${params.value.toFixed(2)} RSD`,
            position: 'inside',
            color: '#fff',
            fontSize: 12,
          },
          labelLayout: { hideOverlap: false },
          breadcrumb: {
            show: true,
            top: 0,
            itemStyle: {
              color: '#3D58ED',
              borderColor: '#3D58ED',
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: {
                color: '#3D58ED',
                borderColor: '#3D58ED',
              },
            },
          },
          nodeClick: 'zoomToNode',
          animation: false,
          animationDuration: 0,
          animationDurationUpdate: 0,
          animationEasing: 'linear',
          animationEasingUpdate: 'linear',
          levels: [
            {
              itemStyle: {
                borderColor: '#1a1a1a',
                borderWidth: 2,
                gapWidth: 3,
              },
            },
            {
              itemStyle: {
                gapWidth: 2,
                borderColorSaturation: 0.6,
              },
            },
          ],
        },
      ],
    };
  }

  // Utility: lightens or darkens a hex color by percent
  private shadeColor(hex: string, percent: number): string {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    return `rgb(${r},${g},${b})`;
  }
}
