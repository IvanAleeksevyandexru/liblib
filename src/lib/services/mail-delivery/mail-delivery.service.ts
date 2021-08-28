import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {
  AllSubscriptionResponse,
  DeliveryInfo,
  DeliveryStatus,
  DeliverySubscribeStatus,
  GepsAddresses,
  GepsSaveAddresses,
  GepsUpdateAddresses, SubscriptionHint
} from '../../models/mail-delivery';
import {LoadService} from '../../services/load/load.service';
import {ConstantsService} from '../../services/constants.service';
import {CookieService} from '../../services/cookie/cookie.service';
import {SubscriptionItem} from '../../models/mail-delivery';

@Injectable({
  providedIn: 'root'
})
export class MailDeliveryService {

  public loading = new BehaviorSubject(false);
  public textAndLinks: SubscriptionHint;

  constructor(
    private loadService: LoadService,
    private http: HttpClient,
    private constants: ConstantsService,
    private cookieService: CookieService,
  ) {
  }

  public getGepsStatus(): Observable<DeliveryStatus> {
    return this.http.get<DeliveryStatus>(this.loadService.config.gepsApiUrl + `rp/json/agreement/status?_=${Math.random()}`,
      {
        withCredentials: true
      });
  }

  public getGepsInfo(): Observable<DeliveryInfo> {
    return this.http.get<DeliveryInfo>(this.loadService.config.gepsApiUrl + `rp/agreement/info?_=${Math.random()}`,
      {
        withCredentials: true
      });
  }

  public subscription(params: GepsSaveAddresses[]): Observable<any> {
    return this.http.post(this.loadService.config.gepsApiUrl + 'rp/new', params, {
      withCredentials: true
    });
  }

  public getGepsAddresses(): Observable<GepsAddresses> {
    return this.http.get<GepsAddresses>(this.loadService.config.gepsApiUrl + `rp/json/addresses?silent=true&_=${Math.random()}`,
      {
        withCredentials: true
      });
  }

  public updateGepsStatusAndAddress(addresses: GepsUpdateAddresses): Observable<any> {
    return this.http.post<any>(
      `${this.loadService.config.gepsApiUrl}rp/json/data?_=${Math.random()}`,
      addresses,
      {
        withCredentials: true
      }
    );
  }

  public updateGepsAddresses(addresses: GepsUpdateAddresses): Observable<any> {
    return this.http.post<any>(this.loadService.config.gepsApiUrl + `rp/json/addresses`, addresses,
      {
        withCredentials: true
      });
  }

  public toggleSubscribeStatus(addresses: GepsUpdateAddresses): Observable<any> {
    return this.http.post<any>(this.loadService.config.gepsApiUrl + `rp/json/agreement`, addresses,
      {
        withCredentials: true
      });
  }

  // Запрос данных о доступных подписках
  public getAvailableSubscription(withHidden = false): Observable<AllSubscriptionResponse> {
    const region = this.loadService.attributes.selectedRegion;
    return this.http.get<AllSubscriptionResponse>(`${this.loadService.config.gepsApiUrl}subscription/v2/`,
      {
        withCredentials: true,
        params: {
          region,
          _: String(Math.random()),
          withHidden: withHidden.toString()
        }
      }).pipe(
      tap(response => {
        if (response) {
          this.textAndLinks = response.hint;
          this.sortList(response.items);
        }
      })
    );
  }

  // Обновление данных о статусе подписки
  public updateSubscriptionState(code: string, curStatus: DeliverySubscribeStatus, newStatus: DeliverySubscribeStatus): Observable<any> {
    let isFirstSubscribe = this.constants.MAIL_DELIVERY_FIRST_SUBSCRIBE_STATUSES.includes(curStatus);
    const url = `${this.loadService.config.gepsApiUrl}subscription/v2/${code}`;
    const body = {status: newStatus};

    if (code === this.constants.MAIL_DELIVERY_COPY_POST_CODE &&
      this.constants.MAIL_DELIVERY_FIRST_SUBSCRIBE_STATUSES.includes(curStatus)) {
          isFirstSubscribe = false;
        }

    if (code === this.constants.MAIL_DELIVERY_COPY_POST_CODE &&
      this.constants.MAIL_DELIVERY_NOT_SUBSCRIBED_STATUS.includes(curStatus)) {
      isFirstSubscribe = true;
    }

    if (isFirstSubscribe) {
      return this.http.post<any>(url, body, {withCredentials: true});
    } else {
      return this.http.put<any>(url, body, {withCredentials: true});
    }
  }

  public updateMultiSubscriptionState(codes: string[], newStatus: DeliverySubscribeStatus, addresses?: string[]): Observable<any> {
    const url = `${this.loadService.config.gepsApiUrl}subscription/v2`;
    const items = codes.map(item => {
      const requestItem: any = {code: item, status: newStatus};
      if (newStatus === 'SUBSCRIBED' && this.isRussianPost(item) && addresses && addresses.length) {
        const addressesArr = addresses.map(adr => ({asString: adr}));
        requestItem.data = {addresses: addressesArr};
      } else if (this.isRussianPost(item)) {
        requestItem.data = {addresses: []};
      }
      return requestItem;
    });

    return this.http.post<any>(url, {items}, {withCredentials: true});
  }

  public markAsDelivered(): void {
    const curSession = this.cookieService.get('acc_t');
    const sessionOfLastMark = this.cookieService.get('marked_as_delivered');

    if (curSession !== sessionOfLastMark) {
      const url = `${this.loadService.config.gepsApiUrl}messages/markAsDelivered`;
      this.http.put<any>(url, {}, {withCredentials: true}).subscribe(() => {
        this.cookieService.set('marked_as_delivered', curSession, 1);
      });
    }
  }

  private sortList(list: SubscriptionItem[]): void {
    if (list && list.length) {
      const prObj = list.find(item => this.isRussianPost(item.code));
      if (prObj) {
        list.splice(list.indexOf(prObj), 1);
        list.push(prObj);
      }
    }
  }

  public isRussianPost(code: string): boolean {
    return this.constants.MAIL_DELIVERY_RUSSIAN_POST_CODE === code;
  }
}
