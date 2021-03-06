import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import {FeedDataModel, FeedModel, FeedsParams} from '@epgu/ui/models';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { format, formatISO, isValid, parse, parseISO } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class FeedsService {

  public lastQueryOrderType = '';
  public lastQueryArchiveType = '';
  private isLk = (this.loadService.attributes.appContext || this.loadService.config.viewType) === 'LK';
  private config = this.loadService.config;

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {
  }

  public getFeeds(params: FeedsParams) {
    if (this.loadService.attributes.XFeedDisabled) {
      return throwError('XFeedDisabled');
    }
    /*
      меняем "+" на "%2B", иначе api нам ответит 400 bad request
      замену делаем путем формирования целого урла! ( в теле get через params такая замена не будет работать по причине постобработки самим
       http клиентом) https://github.com/angular/angular/issues/18261
    */
    const httpParams = new HttpParams({
      fromObject: {
        unread: params.unread?.toString() || 'false',
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
      const result = formatISO(date);
      if (dropMs) {
        return result.split('.')[0];
      } else {
        return result;
      }
    }
    if (typeof date === 'string') {
      if (isValid(parseISO(date))) {
        return date;
      }
    }
    if (def) {
      const result = formatISO(def);
      if (dropMs) {
        return result.split('.')[0];
      } else {
        return result
      }
    } else {
      return '';
    }
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
    return this.http.get(`${this.loadService.config.lkApiUrl}feeds/${messageApiUrlChunk}?_=${Math.random()}`, {
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

  private getComplexOrderUrl(feed: FeedModel): string {
    if (feed.ot === 'UNIVERSITY_ENTRANCE') {
      return `university/external/${feed.extId}`;
    }
    return `complex-order/external/${feed.extId}`;
  }

  public openDetails(feed: FeedModel): string {
    let url = (this.isLk || this.loadService.attributes.appContext === 'PARTNERS') ? '/' : this.loadService.config.lkUrl;

    // if (feed.feedType === 'KND_APPEAL' || feed.feedType === 'KND_APPEAL_DRAFT') {
    //   url = this.loadService.config.kndDomain;
    // }

    switch (feed.feedType) {
      case 'FEEDBACK':
        url += `feedback/${feed.id}`;
        break;
      case 'APPEAL':
        url += `appeal/${feed.id}`;
        break;
      case 'COMPLEX_ORDER':
        url += this.getComplexOrderUrl(feed);
        break;
      case 'GEPS':
        url += `message/${feed.id}`;
        break;
      case 'DRAFT':
        url += `draft/${feed.extId}`;
        break;
      case 'PAYMENT':
        url = `${this.loadService.config.betaUrl}/pay/details/${feed.extId}`;
        break;
      case 'EQUEUE':
        if (feed.data && feed.data.parentOrderId) {
          url += `order/${feed.data.parentOrderId}/${feed.id}`;
        } else {
          url += `order/equeue/${feed.id}`;
        }
        break;
      case 'ORDER':
        if (feed.data && feed.data.p16url) {
          url = `${feed.data.p16url}`;
        } else {
          url += `order/${feed.id}`;
        }
        break;
      case 'CLAIM':
        url += `claim/${feed.id}`;
        break;
      case 'PARTNERS_DRAFT':
        url += `lk/draft/${feed.extId}`;
        break;
      case 'PARTNERS':
        url += `lk/order/${feed.id}`;
        break;
      case 'BIOMETRICS':
        url += 'settings/biometrics';
        break;
      case 'LINKED_ACCOUNT':
        url += 'settings/social';
        break;
      case 'ACCOUNT':
      case 'PROFILE':
        if (feed.data && feed.data.linked_to) {
          url += `${feed.data.linked_to}`;
        } else {
          url += 'settings/account';
        }
        break;
      case 'ORGANIZATION':
      case 'BUSINESSMAN':
        url += 'organization-feed';
        break;
      case 'ELECTION_INFO':
        if (feed.data?.linked_to) {
          url = `${feed.data.linked_to}`;
        } else {
          url = this.loadService.config.electionLkuipCommissionDomain;
        }
        break;
      case 'ESIGNATURE':
        url += `settings/signature`;
        break;
      case 'ACCOUNT_CHILD':
        if (feed.data && feed.data.linked_to) {
          url += `${feed.data.linked_to}`;
        } else {
          url += `profile/family/child/${feed.extId}/docs`;
        }
        break;
      case 'KND_APPEAL':
        url = `${this.loadService.config.kndDomain}appeal/${feed.extId}`;
        break;
      case 'KND_APPEAL_DRAFT':
        url = `${this.loadService.config.kndDomain}form/appeal/${feed.extId}?isDraft=true`;
        break;
      case 'SIGN':
        url += `sign-feed/${feed.id}`;
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
    return this.http.post(`${this.loadService.config.lkApiUrl}feeds`, {
      withCredentials: true, params
    });
  }

  public getQueryParamsForRedirect(feed: FeedModel) {
    let params = {};
    switch (feed.feedType) {
      case 'ELECTION_INFO':
        params = {vrnVibRef: feed.extId};
        break;
    }
    return params;
  }

  public getFeedTypeName(feedType: string, feedData: FeedDataModel): string {
    let type = '';
    switch (feedType) {
      case 'ORDER':
      case 'COMPLEX_ORDER':
        type = 'Заявление';
        break;
      case 'PAYMENT':
        type = 'Платеж';
        break;
      case 'CALENDAR':
      case 'EPGU':
      case 'EQUEUE':
        type = 'Запись на прием';
        break;
      case 'FEEDBACK':
        type = 'Служба поддержки';
        break;
      case 'DRAFT':
        type = 'Черновик';
        break;
      case 'GEPS':
        type = 'Госпочта';
        break;
      case 'KND_APPEAL':
      case 'KND_APPEAL_DRAFT':
        type = 'Обжалование КНД';
        break;
      case 'APPEAL':
        type = 'Сообщения';
        break;
      case 'CLAIM':
        type = 'Обжалования';
        break;
      case 'ELECTION':
      case 'ELECTION_INFO':
        type = 'Выборы';
        break;
      case 'PARTNERS_DRAFT':
      case 'PARTNERS':
        type = 'Партнеры';
        break;
      case 'ACCOUNT':
      case 'ACCOUNT_CHILD':
      case 'LINKED_ACCOUNT':
        type = 'Документы';
        break;
      case 'ORGANIZATION':
      case 'ESIGNATURE':
      case 'BUSINESSMAN':
        type = 'Системные';
        break;
      case 'PROFILE':
      case 'BIOMETRICS':
        type = 'Профиль';
        break;
      case 'SIGN':
        type = 'Госключ';
        break;
      default:
        type = 'Заявление';
    }
    // ПМП/ПМЖ фейковый ORDER
    if (feedType === 'DRAFT' && feedData?.fakeOrder) {
      type = 'Заявление';
    }
    return type;
  }

}
