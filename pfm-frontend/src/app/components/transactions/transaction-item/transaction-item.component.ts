import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../models/transaction';
import { CategorizeTransactionDialogComponent } from '../../dialogs/categorize-transaction-dialog/categorize-transaction-dialog.component';
import { MatDialog} from '@angular/material/dialog';
import { MatCard } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { TransactionService } from '../../../services/transaction.service';
import { MatIconModule } from '@angular/material/icon';
import { SplitTransactionDialogComponent } from '../../dialogs/split-transaction-dialog/split-transaction-dialog.component';
@Component({
  selector: 'app-transaction-item',
  imports: [
    CommonModule, 
    MatCard,
    MatChip,
    MatIconModule
  ],
  templateUrl: './transaction-item.component.html',
  styleUrl: './transaction-item.component.scss'
})
export class TransactionItemComponent {
  @Input() transaction!: Transaction;

  @Output() splitCompleted = new EventEmitter<void>();
  constructor(private dialog: MatDialog, private transactionService: TransactionService) {}

  openCategorizeDialog(): void {
  const dialogRef = this.dialog.open(CategorizeTransactionDialogComponent, {
    width: '400px',
    data: {
      transaction: this.transaction
    }
  });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.transaction.category = result.category;
        this.transaction.subcategory = result.subcategory;

        // Poziv ka mock backendu (PATCH)
        this.transactionService.updateTransactionCategory(this.transaction.id, {
          category: result.category,
          subcategory: result.subcategory
        }).subscribe();
      }
    });
  }
  openSplitDialog(): void {
    const dialogRef = this.dialog.open(SplitTransactionDialogComponent, {
      width: '500px',
      data: this.transaction
    });

    dialogRef.afterClosed().subscribe((result) => {
        if (result && result.length) {
          this.transactionService.splitTransaction(this.transaction.id, result).subscribe(() => {
            this.splitCompleted.emit();
          });
        }
    });
  }

}
