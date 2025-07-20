import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../models/transaction';
import { TreemapGraphComponent } from '../treemap-graph/treemap-graph.component';
// import { PieChartComponent } from '../pie-chart/pie-chart.component'; // kasnije dodaj
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-charts-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    TreemapGraphComponent,
    MatIcon
    // PieChartComponent, // kad napraviš
  ],
  templateUrl: './charts-overview.component.html',
  styleUrl: './charts-overview.component.scss'
})
export class ChartsOverviewComponent {
  @Input() transactions: Transaction[] = [];

  selectedChart: string = 'treemap'; // default
  chartTypes = [
    { value: 'treemap', label: 'Treemap' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'donut', label: 'Donut Chart' }
  ];

  cards = [
  {
    id: 1,
    name: 'Karthik P',
    number: '4642 3489 9867 7632',
    valid: '11/15',
    expiry: '03/25',
    bgImage: 'https://i.imgur.com/kGkSg1v.png',
    logo: 'https://i.imgur.com/bbPHJVe.png'
  },
  {
    id: 2,
    name: 'Karthik P',
    number: '4642 3489 9867 7632',
    valid: '11/15',
    expiry: '03/25',
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

}
