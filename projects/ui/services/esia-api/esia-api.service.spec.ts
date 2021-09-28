import { TestBed } from '@angular/core/testing';
import { EsiaApiService } from './esia-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('EsiaApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      { provide: LoadService, useClass: LoadServiceStub }
    ]
  }));

  it('should be created', () => {
    const service: EsiaApiService = TestBed.get(EsiaApiService);
    expect(service).toBeTruthy();
  });
});
