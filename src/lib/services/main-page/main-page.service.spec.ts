import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { MainPageService } from './main-page.service';

describe('MainPageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
    providers: [{ provide: LoadService, useClass: LoadServiceStub }]
  }));

  it('should be created', () => {
    const service: MainPageService = TestBed.get(MainPageService);
    expect(service).toBeTruthy();
  });
});
