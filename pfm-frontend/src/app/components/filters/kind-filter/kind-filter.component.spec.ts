import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KindFilterComponent } from './kind-filter.component';

describe('KindFilterComponent', () => {
  let component: KindFilterComponent;
  let fixture: ComponentFixture<KindFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KindFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KindFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
