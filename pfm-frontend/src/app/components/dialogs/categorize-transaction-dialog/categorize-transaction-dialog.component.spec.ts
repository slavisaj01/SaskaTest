import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorizeTransactionDialogComponent } from './categorize-transaction-dialog.component';

describe('CategorizeTransactionDialogComponent', () => {
  let component: CategorizeTransactionDialogComponent;
  let fixture: ComponentFixture<CategorizeTransactionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorizeTransactionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorizeTransactionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
