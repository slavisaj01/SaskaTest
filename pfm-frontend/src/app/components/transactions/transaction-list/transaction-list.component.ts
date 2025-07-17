import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../../models/transaction';
import { TransactionService } from '../../../services/transaction.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { TransactionItemComponent } from '../transaction-item/transaction-item.component';
import { TransactionFiltersComponent } from '../transaction-filters/transaction-filters.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { forkJoin } from 'rxjs';
import { CategorizeMultipleTransactionsDialogComponent } from '../../dialogs/categorize-multiple-transactions-dialog/categorize-multiple-transactions-dialog.component';
import { TreemapGraphComponent } from '../../graphs/treemap-graph/treemap-graph.component';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { KindFilterComponent } from '../../filters/kind-filter/kind-filter.component';
import { CategorizeTransactionDialogComponent } from '../../dialogs/categorize-transaction-dialog/categorize-transaction-dialog.component';
import { SplitTransactionDialogComponent } from '../../dialogs/split-transaction-dialog/split-transaction-dialog.component';
import { ElementRef, HostListener } from '@angular/core';
@Component({
  selector: 'app-transaction-list',
  imports: [
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatTableModule,
    CommonModule,
    KindFilterComponent
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent implements OnInit{
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  kinds: string[] = [];
  selectedKind: string = 'All';
  isMultiSelectMode: boolean = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  //selectedView: 'list' | 'treemap' | 'bar' | 'donut' = 'list';
 

  constructor(
  private transactionService: TransactionService,
  private dialog: MatDialog,
  private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.transactionService.getTransactions().subscribe((data) => {
      this.transactions = data;
      this.transactions = data.map(t => ({ ...t, selected: false }));
      this.kinds = [...new Set(data.map(t => t.kind))]; // izvlačenje unikatnih `kind` vrednosti
      this.applyFiltersAndSorting();
    });
  }

  onKindSelected(kind: string): void {
    this.currentPage = 1;
    this.selectedKind = kind;
    this.applyFiltersAndSorting();
  }

  private applyFiltersAndSorting(): void {
    let result = [...this.transactions];

    // Filter po kind-u ako nije "All"
    if (this.selectedKind && this.selectedKind !== 'All') {
      result = result.filter(t => t.kind === this.selectedKind);
    }

    // Filter po datumu DODATAK
    if (this.fromDate) {
      result = result.filter(t => new Date(t.date) >= this.fromDate!);
    }
    if (this.toDate) {
      result = result.filter(t => new Date(t.date) <= this.toDate!);
    }

    // Sortiraj po datumu opadajuće, pa po kategoriji rastuće
    result = result.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.category.localeCompare(b.category);
    });

    this.filteredTransactions = result;
  }

  openCategorizeDialog(transaction: Transaction): void {
  const dialogRef = this.dialog.open(CategorizeTransactionDialogComponent, {
    width: '400px',
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
        width: '500px',
        data: transaction
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && result.length) {
          this.transactionService.splitTransaction(transaction.id, result).subscribe(() => {
            this.onSplitCompleted(); // osveži listu
          });
        }
      });
    }

  toggleMultiSelect(): void {
    this.isMultiSelectMode = true;
    this.filteredTransactions.forEach(t => (t.selected = false));
  }

  cancelMultiSelect(): void {
    this.isMultiSelectMode = false;
    this.filteredTransactions.forEach(t => (t.selected = false));
  }

  openMultiCategorizationDialog(): void {
    // Filtriramo sve selektovane transakcije
    const selectedTransactions = this.filteredTransactions.filter(t => t.selected);

    // Otvaramo dijalog i prosleđujemo broj selektovanih transakcija
    const dialogRef = this.dialog.open(CategorizeMultipleTransactionsDialogComponent, {
      data: {
        selectedCount: selectedTransactions.length,
        transactions: selectedTransactions
      }
    });

    // Nakon što se dijalog zatvori, obrađujemo rezultat
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Kreiramo niz PATCH zahteva za svaku transakciju
          const updateRequests = selectedTransactions.map(t => {
            return this.transactionService.updateTransactionCategory(t.id, {
              category: result.category,
              subcategory: result.subcategory || ''
            });
          });

          // Pokrećemo sve update zahteve paralelno
          forkJoin(updateRequests).subscribe(() => {
            // Kada su svi PATCH-ovi uspešni, ažuriramo lokalno stanje
            selectedTransactions.forEach(t => {
              t.category = result.category;
              t.subcategory = result.subcategory || '';
              t.selected = false;
            });

            // Isključujemo višestruki mod selekcije
            this.isMultiSelectMode = false;
          });
        }
      });
  }

  hasSelectedTransactions():boolean{
    return this.filteredTransactions.some(t => t.selected);
  }

  refreshTransactions(): void {
    this.transactionService.getTransactions().subscribe((data) => {
      this.transactions = data.map(t => ({ ...t, selected: false }));
      this.applyFiltersAndSorting();
    });
  }

  onSplitCompleted(): void {
    setTimeout(() => {
      this.refreshTransactions();
    }, 300); // 300ms pauze da json-server stigne da upiše sve
  }


  onDateRangeSelected(range: { from: Date | null; to: Date | null }): void {
    this.currentPage = 1;
    this.fromDate = range.from;
    this.toDate = range.to;
    this.applyFiltersAndSorting();
  }

  // onFiltersReset(): void {
  //   this.selectedKind = 'All';
  //   this.fromDate = null;
  //   this.toDate = null;
  //   this.currentPage = 1;
  //   this.applyFiltersAndSorting();
  // }


  showKindFilter: boolean = false;

  toggleKindFilter(): void {
    this.showKindFilter = !this.showKindFilter;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.showKindFilter) {
      this.showKindFilter = false;
    }
  }
  //Paginacija:
  currentPage: number = 1;
  transactionsPerPage: number = 10;

  get paginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.transactionsPerPage;
    const end = start + this.transactionsPerPage;
    return this.filteredTransactions.slice(start, end);
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

      for (let i = left; i <= right; i++) {
        range.push(i);
      }

    if (right < total - 1) range.push('...');
    if (total > 1) range.push(total);

    return range;
  }
  //
  
}
