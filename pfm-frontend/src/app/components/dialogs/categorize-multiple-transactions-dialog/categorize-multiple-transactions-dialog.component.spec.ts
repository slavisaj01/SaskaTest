import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorizeMultipleTransactionsDialogComponent } from './categorize-multiple-transactions-dialog.component';

describe('CategorizeMultipleTransactionsDialogComponent', () => {
  let component: CategorizeMultipleTransactionsDialogComponent;
  let fixture: ComponentFixture<CategorizeMultipleTransactionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorizeMultipleTransactionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorizeMultipleTransactionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
