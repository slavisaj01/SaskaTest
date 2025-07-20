import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DateFilterComponent {
  fromDate: Date | null = null;
  toDate: Date | null = null;

  @Output() dateRangeSelected = new EventEmitter<{ from: Date | null; to: Date | null }>();

  onDateChange(): void {
    this.dateRangeSelected.emit({ from: this.fromDate, to: this.toDate });
  }
}
