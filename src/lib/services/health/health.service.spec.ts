import { TestBed } from '@angular/core/testing';
import { HealthService } from './health.service';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';

describe('HealthService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    });
  });

  it('should be created', () => {
    const service: HealthService = TestBed.get(HealthService);
    expect(service).toBeTruthy();
  });
});
