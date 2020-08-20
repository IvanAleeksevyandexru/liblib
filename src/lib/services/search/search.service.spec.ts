import { async, TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { LoadService } from '../load/load.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });
    service = TestBed.inject(SearchService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
