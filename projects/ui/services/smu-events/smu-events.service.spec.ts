import { TestBed } from '@angular/core/testing';

import { SmuEventsService } from './smu-events.service';

describe('SmuEventsService', () => {
  let service: SmuEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmuEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
