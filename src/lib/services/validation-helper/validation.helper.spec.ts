import { TestBed } from '@angular/core/testing';
import { ValidationHelper } from './validation.helper';

describe('ValidationHelper', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ValidationHelper]
  }));


  it('should be created', () => {
    const service: ValidationHelper = TestBed.get(ValidationHelper);
    expect(service).toBeTruthy();
  });
});
