import { TestBed } from '@angular/core/testing';

import { PrintService } from './print.service';

describe('PrintService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrintService = TestBed.inject(PrintService);
    expect(service).toBeTruthy();
  });
});
