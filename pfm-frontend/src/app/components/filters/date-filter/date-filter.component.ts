import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule, MatDateRangeInput, MatDateRangePicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatNativeDateModule,
    MatDateRangeInput,
    MatDateRangePicker
  ],
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DateFilterComponent {
  dateRange: { begin: Date | null; end: Date | null } = { begin: null, end: null };

  @Output() dateRangeSelected = new EventEmitter<{ from: Date | null; to: Date | null }>();

  onDateChange(): void {
  this.dateRangeSelected.emit({
    from: this.dateRange.begin,
    to: this.dateRange.end
  });
}


}
