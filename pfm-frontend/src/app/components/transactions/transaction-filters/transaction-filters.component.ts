import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-transaction-filters',
  templateUrl: './transaction-filters.component.html',
  styleUrls: ['./transaction-filters.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ]
})
export class TransactionFiltersComponent{
  @Input() kinds: string[] = [];
  @Output() kindSelected = new EventEmitter<string>();
  @Output() dateRangeSelected = new EventEmitter<{ from: Date | null, to: Date | null }>();
  @Output() filtersReset = new EventEmitter<void>();
  transactionKindMap: { [key: string]: string } = {
    All: 'All',
    dep: 'Deposit',
    wdw: 'Withdrawal',
    pmt: 'Payment',
    fee: 'Fee',
    inc: 'Interest credit',
    rev: 'Reversal',
    adj: 'Adjustment',
    lnd: 'Loan disbursement',
    lnr: 'Loan repayment',
    fcx: 'Foreign currency exchange',
    aop: 'Account opening',
    acl: 'Account closing',
    spl: 'Split payment',
    sal: 'Salary'
  };

  kindsWithAll: string[] = [];
  selectedKind: string='All';
  //kasnije za datum
  fromDate: Date | null = null;
  toDate: Date | null = null;



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['kinds']) {
      this.kindsWithAll = ['All', ...this.kinds];
    }
  }

  onKindChange(kind: string): void {
    this.selectedKind = kind;
    this.kindSelected.emit(kind);
  }

  emitDateRange(): void {
    this.dateRangeSelected.emit({ from: this.fromDate, to: this.toDate });
  }

  resetFilters(): void {
    this.selectedKind = 'All';
    this.fromDate = null;
    this.toDate = null;
    this.kindSelected.emit(this.selectedKind);
    this.dateRangeSelected.emit({ from: null, to: null });
    this.filtersReset.emit();
  }
}
