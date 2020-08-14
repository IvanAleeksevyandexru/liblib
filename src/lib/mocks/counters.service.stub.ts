import { Injectable } from '@angular/core';
import { CounterData, CounterTarget, CounterType } from '../models/counter';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EMPTY } from 'rxjs';

const MOCK_DATA = {
  total: 10801,
  unread: 177,
  counter: [
    { total: 2140, unread: 111, type: 'GEPS' },
    { total: 508, unread: 17, type: 'ORDER' },
    { total: 392, unread: 1, type: 'PAYMENT' },
    { total: 67, unread: 49, type: 'DRAFT' },
    { total: 686, unread: 2, type: 'EQUEUE' },
    { total: 1418, unread: 3, type: 'FEEDBACK' }
  ]
};

@Injectable()
export class CountersServiceStub {

  private static COUNTERS_MOCK: { [index: string]: CounterData } = {
    USER: {
      total: MOCK_DATA.total,
      unread: 179,
      type: CounterType.MIXED
    },
    STATEMENTS: {
      total: MOCK_DATA.total,
      unread: 68,
      type: CounterType.MIXED
    },
    MESSAGES: {
      total: MOCK_DATA.total,
      unread: 111,
      type: CounterType.MIXED
    },
    EMPTY: {
      total: MOCK_DATA.total,
      unread: 0,
      type: null
    }
  };

  private counters = new BehaviorSubject<{ [index: string]: CounterData }>(CountersServiceStub.COUNTERS_MOCK);
  public counters$ = this.counters.asObservable();

  public getCounter(target: CounterTarget): CounterData {
    return CountersServiceStub.COUNTERS_MOCK[target]
      || CountersServiceStub.COUNTERS_MOCK[CounterTarget.EMPTY];
  }

  public setCounters(data: any): void {
    this.counters.next(CountersServiceStub.COUNTERS_MOCK);
  }

  public markAsRead() {}

  public doCountersApiRequest() {
    return EMPTY;
  }
}
