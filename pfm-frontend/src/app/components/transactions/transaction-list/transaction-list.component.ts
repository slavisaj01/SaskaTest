import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Transaction } from '../../../models/transaction';
import { TransactionService } from '../../../services/transaction.service';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';

import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { KindFilterComponent } from '../../filters/kind-filter/kind-filter.component';
import { DateFilterComponent } from '../../filters/date-filter/date-filter.component';
import { ChartsOverviewComponent } from '../../graphs/charts-overview/charts-overview.component';
import { CategorizeTransactionDialogComponent } from '../../dialogs/categorize-transaction-dialog/categorize-transaction-dialog.component';
import { CategorizeMultipleTransactionsDialogComponent } from '../../dialogs/categorize-multiple-transactions-dialog/categorize-multiple-transactions-dialog.component';
import { SplitTransactionDialogComponent } from '../../dialogs/split-transaction-dialog/split-transaction-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    KindFilterComponent,
    DateFilterComponent,
    ChartsOverviewComponent,
    MatIcon,
    MatCheckbox,
    CommonModule,
    MatTableModule,
    FormsModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  transactionsCategories: Category[] = [];

  // Filteri
  kinds: string[] = [];
  selectedKind: string = 'All';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  showKindFilter: boolean = false;

  // Stanja
  isMultiSelectMode = false;
  expandedTransactionId: string | null = null;

  // Paginacija
  currentPage = 1;
  transactionsPerPage = 10;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.transactionService.getTransactions().subscribe((data) => {
      this.transactions = data.map(t => ({ ...t, selected: false }));
      this.kinds = [...new Set(this.transactions.map(t => t.kind))];
      this.applyAllFilters();
    });

    this.categoryService.getCategories().subscribe((categories) => {
      this.transactionsCategories = categories;
    });
  }

  // -------------------------
  // FILTERI
  // -------------------------
  onKindSelected(kind: string): void {
    this.currentPage = 1;
    this.selectedKind = kind;
    this.applyAllFilters();
  }

  onDateRangeSelected(range: { from: Date | null; to: Date | null }): void {
    this.currentPage = 1;
    this.fromDate = range.from;
    this.toDate = range.to;
    this.applyAllFilters();
  }

  toggleKindFilter(): void {
    this.showKindFilter = !this.showKindFilter;
  }

  private applyAllFilters(): void {
    let result = [...this.transactions];

    if (this.selectedKind !== 'All') {
      result = result.filter(t => t.kind === this.selectedKind);
    }

    if (this.fromDate) {
      result = result.filter(t => new Date(t.date) >= this.fromDate!);
    }

    if (this.toDate) {
      result = result.filter(t => new Date(t.date) <= this.toDate!);
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.filteredTransactions = result;
  }

  // -------------------------
  // DIALOGI
  // -------------------------
  openCategorizeDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(CategorizeTransactionDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: { transaction }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        transaction.category = result.category;
        transaction.subcategory = result.subcategory;

        this.transactionService.updateTransactionCategory(transaction.id, {
          category: result.category,
          subcategory: result.subcategory
        }).subscribe();
      }
    });
  }

  openSplitDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(SplitTransactionDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      data: transaction
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.length) {
        this.transactionService.splitTransactionApiStyle(transaction.id, result).subscribe(() => {
          this.onSplitCompleted();
        });
      }
    });
  }

  openMultiCategorizationDialog(): void {
    const selectedTransactions = this.filteredTransactions.filter(t => t.selected);

    const dialogRef = this.dialog.open(CategorizeMultipleTransactionsDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: {
        selectedCount: selectedTransactions.length,
        transactions: selectedTransactions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updateRequests = selectedTransactions.map(t =>
          this.transactionService.updateTransactionCategory(t.id, {
            category: result.category,
            subcategory: result.subcategory || ''
          })
        );

        forkJoin(updateRequests).subscribe(() => {
          selectedTransactions.forEach(t => {
            t.category = result.category;
            t.subcategory = result.subcategory || '';
            t.selected = false;
          });

          this.isMultiSelectMode = false;
        });
      }
    });
  }

  // -------------------------
  // MULTI SELECT
  // -------------------------
  toggleMultiSelect(): void {
    this.isMultiSelectMode = true;
    this.filteredTransactions.forEach(t => t.selected = false);
  }

  cancelMultiSelect(): void {
    this.isMultiSelectMode = false;
    this.filteredTransactions.forEach(t => t.selected = false);
  }

  hasSelectedTransactions(): boolean {
    return this.filteredTransactions.some(t => t.selected);
  }

  // -------------------------
  // SPLIT / ACCORDION
  // -------------------------
  toggleAccordion(id: string): void {
    this.expandedTransactionId = this.expandedTransactionId === id ? null : id;
  }

  getSplitLabel(catcode: string): { labelType: 'Category' | 'Subcategory', label: string } {
    const category = this.transactionsCategories.find(c => c.code === catcode);
    if (!category) return { labelType: 'Category', label: catcode };

    return category.parentCode
      ? { labelType: 'Subcategory', label: category.name }
      : { labelType: 'Category', label: category.name };
  }

  // -------------------------
  // REFRESH
  // -------------------------
  onSplitCompleted(): void {
    setTimeout(() => this.refreshTransactions(), 300);
  }

  refreshTransactions(): void {
    this.transactionService.getTransactions().subscribe((data) => {
      this.transactions = data.map(t => ({ ...t, selected: false }));
      this.applyAllFilters();
    });
  }

  // -------------------------
  // PAGINACIJA
  // -------------------------
  get paginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.transactionsPerPage;
    return this.filteredTransactions.slice(start, start + this.transactionsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.transactionsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get visiblePageNumbers(): (number | '...')[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;
    const range: (number | '...')[] = [];

    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push('...');

    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('...');
    if (total > 1) range.push(total);

    return range;
  }

  // -------------------------
  // KLIK VAN FILTERA
  // -------------------------
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.showKindFilter) {
      this.showKindFilter = false;
    }
  }

  // -------------------------
  // KOLONE
  // -------------------------
  get displayedColumns(): string[] {
    return this.isMultiSelectMode
      ? ['select', 'beneficiaryName', 'kind', 'direction', 'date', 'amount', 'category', 'split']
      : ['beneficiaryName', 'kind', 'direction', 'date', 'amount', 'category', 'split'];
  }
}
