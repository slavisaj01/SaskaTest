import { Component, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { Transaction } from '../../../models/transaction';
import type { EChartsOption } from 'echarts';
import type { ECharts } from 'echarts/core';

@Component({
  selector: 'app-pie-chart-graph',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './pie-chart-graph.component.html',
  styleUrls: ['./pie-chart-graph.component.scss'],
})
export class PieChartGraphComponent {
  @Input() transactions: Transaction[] = [];
  public echartsInstance?: ECharts;
  public chartOptions: EChartsOption = {};
  private currentCategory: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  onChartInit(ec: ECharts) {
    this.echartsInstance = ec;

    ec.on('legendselectchanged', (params: any) => {
      if (!params?.name) return;
      this.currentCategory = params.name;
      this.generateChart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions']) {
      this.generateChart();
    }
  }

  generateChart(): void {
    const isMobile = window.innerWidth <= 768;

    if (!this.currentCategory) {
      const categoryMap = new Map<string, number>();
      for (const tx of this.transactions) {
        if (!tx.category || tx.direction !== 'd') continue;
        categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
      }

      const data = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      this.chartOptions = {
        tooltip: {
          trigger: 'item' as const,
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          type: 'scroll',
          orient: isMobile ? 'horizontal' : 'vertical',
          bottom: isMobile ? 0 : undefined,
          left: isMobile ? 'center' : 'left',
          textStyle: { color: '#fff' },
          pageIconColor: '#3D58ED',        
          pageIconInactiveColor: '#8A8A8A',
          pageTextStyle: { color: '#fff' } 
        },
        series: [
          {
            name: 'Categories',
            type: 'pie',
            radius: ['40%', '70%'],
            label: { show: false },
            labelLine: { show: false },
            selectedMode: 'single',
            data,
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
            },
          },
        ],
        graphic: [],
      };
      this.cdr.detectChanges(); // trigger render
    } else {
      const subMap = new Map<string, number>();
      for (const tx of this.transactions) {
        if (tx.category !== this.currentCategory || tx.direction !== 'd') continue;
        const sub = tx.subcategory?.trim() || 'Other';
        subMap.set(sub, (subMap.get(sub) || 0) + tx.amount);
      }

      const data = Array.from(subMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      this.chartOptions = {
        tooltip: {
          trigger: 'item' as const,
          formatter: '{b}: {c} ({d}%)',
        },
        title: {
          text: this.currentCategory,
          left: 'center',
          top: 10,
          textStyle: {
            color: '#fff',
            fontSize: 16,
          },
        },
        legend: {
          orient: isMobile ? 'horizontal' : 'vertical',
          bottom: isMobile ? 0 : undefined,
          left: isMobile ? 'center' : 'left',
          textStyle: { color: '#fff' },
          selectedMode: false
        },
        series: [
          {
            name: 'Subcategories',
            type: 'pie',
            radius: ['40%', '70%'],
            label: { show: false },
            labelLine: { show: false },
            data,
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
            },
          },
        ],
        graphic: [
          {
            type: 'text',
            left: 'left',
            top:'90%',
            style: {
              text: '< Back',
              fill: '#3D58ED',
              font: 'bold 14px sans-serif',
            },
            onclick: () => {
              this.currentCategory = null;
              this.generateChart();
            },
          },
        ],
      };

      this.cdr.detectChanges(); 
    }
  }
}
