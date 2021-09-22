import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadService } from '@epgu/ui/services/load';
import { CounterData, CounterFilter, CountersModel, CounterTarget, CounterType } from '@epgu/ui/models/counter';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountersService {

  private counters = new BehaviorSubject<CountersModel>(null);
  public counters$ = this.counters.asObservable();

  private counterFilters: { [index: string]: CounterFilter } = {
    USER: key => this.counterFilters.STATEMENTS(key) || this.counterFilters.MESSAGES(key) || this.counterFilters.SETTINGS(key),
    ACCOUNT: key => key === CounterType.ACCOUNT || key === CounterType.PROFILE,
    LINKED_ACCOUNT: key => key === CounterType.LINKED_ACCOUNT,
    BIOMETRY: key => key === CounterType.BIOMETRICS,
    SETTINGS: key => this.counterFilters.ACCOUNT(key) || this.counterFilters.BIOMETRY(key) || this.counterFilters.ESIGNATURE(key) || this.counterFilters.LINKED_ACCOUNT(key),
    STATEMENTS: key => key === CounterType.ORDER || key === CounterType.EQUEUE || key === CounterType.CLAIM || key === CounterType.COMPLEX_ORDER || key === CounterType.APPEAL,
    MESSAGES: key => key === CounterType.GEPS,
    PARTNERS: key => key === CounterType.PARTNERS,
    PAYMENTS: key => false,
    ESIGNATURE: key => key === CounterType.ESIGNATURE,
    EMPTY: key => false
  };

  public total: number;
  public unread: number;

  constructor(
    private http: HttpClient,
    private loadService: LoadService
  ) { }

  public setCounters(data: any) {
    const model: CountersModel = {
      total: data.total || 0,
      counters: {}
    };

    if (data.counter) {
      data.counter
        .forEach((item: CounterData) => {
          model.counters[item.type] = item;
        });
    }

    this.counters.next(model);
    this.unread = model.counters.ORDER && model.counters.ORDER.unread;
    this.total = model.total;
  }

  public getCounter(target: CounterTarget): CounterData {
    const strategy = this.getStrategyByTarget(target);
    return this.getCounters(strategy);
  }

  private getStrategyByTarget(target: CounterTarget): CounterFilter {
    if (!target) {
      target = CounterTarget.EMPTY;
    }
    return this.counterFilters[target] || this.counterFilters[CounterTarget.EMPTY];
  }

  private getCounters(predicate: CounterFilter): CounterData {
    const model = this.counters.getValue();
    if (!model) {
      return null;
    }

    const counter: CounterData = {
      total: model.total,
      unread: 0,
      type: null
    };
    Object.keys(model.counters)
      .filter(predicate)
      .forEach((key) => {
        counter.unread += model.counters[key].unread;
        counter.type = counter.type && counter.type !== model.counters[key].type
          ? CounterType.MIXED
          : model.counters[key].type;
      });
    return counter;
  }

  public loadCounters() {
    if (this.loadService.user.authorized) {
      this.doCountersApiRequest().subscribe((data: any) => {
        this.setCounters(data);
      });
    }
  }

  // TODO: описать интерфейс
  public doCountersApiRequest(isHide?: boolean): Observable<any> {
    let params = {
      types: 'ORDER,EQUEUE,PAYMENT,GEPS,BIOMETRICS,ACCOUNT,ACCOUNT_CHILD,CLAIM,PROFILE,COMPLEX_ORDER,FEEDBACK,ORGANIZATION,ESIGNATURE,PARTNERS,BUSINESSMAN,KND_APPEAL,LINKED_ACCOUNT',
      isArchive: 'false',
      _: Math.random().toString()
    };
    if (isHide !== undefined) {
      params = Object.assign(params, {isHide: false});
    }
    return this.http.get(
      `${this.loadService.config.lkApiUrl}feeds/counters`,
      {
        params,
        withCredentials: true
      }
    );
  }

  // TODO: описать интерфейс
  public doMarkAsReadApiRequest(query: string): Observable<any> {
    return this.http.post(
      `${this.loadService.config.lkApiUrl}feeds/markAsRead${query}`,
      {},
      {
        withCredentials: true
      }
    );
  }

  public markAsRead(type: string = '') {
    const query = type ? `?types=${type}` : '?types=all_v2';
    this.doMarkAsReadApiRequest(query).subscribe((data: any) => {
      this.loadCounters();
    });
  }

  // TODO: описать интерфейс
  public updateCounters(): Observable<any> {
    return this.doMarkAsReadApiRequest('?types=all_v2')
      .pipe(switchMap(() => {
        return this.doCountersApiRequest();
      }));
  }

}
