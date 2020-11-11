import { Injectable } from '@angular/core';
import { SnippetModel, FeedModel } from '../../models/feed';
import { LoadService } from '../load/load.service';
import { Router } from '@angular/router';
import { FeedsService } from '../feeds/feeds.service';
import { SharedService } from '../shared/shared.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SnippetsService {

  private isLk = (this.loadService.attributes.appContext || this.loadService.config.viewType) === 'LK';

  constructor(
    private loadService: LoadService,
    private router: Router,
    private feedsService: FeedsService,
    private sharedService: SharedService
  ) {
  }

  private navigateByPath(path): void {
    if (this.isLk) {
      this.router.navigate([path], {
        queryParams: {
          type: null
        }
      });
    } else {
      (window as any).location = `${this.loadService.config.lkUrl.slice(0, -1)}${path}}`;
    }
  }

  private markFeedAsRead(feedId: number) {
    this.feedsService.markFeedAsRead(feedId).subscribe();
  }

  public yaMetricSnippetMap(snippet: SnippetModel, feed: FeedModel): string {
    let snippetCode = '';
    if (feed.data.reminder) {
      snippetCode = 'remindSendDraft';
    } else if (feed.feedType === 'PAYMENT' && snippet.type === 'PAYMENT') {
      if (feed.status === 'reject') {
        snippetCode = 'paymentAgain';
      }
    } else {
      switch (snippet.type) {
        case 'EQUEUE':
          snippetCode = 'equeue';
          break;
        case 'PAYMENT':
          snippetCode = 'paymenDraft';
          break;
        case 'DRAFT':
          snippetCode = 'useAsDraft';
          break;
        case 'IM':
          if (snippet.statusId === 50) {
            snippetCode = 'request';
          } else if (snippet.statusId === 51 || snippet.statusId === 52) {
            snippetCode = 'response';
          }
          break;
      }
    }
    return snippetCode;
  }

  public processLink(snippet: SnippetModel, feed: FeedModel): void {
    if (feed.unread) {
      this.markFeedAsRead(feed.id);
    }

    if (snippet.url && snippet.type === 'EQUEUE' && (feed.feedType === 'ORDER' || feed.feedType === 'DRAFT')) {
      this.router.navigate([`order/${feed.id}`], {queryParams: {scrollTo: 'invitation'}});
    } else if (snippet.type === 'PAYMENT') {
      if (feed.data.reminder) {
        this.navigateByPath(`draft/${feed.extId}`);
      } else {
        let param = new HttpParams().set('billNumber', snippet.uin);
        switch (feed.feedType) {
          case 'ORDER':
            param = param.set('orderId', feed.extId).set('senderType', 'ORDER');
            break;
          case 'GEPS':
            param = param.set('senderType', 'GEPS');
            break;
        }
        (window as any).location = `${this.loadService.config.paymentUrl}?${param}`;
      }
    } else if (snippet && snippet.type === 'DRAFT' && !(window as any).isOp) {
      if (snippet.url.indexOf('http') !== -1) {
        (window as any).location = snippet.url;
      } else {
        const url = this.feedsService.openDetails(feed);
        this.navigateByPath(url);
      }
    } else if (snippet && snippet.type === 'DRAFT' && (window as any).isOp) {
      this.sharedService.send('open-draft-op', feed.extId);
    } else {
      const url = this.feedsService.openDetails(feed);
      this.navigateByPath(url);
    }
  }

}
