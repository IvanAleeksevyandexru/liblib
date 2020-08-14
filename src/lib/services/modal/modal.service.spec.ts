import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModalService
      ]
    });

    service = TestBed.get(ModalService);
  });

  it('ModalService should create', () => {
    expect(service).toBeTruthy();
  });
});
