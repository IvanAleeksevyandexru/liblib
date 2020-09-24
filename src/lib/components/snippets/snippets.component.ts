import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SnippetModel, FeedModel } from '../../models/feed';
import { LoadService } from '../../services/load/load.service';
import { Router } from '@angular/router';
import { FeedsService } from '../../services/feeds/feeds.service';
import { SnippetsService } from '../../services/snippets/snippets.service';
import * as moment_ from 'moment/min/moment.min.js';
import { DeclinePipe } from '../../pipes/decline/decline.pipe';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';

const moment = moment_;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-snippets',
  templateUrl: './snippets.component.html',
  styleUrls: ['./snippets.component.scss']
})
export class SnippetsComponent implements OnInit {

  @Input() public snippet: SnippetModel;
  @Input() public feed: FeedModel;

  constructor(
    private loadService: LoadService,
    private router: Router,
    private feedsService: FeedsService,
    private snippetsService: SnippetsService,
    public declinePipe: DeclinePipe,
    public yaMetricService: YaMetricService
  ) {}

  public ngOnInit() {}

  private onSnippetClick(snippet: SnippetModel, feed: FeedModel): void {
    const snippetCode = this.snippetsService.yaMetricSnippetMap(snippet, feed);
    this.yaMetricService.callReachGoal('feedsOrder', {
      action: 'snippets',
      snippetCode,
      screen: this.loadService.attributes.deviceType

    });
  }

  public goToDetails(snippet: SnippetModel, feed: FeedModel, event: Event): void {
    this.onSnippetClick(snippet, feed);
    this.snippetsService.processLink(snippet, feed);
    event.stopPropagation();
    event.preventDefault();
  }

  public setSnippetIcon(snippet: SnippetModel, feed: FeedModel): { [key: string]: boolean } {
    return {
      'snippet-equeue': snippet.type === 'EQUEUE' || snippet.type === 'ORDER',
      'snippet-pay': snippet.type === 'PAYMENT' && !feed.data.reminder,
      'snippet-pay-reminder': snippet.type === 'PAYMENT' && feed.data.reminder,
      'snippet-im': snippet.type === 'IM',
      'snippet-draft': snippet.type === 'DRAFT',
    };
  }

  public isOrderOrEqueueSnippet(snippet: SnippetModel): boolean {
    return snippet.type === 'EQUEUE' || snippet.type === 'ORDER';
  }

  public isSnippetDate(snippet: SnippetModel): string {
    return snippet.localDate || snippet.date;
  }

  public isSnippetAddress(snippet: SnippetModel, feed: FeedModel): boolean {
    return (snippet.type === 'ORDER' || !!(snippet.type === 'EQUEUE' && !feed.data.toDoctor)) && !!snippet.address;
  }

  public cancelReservationDate(date: string): string {
    const currentDate = moment();
    const reservationDate = moment(date);
    const val = reservationDate.diff(currentDate, 'hours');
    if (val < 1 || !val) {
      return ' в ближайшее время';
    }
    return ' через ' + this.declinePipe.transform(val, ['час', 'часа', 'часов']);
  }

  public isPaymentSnippet(snippet: SnippetModel, feed: FeedModel): boolean {
    return snippet.type === 'PAYMENT' && feed.status !== 'reject_no_pay' && !!snippet.sum;
  }

  public isSnippetWithSumm(snippet: SnippetModel, feed: FeedModel): boolean {
    const snippetDiscountDate = snippet.discountDate || feed.data.DiscountDate;
    return snippetDiscountDate && moment(snippetDiscountDate) >= moment();
  }

  public isSnippetWithOriginalSumm(snippet: SnippetModel, feed: FeedModel): boolean {
    const snippetDiscountDate = snippet.discountDate || feed.data.DiscountDate;
    return (snippetDiscountDate && moment(snippetDiscountDate) < moment()) || !snippetDiscountDate;

  }

  public getGepsDiscountDate(snippet: SnippetModel, feed: FeedModel): string {
    return moment(snippet.discountDate || feed.data.DiscountDate).format('dd.MM.YYYY');
  }

  public isSnippetWithExpireDate(snippet: SnippetModel, feed: FeedModel): boolean {
    return snippet.statusId !== 51 && snippet.statusId !== 52 && snippet.statusId !== 53 &&
      snippet.statusId !== 3 && !!feed.data.imExpireDate;
  }

  public getSnippetLinkText(snippet: SnippetModel): string {
    if (snippet.type === 'PAYMENT') {
      return 'Оплатить';
    } else if (snippet.type === 'DRAFT') {
      return 'Использовать как черновик';
    }
    return 'Подробнее';
  }
}
