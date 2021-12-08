import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoadService } from '@epgu/ui/services/load';
import {
  CounterData,
  CounterFilter,
  CounterResponse,
  CountersModel,
  CounterTarget,
  CounterType
} from '@epgu/ui/models/counter';
import { switchMap, tap } from 'rxjs/operators';
import { ConstantsService } from '@epgu/ui/services/constants';

@Injectable({
  providedIn: 'root'
})
export class CountersService {

  private counters = new BehaviorSubject<CountersModel>(null);
  public counters$ = this.counters.asObservable();

  private counterFilters: { [index: string]: CounterFilter } = {
    USER: key => this.counterFilters.STATEMENTS(key) || this.counterFilters.MESSAGES(key) || this.counterFilters.SETTINGS(key) || this.counterFilters.BIOMETRY(key)  || this.counterFilters.PARTNERS(key) || this.counterFilters.PAYMENTS_EGISSO(key) || this.counterFilters.FEEDBACK(key) || this.counterFilters.ELECTION_INFO(key) || this.counterFilters.ORG(key) || this.counterFilters.KND_APPEAL(key) || this.counterFilters.ACCOUNT_CHILD(key) || this.counterFilters.PAYMENTS(key),
    ACCOUNT: key => key === CounterType.ACCOUNT || key === CounterType.PROFILE,
    ORG: key => key === CounterType.ORGANIZATION || key === CounterType.BUSINESSMAN,
    ACCOUNT_CHILD: key => key === CounterType.ACCOUNT_CHILD,
    KND_APPEAL: key => key === CounterType.KND_APPEAL,
    ELECTION_INFO: key => key === CounterType.ELECTION_INFO,
    LINKED_ACCOUNT: key => key === CounterType.LINKED_ACCOUNT,
    BIOMETRY: key => key === CounterType.BIOMETRICS,
    SETTINGS: key => this.counterFilters.ACCOUNT(key) || this.counterFilters.BIOMETRY(key) || this.counterFilters.ESIGNATURE(key) || this.counterFilters.LINKED_ACCOUNT(key),
    STATEMENTS: key => key === CounterType.ORDER || key === CounterType.EQUEUE || key === CounterType.CLAIM || key === CounterType.COMPLEX_ORDER || key === CounterType.APPEAL || key === CounterType.SIGN,
    MESSAGES: key => key === CounterType.GEPS,
    PARTNERS: key => key === CounterType.PARTNERS,
    FEEDBACK: key => key === CounterType.FEEDBACK,
    PAYMENTS: key => key === CounterType.PAYMENT,
    PAYMENTS_EGISSO: key => key === CounterType.PAYMENTS_EGISSO,
    ESIGNATURE: key => key === CounterType.ESIGNATURE,
    EMPTY: key => false
  };

  public total: number;
  public unread: number;

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private constantsService: ConstantsService,
  ) { }

  public setCounters(data: CounterResponse) {
    const model: CountersModel = {
      total: data.total || 0,
      unread: data.unread || 0,
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
      this.doCountersApiRequest().subscribe((data: CounterResponse) => {
        this.setCounters(data);
      });
    }
  }

  public doCountersApiRequest(isHide?: boolean, isArchive: boolean = false, types?: string): Observable<CounterResponse> {
    if (this.loadService.attributes.XFeedCntDisabled) {
      return of({
        counter: [],
        total: 0,
        unread: 0
      });
    }
    let params = {
      types: types || (this.constantsService.DEFAULT_LK_NOTIFICATION_CATEGORIES + ',PARTNERS'),
      isArchive: isArchive.toString(),
      _: Math.random().toString()
    };
    if (isHide !== undefined) {
      params = Object.assign(params, {isHide: false});
    }
    return this.http.get<CounterResponse>(
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

  public updateCounters(type: string = ''): Observable<any> {
    const query = type ? `?types=${type}` : '?types=all_v2';
    return this.doMarkAsReadApiRequest(query)
      .pipe(switchMap(() => {
        return this.doCountersApiRequest();
      }));
  }

  public getUnreadFeedsCount(type: string = '', needUpdate: boolean = false): Observable<number> {
    if (this.counters.value && !needUpdate) {
      return of(this.calculateUnreadCount(type));
    } else {
      return this.doCountersApiRequest().pipe(
        tap((data: CounterResponse) => {
          this.setCounters(data);
        }),
        switchMap((data: CounterResponse) => {
          return of(this.calculateUnreadCount(type));
        })
      );
    }
  }

  public calculateUnreadCount(type: string = ''): number {
    const data = this.counters.value;
    if (!type) {
      const drafts = data.counters.DRAFT;
      if (drafts && drafts.unread > 0) {
        return data.unread - drafts.unread;
      } else {
        return data.unread;
      }
    } else {
      const types = type.split(',');
      return types.reduce((sum: number, curType: string) => sum + (data.counters[curType]?.unread || 0), 0);
    }
  }

  public clear() {
    this.counters.next(null);
  }
}

