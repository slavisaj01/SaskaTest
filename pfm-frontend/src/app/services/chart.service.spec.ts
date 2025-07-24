import { TestBed } from '@angular/core/testing';

import { ChartServiceService } from './chart.service';

describe('ChartServiceService', () => {
  let service: ChartServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
