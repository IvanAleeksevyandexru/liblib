import { TestBed } from '@angular/core/testing';

import { GisgmpSubscribeService } from './gisgmp-subscribe.service';

describe('GisgmpSubscribeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GisgmpSubscribeService = TestBed.inject(GisgmpSubscribeService);
    expect(service).toBeTruthy();
  });
});
