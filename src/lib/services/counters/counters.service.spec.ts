import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { CountersService } from './counters.service';
import { CounterTarget, CounterType } from '../../models/counter';

const MOCK_DATA = {
  total: 10801,
  unread: 177,
  counter: [
    { total: 2140, unread: 111, type: 'GEPS' },
    { total: 508, unread: 17, type: 'ORDER' },
    { total: 392, unread: 1, type: 'PAYMENT' },
    { total: 67, unread: 49, type: 'DRAFT' },
    { total: 686, unread: 0, type: 'EQUEUE' },
    { total: 1418, unread: 0, type: 'FEEDBACK' }
  ]
};

describe('CountersService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
    providers: [{ provide: LoadService, useClass: LoadServiceStub }]
  }));

  it('should be created', () => {
    const service: CountersService = TestBed.get(CountersService);
    expect(service).toBeTruthy();
  });

  it('should prepare and set outers data for user', () => {
    const service: CountersService = TestBed.get(CountersService);

    service.setCounters(MOCK_DATA);
    const model = service.getCounter(CounterTarget.USER);

    expect(model.total).toEqual(MOCK_DATA.total);
    expect(model.unread).toEqual(128);
    expect(model.type).toEqual(CounterType.MIXED);
  });

  it('should be zero on payments', () => {
    const service: CountersService = TestBed.get(CountersService);

    service.setCounters(MOCK_DATA);
    const model = service.getCounter(CounterTarget.PAYMENTS);

    expect(model.total).toEqual(10801);
    expect(model.unread).toEqual(0);
    expect(model.type).toBeNull();
  });

  it('should be equals GEPS counter on messages', () => {
    const service: CountersService = TestBed.get(CountersService);

    service.setCounters(MOCK_DATA);
    const model = service.getCounter(CounterTarget.MESSAGES);

    expect(model.total).toEqual(10801);
    expect(model.unread).toEqual(111);
    expect(model.type).toEqual(CounterType.GEPS);
  });
});
