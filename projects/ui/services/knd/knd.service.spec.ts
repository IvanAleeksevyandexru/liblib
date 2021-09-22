import { TestBed } from '@angular/core/testing';

import { KndService } from './knd.service';

describe('KndService', () => {
  let service: KndService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KndService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
