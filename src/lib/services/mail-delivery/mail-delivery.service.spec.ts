import { TestBed } from '@angular/core/testing';

import { MailDeliveryService } from './mail-delivery.service';

describe('MailDeliveryService', () => {
  let service: MailDeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailDeliveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
