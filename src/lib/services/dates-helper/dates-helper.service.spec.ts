import { TestBed } from '@angular/core/testing';

import { DatesHelperService } from './dates-helper.service';

describe('DatesHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [DatesHelperService]
  }));


  it('should be created', () => {
    const service: DatesHelperService = TestBed.get(DatesHelperService);
    expect(service).toBeTruthy();
  });
});
