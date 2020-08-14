import { TestBed } from '@angular/core/testing';
import { LocationService } from './location.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('LocationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
    providers: [
        { provide: LoadService, useClass: LoadServiceStub }
    ]
  }));

  it('should be created', () => {
    const service: LocationService = TestBed.get(LocationService);
    expect(service).toBeTruthy();
  });
});
