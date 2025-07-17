import { Component, Inject, OnInit,ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-categorize-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './categorize-transaction-dialog.component.html',
  styleUrl: './categorize-transaction-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CategorizeTransactionDialogComponent implements OnInit {
  allCategories: Category[] = [];
  parentCategories: Category[] = [];
  subcategories: Category[] = [];

  selectedCategory: Category | null = null;
  selectedSubcategory: string = '';

  constructor(
    private dialogRef: MatDialogRef<CategorizeTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.allCategories = categories;
      this.parentCategories = categories.filter(c => c.parentCode === null);

      const selectedCatName = this.data.transaction.category;
      const selectedSubName = this.data.transaction.subcategory;

      this.selectedCategory = this.parentCategories.find(c => c.name === selectedCatName) || null;
      this.selectedSubcategory = selectedSubName || '';

      this.onCategoryChange();
    });
  }

  onCategoryChange(): void {
    if (this.selectedCategory) {
      this.subcategories = this.allCategories.filter(
        c => c.parentCode === this.selectedCategory!.code
      );

      // Ako prethodno selektovana podkategorija više ne postoji, resetuj je
      if (!this.subcategories.find(sc => sc.name === this.selectedSubcategory)) {
        this.selectedSubcategory = '';
      }
    } else {
      this.subcategories = [];
      this.selectedSubcategory = '';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    this.dialogRef.close({
      category: this.selectedCategory?.name || '',
      subcategory: this.selectedSubcategory
    });
  }
}
