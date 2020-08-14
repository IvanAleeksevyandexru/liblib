import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { FeedModel, FeedsParams } from '../../models/feed';
import * as moment_ from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


const moment = moment_;

@Injectable({
  providedIn: 'root'
})
export class FeedsService {
  public lastQueryOrderType = '';
  public lastQueryArchiveType = '';
  private isLk = (this.loadService.attributes.appContext || this.loadService.config.viewType) === 'LK';

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {
  }

  public getFeeds(params: FeedsParams) {
    /*
      меняем "+" на "%2B", иначе api нам ответит 400 bad request
      замену делаем путем формирования целого урла! ( в теле get через params такая замена не будет работать по причине постобработки самим
       http клиентом) https://github.com/angular/angular/issues/18261
    */
    const httpParams = new HttpParams({
      fromObject: {
        unread: 'false',
        isArchive: params.isArchive !== undefined ? params.isArchive.toString() : '',
        isHide: params.isHide !== undefined ? params.isHide.toString() : '',
        types: params.types || null,
        pageSize: params.pageSize,
        status: params.status || '',
        startDate: params.startDate || '',
        lastFeedId: params.lastFeedId || '',
        lastFeedDate: this.getLastFeedDate(params.lastFeedDate || ''),
        q: params.q || '',
        _: `${Math.random()}`
      }
    });
    const feedsUrl = `${this.loadService.config.lkApiUrl}feeds/`;
    const apiUrl = params.isEqueue ? `${feedsUrl}activeEqueue/` : feedsUrl;
    const url = `${apiUrl}?${httpParams.toString().replace(/\+/gi, '%2B')}`;

    return this.http.get(url, {withCredentials: true});
  }

  public getLastFeedDate(date, def: Date | null = null, dropMs = null) {
    if (date instanceof Date) {
      return moment(date).format('YYYY-MM-DDTHH:mm:ss' + (dropMs ? '' : '.SSS') + 'ZZ');
    }
    if (typeof date === 'string') {
      date = moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZZ');
      if (date.isValid()) {
        return date.toDate();
      }
    }
    return def ? moment(def).format('YYYY-MM-DDTHH:mm:ss' + (dropMs ? '' : '.SSS') + 'ZZ') : '';
  }

  public markFeedAsRead(feedId: number) {
    return this.http.get(
      `${this.loadService.config.lkApiUrl}feeds/markAsRead/${feedId}`,
      {
        withCredentials: true
      });
  }

  public markAsRead(feedsID: number[]) {
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds/markAsReadFeeds`, feedsID, {
      withCredentials: true
    });
  }

  public markAsUnread(feedsID: number[]) {
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds/unread`, feedsID, {
      withCredentials: true
    });
  }

  public putToArchive(feedsID: number[]) {
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds/archive`, feedsID, {
      withCredentials: true
    });
  }

  public getFromArchive(feedsID: number[]) {
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds/recovery`, feedsID, {
      withCredentials: true
    });
  }

  public getFeedDetails(messageApiUrlChunk: number | string) {
    return this.http.get(`${this.loadService.config.lkApiUrl}feeds/${messageApiUrlChunk}`, {
      withCredentials: true
    });
  }

  public integrationConfirm(id: string) {
    return this.http.get(`${this.loadService.config.imApiUrl}requests/${id}/confirm`, {
      observe: 'response',
      withCredentials: true
    });
  }

  public integrationCancel(id: string) {
    return this.http.get(`${this.loadService.config.imApiUrl}requests/${id}/cancel`, {
      observe: 'response',
      withCredentials: true
    });
  }

  public integrationBlock(id: string) {
    return this.http.get(`${this.loadService.config.imApiUrl}requests/${id}/block`, {
      observe: 'response',
      withCredentials: true
    });
  }

  public removeDraft(extId: string) {
    return this.http.delete(`${this.loadService.config.lkApiUrl}orders/${extId}`, {
      withCredentials: true
    });
  }

  public removeFeed(feedId: number) {
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds/${feedId}/hideOnEvents`, feedId, {
      withCredentials: true
    });
  }

  public splitQueryParams(): string {
    const params = this.activateRoute.snapshot.queryParams;
    const isParamsExists = Object.keys(params).length;
    const arrParams = [];
    let result = '';
    if (!isParamsExists) {
      return result;
    }
    result += '?';
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        arrParams.push(`${key}=${params[key]}`);
      }
    }

    result += arrParams.join('&');
    return result;
  }

  public openDetails(feed: FeedModel): string {
    let url = this.isLk ? '/' : this.loadService.config.lkUrl;
    switch (feed.feedType) {
      case 'FEEDBACK':
        url += `feedback/${feed.id}`;
        break;
      case 'APPEAL':
        url += `appeal/${feed.id}`;
        break;
      case 'COMPLEX_ORDER':
        url += `university/external/${feed.extId}`;
        break;
      case 'GEPS':
        url += `message/${feed.id}`;
        break;
      case 'DRAFT':
        url += `draft/${feed.extId}`;
        break;
      case 'PAYMENT':
        // урл старого лк - редирект на старый лк на балансировщике
        url += `notifications/details/PAYMENT/${feed.extId}`;
        break;
      case 'EQUEUE':
        if (feed.data && feed.data.parentOrderId) {
          url += `order/${feed.data.parentOrderId}/${feed.id}`;
        } else {
          url += `order/equeue/${feed.id}`;
        }
        break;
      case 'ORDER':
        url += `order/${feed.id}`;
        break;
      case 'CLAIM':
        url += `claim/${feed.id}`;
        break;
      case 'BIOMETRICS':
        url += 'settings/biometry';
        break;
      case 'ACCOUNT':
      case 'PROFILE':
        url += 'settings/account';
        break;
      case 'ORGANIZATION':
        url += 'organization-feed';
        break;
      case 'ELECTION_INFO':
        url += `elections/candidate`;
        break;
      case 'ESIGNATURE':
        url += `settings/signature`;
        break;
    }

    return url;
  }

  public sendMessageStatus(type, feedId) {
    const params = {
      actionType: type
    };
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds/${feedId}`, feedId, {
      withCredentials: true, params
    });
  }

  public sendConfirmation() {
    const params = {
      userName: this.loadService.user.fullName,
      messageType: 'MESSAGE_CONFIRM'
    };
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds`,  {
      withCredentials: true, params
    });
  }
}
