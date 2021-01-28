import { TestBed } from '@angular/core/testing';

import { MailDeliveryModalService } from './mail-delivery-modal.service';

describe('MailDeliveryModalService', () => {
  let service: MailDeliveryModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailDeliveryModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
