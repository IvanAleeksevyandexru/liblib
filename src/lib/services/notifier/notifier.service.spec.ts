import { async, TestBed } from '@angular/core/testing';
import { NotifierService } from './notifier.service';
import { RouterTestingModule } from '@angular/router/testing';


describe('NotifierService', () => {

  let notifierService: NotifierService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        NotifierService
      ]
    });
    notifierService = TestBed.inject(NotifierService);
  });

  it('should be created', () => {
    expect(notifierService).toBeDefined();
  });
});

