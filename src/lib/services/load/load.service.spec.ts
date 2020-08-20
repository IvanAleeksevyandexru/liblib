import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from './load.service';
import { ConstantsService } from '../constants.service';

describe('LoadService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
    providers: [ConstantsService]
  }));

  it('should be created', () => {
    const service: LoadService = TestBed.inject(LoadService);
    expect(service).toBeTruthy();
  });
});
