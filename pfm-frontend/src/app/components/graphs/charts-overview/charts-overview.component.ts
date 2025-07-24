import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../models/transaction';
import { TreemapGraphComponent } from '../treemap-graph/treemap-graph.component';
import { MatIcon } from '@angular/material/icon';
import { PieChartGraphComponent } from '../pie-chart-graph/pie-chart-graph.component';
import { ChartService } from '../../../services/chart.service';
@Component({
  selector: 'app-charts-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    TreemapGraphComponent,
    PieChartGraphComponent
  ],
  templateUrl: './charts-overview.component.html',
  styleUrl: './charts-overview.component.scss'
})
export class ChartsOverviewComponent {
  @Input() transactions: Transaction[] = [];
  
  showCards = false;
  selectedChart: string = 'treemap'; // default
  chartTypes = [
    { value: 'treemap', label: 'Treemap' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'bar', label: 'Bar Chart' }
  ];

  cards = [
  {
    id: 1,
    name: 'Trpkov Aleksandra',
    number: '4642 3489 9867 7632',
    valid: '11/15',
    expiry: '03/27',
    bgImage: 'https://i.imgur.com/kGkSg1v.png',
    logo: 'https://i.imgur.com/bbPHJVe.png'
  },
  {
    id: 2,
    name: 'Trpkov Aleksandra',
    number: '4642 3489 9867 7632',
    valid: '11/15',
    expiry: '03/27',
    bgImage: 'https://i.imgur.com/Zi6v09P.png',
    logo: 'https://i.imgur.com/bbPHJVe.png'
  }
];


  onChartChange(): void {
    console.log('Chart changed to:', this.selectedChart);
  }

  get selectedChartLabel(): string {
    return this.chartTypes.find(ct => ct.value === this.selectedChart)?.label ?? '';
  }

  get hasDataToDisplay(): boolean {
    return this.transactions.some(t => t.category && !t.isSplit);
  }

  constructor(private chartsService: ChartService) {
    this.chartsService.showCards$.subscribe(value => {
      this.showCards = value;
      setTimeout(() => {
        this.treemapComponent?.echartsInstance?.resize();
      }, 100); 
    });
  }


  @ViewChild(TreemapGraphComponent) treemapComponent?: TreemapGraphComponent;


}
