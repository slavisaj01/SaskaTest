import { Component, OnInit, ElementRef, HostListener, viewChild, ViewChild } from '@angular/core';
import { Transaction } from '../../../models/transaction';
import { TransactionService } from '../../../services/transaction.service';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
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
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { ViewEncapsulation } from '@angular/core';
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
    FormsModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatButtonModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]

})
export class TransactionListComponent implements OnInit {
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  transactionsCategories: Category[] = [];

  totalItemCount = 0;
  kinds: string[] = [];
  selectedKind: string = 'All';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  isMultiSelectMode = false;
  expandedTransactionId: string | null = null;
  showChartView: boolean = false;
  drawerOpened = false;

  pendingKind: string = 'All';
  pendingFromDate: Date | null = null;
  pendingToDate: Date | null = null;

  currentPage = 1;
  transactionsPerPage = 10;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // this.transactionService.getTransactions().subscribe((data) => {
    //   this.transactions = data.map(t => ({ ...t, selected: false }));
    //   this.kinds = [...new Set(this.transactions.map(t => t.kind))];

    //   this.pendingKind = this.selectedKind;
    //   this.pendingFromDate = this.fromDate;
    //   this.pendingToDate = this.toDate;
    //   this.applyAllFilters();
    // });
    this.kinds = [
      'Deposit', 'Withdrawal', 'Payment', 'Fee', 'Interest Credit',
      'Reversal', 'Adjustment', 'Loan Disbursement', 'Loan Repayment',
      'FX Exchange', 'Account Opening', 'Account Closing', 'Split Payment', 'Salary'
    ];

    this.fetchTransactions();
    this.categoryService.getCategories().subscribe((categories) => {
      this.transactionsCategories = categories;
    });
  }

  fetchTransactions(): void {
    const kinds = this.selectedKind !== 'All' ? [this.selectedKind] : [];
    const startDateStr = this.fromDate?.toISOString().split('T')[0];
    const endDateStr = this.toDate?.toISOString().split('T')[0];

    this.transactionService.getTransactions({
      pageNumber: this.currentPage,
      pageSize: this.transactionsPerPage,
      kinds,
      startDate: startDateStr,
      endDate: endDateStr
    }).subscribe((res) => {
      this.transactions = res.items;
      this.filteredTransactions = res.items; // koristi isto za grafikone i multi-selekt
      this.totalItemCount = res.totalCount;
    });
  }

  refreshTransactions(): void {
    this.fetchTransactions();
  }

  // -------------------------
  // FILTERI
  // -------------------------
  onKindSelected(kind: string): void {
    this.currentPage = 1;
    this.pendingKind = kind;
  }

  onDateRangeSelected(range: { from: Date | null; to: Date | null }): void {
    this.currentPage = 1;
    this.pendingFromDate = range.from;
    this.pendingToDate = range.to;
  }

  toggleKindFilter(): void {
    this.drawerOpened = true;
    this.filterDrawer.toggle();
  }

  closeDrawer():void {
    this.drawerOpened = false;
    this.filterDrawer.close();
  }

  // private applyAllFilters(): void {
  //   let result = [...this.transactions];

  //   if (this.selectedKind !== 'All') {
  //     result = result.filter(t => t.kind === this.selectedKind);
  //   }

  //   if (this.fromDate) {
  //     result = result.filter(t => new Date(t.date) >= this.fromDate!);
  //   }

  //   if (this.toDate) {
  //     result = result.filter(t => new Date(t.date) <= this.toDate!);
  //   }

  //   result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  //   this.filteredTransactions = result;
  // }

  applyFilters(): void {
    this.selectedKind = this.pendingKind ?? 'All';
    this.fromDate = this.pendingFromDate;
    this.toDate = this.pendingToDate;
    this.currentPage = 1;
    // this.applyAllFilters(); 
     this.fetchTransactions();
  }

  onApplyAndClose():void{
    this.applyFilters(); 
    this.closeDrawer();  
  }

  clearFilters(): void {
    this.selectedKind = 'All';
    this.pendingKind = 'All';
    this.fromDate = null;
    this.toDate = null;
    this.pendingFromDate = null;
    this.pendingToDate = null;
    this.fetchTransactions();
    // this.applyFilters();
  } 
  // -------------------------
  // DIALOGI
  // -------------------------

  //KATEGORIZACIJA
  openCategorizeDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(CategorizeTransactionDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: { transaction }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const catcode = result.catcode;
        transaction.category = catcode;
        transaction.subcategory = catcode;
        this.transactionService.updateTransactionCategory(transaction.id, { catcode }).subscribe();
      }
    });
  }

  //MULTI KATEGORIZACIJA
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
        const catcode = result.catcode;
        const updateRequests = selectedTransactions.map(t =>
          // this.transactionService.updateTransactionCategory(t.id, {
          //   category: result.category,
          //   subcategory: result.subcategory || ''
          // })
           this.transactionService.updateTransactionCategory(t.id, { catcode })
        );

        forkJoin(updateRequests).subscribe(() => {
          selectedTransactions.forEach(t => {
            // t.category = result.category;
            // t.subcategory = result.subcategory || '';
            const category = this.transactionsCategories.find(c => c.code === catcode);
            if (category?.parentCode) {
              // Ako je subkategorija (ima parentCode), postavi i category i subcategory
              t.category = category.parentCode;
              t.subcategory = category.code;
            } else {
              // Ako je glavna kategorija, subcategory je prazno
              t.category = catcode;
              t.subcategory = '';
            }
            t.selected = false;
          });

          this.isMultiSelectMode = false;
        });
      }
    });
  }
  //SPLIT DIALOG
  openSplitDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(SplitTransactionDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      data: transaction
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.length) {
        this.transactionService.splitTransactionApiStyle(transaction.id, result).subscribe(() => {
          this.onSplitCompleted(transaction.id); 
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
  onSplitCompleted(transactionId: string): void {
      setTimeout(() => {
        this.refreshTransactions();
        this.expandedTransactionId = transactionId; 
        
        setTimeout(() => {
          const element = this.elementRef.nativeElement.querySelector(`[data-transaction-id="${transactionId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }, 300);
    }
  
    getMainCategoryLabel(catcode: string): string {
     const category = this.transactionsCategories.find(c => c.code === catcode);
     if (!category) return catcode;
     if (!category.parentCode) return category.name;
     const parent = this.transactionsCategories.find(c => c.code === category.parentCode);
     return parent?.name ?? catcode;
   }

  // refreshTransactions(): void {
  //   this.transactionService.getTransactions().subscribe((data) => {
  //     this.transactions = data.map(t => ({ ...t, selected: false }));
  //     this.applyAllFilters();
  //   });
  // }

  // -------------------------
  // PAGINACIJA
  // -------------------------
  get paginatedTransactions(): Transaction[] {
    // const start = (this.currentPage - 1) * this.transactionsPerPage;
    // return this.filteredTransactions.slice(start, start + this.transactionsPerPage);
    return this.transactions;
  }

  get totalPages(): number {
    //return Math.ceil(this.filteredTransactions.length / this.transactionsPerPage);
    return Math.ceil(this.totalItemCount / this.transactionsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchTransactions();
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
  // KOLONE
  // -------------------------
  get displayedColumns(): string[] {
    return this.isMultiSelectMode
      ? ['select', 'beneficiaryName', 'kind', 'direction', 'date', 'amount', 'category', 'split']
      : ['beneficiaryName', 'kind', 'direction', 'date', 'amount', 'category', 'split'];
  }
}
