import { async, TestBed } from '@angular/core/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { YaMetricService } from './ya-metric.service';

describe('YaMetricService', () => {

  let yaMetricService: YaMetricService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        YaMetricService,
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });

    yaMetricService = TestBed.get(YaMetricService);
  });

  it('should be created', () => {
    expect(yaMetricService).toBeDefined();
  });
});
