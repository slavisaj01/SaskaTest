import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreemapGraphComponent } from './treemap-graph.component';

describe('TreemapGraphComponent', () => {
  let component: TreemapGraphComponent;
  let fixture: ComponentFixture<TreemapGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreemapGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreemapGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
