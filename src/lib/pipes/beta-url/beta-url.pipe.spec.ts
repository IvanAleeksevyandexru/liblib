import { async, inject, TestBed } from '@angular/core/testing';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { BetaUrlPipe } from './beta-url.pipe';

describe('BetaUrlPipe', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    })
    .compileComponents();
  }));

  it('create an instance', inject([LoadService], (loadService: LoadService) => {
    const pipe = new BetaUrlPipe(loadService);
    expect(pipe).toBeDefined();
  }));
});
