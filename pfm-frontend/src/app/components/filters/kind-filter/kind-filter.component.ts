import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-kind-filter',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './kind-filter.component.html',
  styleUrl: './kind-filter.component.scss'
})
export class KindFilterComponent {
  @Input() kinds: string[] = [];
  @Input() selectedKind: string = 'All';
  @Output() kindSelected = new EventEmitter<string>();

  kindLabels: { [key: string]: string } = {
    All: 'All',
    dep: 'Deposit',
    wdw: 'Withdrawal',
    pmt: 'Payment',
    fee: 'Fee',
    inc: 'Interest Credit',
    rev: 'Reversal',
    adj: 'Adjustment',
    lnd: 'Loan Disbursement',
    lnr: 'Loan Repayment',
    fcx: 'FX Exchange',
    aop: 'Account Opening',
    acl: 'Account Closing',
    spl: 'Split Payment',
    sal: 'Salary',
  };

  getLabel(kind: string): string {
    return this.kindLabels[kind] || kind;
  }

  onSelectionChange(kind: string) {
    this.kindSelected.emit(kind);
  }
}

