import { async, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from './cookie.service';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('CookieService', () => {
  let service: CookieService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });
    service = TestBed.get(CookieService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

