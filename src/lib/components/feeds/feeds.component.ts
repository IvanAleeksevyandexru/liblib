import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FeedsService } from '../../services/feeds/feeds.service';
import { FeedModel, FeedsModel, SnippetModel } from '../../models/feed';
import { LoadService } from '../../services/load/load.service';
import { User } from '../../models/user';
import * as moment_ from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier/notifier.service';
import { switchMap } from 'rxjs/operators';
import { SharedService } from '../../services/shared/shared.service';
import { HelperService } from '../../services/helper/helper.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { CountersService } from '../../services/counters/counters.service';
import { Router } from '@angular/router';

const moment = moment_;
moment.locale('ru');

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss']
})
export class FeedsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public isArchive = false;
  @Input() public isHide: boolean | null;
  @Input() public inlineDate = true;
  @Input() public snippets = false;
  @Input() public search = '';
  @Input() public selectedCategory: any;
  @Input() public count = 0;
  @Input() public types: string | null;
  @Input() public page = 'overview';
  @Input() public autoload: boolean;
  @Output() public emptyFeeds: EventEmitter<boolean> = new EventEmitter();
  @Output() public searching = new EventEmitter<boolean>();
  @Output() public serviceError = new EventEmitter<boolean>();

  public user: User;
  public feeds: FeedModel[];
  public selectedTypes: string | null;
  public defaultTypesSelected = true;
  public addFeedsIsLoading = false;
  public feedsIsLoading = true;
  public allFeedsLoaded = false;
  public hasMore: boolean;
  public removeInProgress: boolean;
  public isLk = (this.loadService.attributes.appContext || this.loadService.config.viewType) === 'LK';
  public isPartners = (this.loadService.attributes.appContext || this.loadService.config.viewType) === 'PARTNERS';
  private feedsSubscription: Subscription;
  private feedsUpdateSubscription: Subscription;
  private loadedFeedsCount = 0;
  private showMoreCount = 0;
  private afterFirstSearch = false;
  private statusesMap = {
    NEW: 'in_progress',
    REQUEST: 'in_progress',
    REQUEST_ERROR: 'reject',
    DONE: 'executed'
  };
  public isHeader: boolean;

  constructor(
    private router: Router,
    public feedsService: FeedsService,
    public loadService: LoadService,
    public notifier: NotifierService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef,
    private sharedService: SharedService,
    public yaMetricService: YaMetricService,
    private countersService: CountersService
  ) {
  }

  public ngOnInit() {
    HelperService.mixinModuleTranslations(this.translate);
    this.getUserData();
    if (!this.afterFirstSearch) {
      this.getFeeds();
    }
    this.updateFeeds();
    this.isHeader = this.page === 'header';
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.onSearch(changes);
    this.onCategorySelect(changes);
  }

  private onSearch(changes: SimpleChanges): void {
    if (changes.search && changes.search.currentValue ||
      changes.search && changes.search.currentValue === '' && changes.search.previousValue) {
      this.enableFeedsSearch();
      this.getFeeds('', '', this.search);
    }
  }

  private onCategorySelect(changes: SimpleChanges): void {
    if (changes.selectedCategory &&
      changes.selectedCategory.currentValue &&
      changes.selectedCategory.previousValue &&
      changes.selectedCategory.previousValue.type !== changes.selectedCategory.currentValue.type) {
      this.enableFeedsSearch();
      this.selectedTypes = this.selectedCategory.type;
      this.defaultTypesSelected = this.selectedTypes === this.types;
      this.getFeeds('', '', this.search);
    }
  }

  public showMore($evt?): void {
    if (this.feeds && this.feeds.length && this.hasMore) {
      this.addFeedsIsLoading = true;
      const last = this.feeds[this.feeds.length - 1];
      const date = last.date;
      this.getFeeds(last.id, date ? moment(date).toDate() : '', this.search);

      if ($evt) {
        this.onShowMoreClick($evt);
      }
    }
  }

  private enableFeedsSearch(): void {
    this.feedsIsLoading = true;
    this.feeds = [];
  }

  public getFeeds(lastFeedId: number | string = '', lastFeedDate: Date | string = '', query = '', pageSize = ''): void {
    this.afterFirstSearch = true;
    this.allFeedsLoaded = false;
    this.searching.emit(true);
    this.feedsSubscription = this.feedsService.getFeeds({
      isArchive: this.getIsArchive(),
      isHide: this.isHide,
      pageSize: pageSize ? pageSize : this.count.toString(),
      types: this.selectedTypes || this.types,
      lastFeedId: lastFeedId.toString(),
      lastFeedDate,
      q: query
    })
      .subscribe((feeds: FeedsModel) => {
        this.searching.emit(false);
        this.feeds = this.feeds && this.feeds.length ? this.feeds.concat(feeds.items) : feeds.items;
        this.feedsIsLoading = false;
        this.addFeedsIsLoading = false;
        this.hasMore = feeds.hasMore;
        if (!!['AL10', 'AL15'].includes(this.loadService.user.assuranceLevel)) {
          this.feeds.forEach((item, index) => {
            if (item.feedType === 'SIGN') {
                this.feeds.splice(index, 1);
              } else {
                item.status = this.statusesMap[item.status] || item.status;
              }
          });
        }
        this.emitEmptyFeedsEvent();
        this.loadedFeedsCount += this.feeds.length;
        this.yaMetricOnSearch(query);
        this.yaMetricOnFilter();
        this.changeDetector.detectChanges();
      }, () => {
        this.serviceError.emit(true);
      });
  }

  public emitEmptyFeedsEvent(): void {
    this.emptyFeeds.emit(this.feeds && this.feeds.length === 0);
  }

  public trackById(index, item) {
    return item.id;
  }

  public openDetails(feed: FeedModel): string {
    return this.feedsService.openDetails(feed);
  }

  public withReload(feed): boolean {
    return !(this.isLk && !['KND_APPEAL', 'KND_APPEAL_DRAFT', 'PAYMENT'].includes(feed.feedType) || this.isPartners);
  }

  public getUserData(): User {
    return this.user = this.loadService.user;
  }

  public setFeedItemCls(feed: FeedModel): string[] {
    return [feed.data.imOrgName ? 'feed-im' : '',
      'feed-' + feed.feedType, 'feed-' + this.page,
      feed.removeInProgress ? 'feed-remove-in-progress' : '',
      this.isUpdated(feed) ? 'is-updated' : '',
      this.setUnreadFeedCls(feed) && this.isHeader ? 'feed-header-unread' : ''
    ];
  }

  public setUnreadFeedCls(feed: FeedModel): boolean {
    const escapedFeedTypes = ['DRAFT', 'PARTNERS_DRAFT', 'KND_APPEAL_DRAFT'];
    return feed.unread && !escapedFeedTypes.includes(feed.feedType);
  }

  public markAsFlag(feed: FeedModel): boolean {
    return feed.hasLegal || feed.isLegal || feed.data.hasRegLetter;
  }

  public isFormattedLoginName(feed: FeedModel): boolean {
    return !!(feed.data.orderCreator && feed.data.orderCreator.formattedLoginName);
  }

  public isOrderCreator(feed: FeedModel): boolean {
    return (this.user.userType === 'B' || this.user.userType === 'L') &&
      !!(this.isFormattedLoginName(feed) || (feed.data.orderDescription));
  }

  public checkImSnippets(feed: FeedModel): boolean {
    return !!(feed.status === 'edit' && this.checkSnippetsExists(feed));
  }

  public checkSnippetsExists(feed: FeedModel): boolean {
    return !!(this.snippets && feed.data && feed.data.snippets && feed.data.snippets.length);
  }

  public isSnippetTypeIM(feed: FeedModel): boolean {
    return this.checkSnippetsExists(feed) && feed.data.snippets[0].type === 'IM';
  }

  public isSnippetTypeNotIM(feed: FeedModel): boolean {
    if (this.checkSnippetsExists(feed)) {
      return feed.data.snippets[0].type !== 'IM';
    }
    return true;
  }

  public getSnippetsDate(feed: FeedModel): string {
    if (feed.data && feed.data.snippets && feed.data.snippets.length) {
      const date = feed.data.snippets[0].localDate || feed.data.snippets[0].date;
      return date ? moment(date).format('DD.MM.YYYY, ddd, HH:mm ') : '';
    }
    return '';
  }

  public getSnippetsOrgName(feed: FeedModel): string {
    if (this.checkSnippetsExists(feed)) {
      return feed.data.snippets[0].orgName || '';
    }
    return '';
  }

  public showFeedDate(feed: FeedModel): boolean {
    if (feed.data.snippets && feed.data.snippets.length) {
      // если есть хотя бы один сниппет с записью на прием, то дату имзенения заявления не отображаем
      return feed.data.snippets.filter((snippet) => {
        return snippet.type === 'EQUEUE';
      }).length === 0;
    }
    return true;
  }

  public getSnippetType(feed: FeedModel): string {
    return feed.data.snippets && feed.data.snippets.length ? feed.data.snippets[0].type : '';
  }

  public showExpiryDateDraft(feed: FeedModel, days: number): boolean {
    if (!feed.data.expiryDate) {
      return false;
    }
    const end = moment(feed.data.expiryDate);
    const start = moment();
    const dayDiff = +end.diff(start, 'days');

    return Math.abs(dayDiff) <= days && !feed.data.imOrgName;
  }

  public showExpiryForLk(feed: FeedModel): boolean {
    return this.showExpiryDateDraft(feed, 87) && this.loadService.config.viewType === 'LK';
  }

  public enableShowMoreButton(): boolean {
    return this.feeds && !this.feedsIsLoading && !this.addFeedsIsLoading && !!this.feeds.length;
  }

  public isFeedsEmpty(): boolean {
    return this.feeds && !this.feeds.length && !this.feedsIsLoading;
  }

  public ngOnDestroy(): void {
    this.feedsSubscription.unsubscribe();
    this.feedsUpdateSubscription.unsubscribe();
  }

  public isBranchNameExists(feed): string {
    return feed.data.branch && feed.data.branch.name;
  }

  public setHeader(feed: FeedModel): string {
    if (feed.feedType === 'GEPS' ||
        feed.feedType === 'ORDER' ||
        feed.feedType === 'CLAIM' ||
        feed.feedType === 'PARTNERS' ||
        feed.feedType === 'COMPLEX_ORDER'
    ) {
      return feed.subTitle;
    }
    return feed.title;
  }

  public setSubHeader(feed: FeedModel): string {
    if (feed.feedType === 'GEPS' ||
        feed.feedType === 'ORDER' ||
        feed.feedType === 'CLAIM' ||
        feed.feedType === 'PARTNERS' ||
        feed.feedType === 'COMPLEX_ORDER'
    ) {
      return feed.title;
    }
    return feed.subTitle;
  }

  private isIpshAborted(feed: FeedModel): boolean {
    return ['PAY_SERVICE_ABORTED', 'PAYMENT_ABORTED'].indexOf(feed.data.ipshPaymentStatus) !== -1;
  }

  private checkSnippetStatus(snippet: SnippetModel, feed: FeedModel): boolean {
    return snippet.type === 'PAYMENT' && feed.status !== 'reject_no_pay' && !!snippet.sum;
  }

  private isOrderReject(snippet: SnippetModel, feed: FeedModel): boolean {
    return snippet.type === 'PAYMENT' && feed.feedType === 'ORDER' && feed.status === 'reject';
  }

  public showSnippets(snippet: SnippetModel, feed: FeedModel): boolean {
    if (this.isIpshAborted(feed) || this.isOrderReject(snippet, feed)) {
      return false;
    }
    if (this.checkSnippetStatus(snippet, feed)) {
      return !snippet.payDate || moment(snippet.payDate) >= moment();
    }
    return true;
  }

  public removeFeed($event: MouseEvent, feed: FeedModel, index: number): void {
    this.yaMetricRemoveFeed();
    const onSubscribe = (res: string) => {
      this.feeds.splice(index, 1);
      this.notifier.success({
        message: res
      });
      const feedsLength = this.feeds.length;
      if (feedsLength) {
        const last = this.feeds[feedsLength - 1];
        const date = last.date;
        this.getFeeds(last.id, date ? moment(date).toDate() : '', this.search, '1');
      }
      this.removeInProgress = false;
      this.changeDetector.detectChanges();
    };
    const onRemoveError = () => {
      this.translate.get('FEEDS.ERROR').subscribe((errorText: string) => {
        this.notifier.error({
          message: errorText
        });
        this.removeInProgress = false;
        feed.removeInProgress = false;
        this.changeDetector.detectChanges();
      })
    }
    if (!this.removeInProgress) {
      this.removeInProgress = true;
      feed.removeInProgress = true;
      if (this.page === 'drafts') {
        this.feedsService.removeDraft(feed.extId)
          .pipe(
            switchMap(() => this.translate.get('FEEDS.DELETED'))
          ).subscribe(onSubscribe, onRemoveError);
      } else {
        this.feedsService.removeFeed(feed.id)
          .pipe(
            switchMap(() => this.translate.get('FEEDS.DELETED'))
          ).subscribe(onSubscribe, onRemoveError);
      }
    }

    $event.preventDefault();
    $event.stopPropagation();

  }

  public showRemoveFeedButton(feed: FeedModel): boolean {
    return ['overview', 'events', 'drafts', 'partners_drafts', 'knd_appeal_draft'].includes(this.page) && !feed.data.reminder && !this.isPaymentDraft(feed);
  }

  public isPaymentDraft(feed: FeedModel): boolean {
    return feed.feedType === 'DRAFT' && feed.data.snippets?.length &&  feed.data.snippets.some((item: SnippetModel) => {
      return item.type === 'PAYMENT' && feed.status !== 'reject_no_pay' && !!item.sum;
    });
  }

  public getIsArchive(): boolean {
    return ['DRAFT', 'PARTNERS_DRAFT', 'KND_APPEAL_DRAFT'].includes(this.selectedTypes) ? undefined : this.isArchive;
  }

  public isUpdated(feed: FeedModel): boolean {
    return (feed.feedType === 'PARTNERS' || feed.feedType === 'ORDER' ||
      feed.feedType === 'COMPLEX_ORDER' || feed.feedType === 'EQUEUE' ||
      feed.feedType === 'CLAIM') && feed.unread;
  }

  public isEqueueEvent(feed: FeedModel): boolean {
    return feed.feedType === 'EQUEUE';
  }

  public updateFeeds(): void {
    this.sharedService.send('feedsUpdate');
    this.feedsUpdateSubscription = this.sharedService.on('feedsUpdate').subscribe((data) => {
      if (data) {
        this.feeds = [];
        this.feedsIsLoading = true;
        this.addFeedsIsLoading = false;
        this.allFeedsLoaded = false;
        this.getUserData();
        this.getFeeds();
        this.changeDetector.detectChanges();
      }
    }, () => {
      this.serviceError.emit(true);
    });
  }

  public getIpshStatus(feed: FeedModel): string {
    if (feed.data && feed.data.ipshPaymentStatus) {
      return feed.data.ipshPaymentStatus;
    }
    return '';
  }

  private yaMetricRemoveFeed(): void {
    if (this.page === 'overview') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        from: 'overview',
        short: 'action',
        hideEvent: true,
        total: this.countersService.total,
        screen: this.loadService.attributes.deviceType
      });
    } else if (this.page === 'events') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        from: 'overviewAllEvents',
        all: 'action',
        hideEvent: true,
        total: this.countersService.total,
        screen: this.loadService.attributes.deviceType
      });
    }
  }

  public onShowMoreClick($evt?): void {
    $evt.stopPropagation();
    if (this.page === 'overview') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        from: 'overview',
        short: 'action',
        feedButton: true,
        screen: this.loadService.attributes.deviceType

      });
    } else if (this.page === 'events') {
      this.showMoreCount += 1;
      this.yaMetricService.callReachGoal('overviewEvents', {
        from: 'overviewAllEvents',
        all: 'action',
        showMoreFeed: true,
        loadedFeedsCount: this.loadedFeedsCount,
        showMoreCount: this.showMoreCount,
        screen: this.loadService.attributes.deviceType
      });
    } else if (this.page === 'orders') {
      this.yaMetricService.callReachGoal('feedsOrder', {
        action: 'showMoreFeed',
        from: 'feedsOrder',
        total: this.countersService.total,
        unread: this.countersService.unread,
        screen: this.loadService.attributes.deviceType
      });
    }

    if (!this.isLk) {
      location.href = `${this.loadService.config.urlLk}` + 'notifications';
    }

    if (this.page === 'overview') {
      this.router.navigate(['/notifications']);
    }
  }

  public onFeedClick(event: Event, feed: FeedModel): void {
    if (this.page === 'overview') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        from: 'overview',
        short: 'action',
        screen: this.loadService.attributes.deviceType

      });
    } else if (this.page === 'events') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        from: 'overviewAllEvents',
        all: 'action',
        screen: this.loadService.attributes.deviceType
      });
    } else if (this.page === 'orders') {
      this.yaMetricService.callReachGoal('feedsOrder', {
        action: 'feedRow',
        from: 'feedsOrder',
        screen: this.loadService.attributes.deviceType
      });
    }

    if (['ORGANIZATION', 'BUSINESSMAN', 'ACCOUNT_CHILD', 'PAYMENT'].includes(feed.feedType)) {
      this.feedsService.markFeedAsRead(feed.id).subscribe();
    }
  }

  private yaMetricOnSearch(query: string) {
    if (this.page === 'events') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        all: 'search',
        query,
        count: this.feeds.length,
        screen: this.loadService.attributes.deviceType
      });
    } else if (this.page === 'orders') {
      this.yaMetricService.callReachGoal('feedsOrder', {
        action: 'search',
        query,
        count: this.feeds.length,
        screen: this.loadService.attributes.deviceType
      });
    }
  }

  private yaMetricOnFilter(): void {
    if (!this.selectedCategory || !this.selectedCategory.type) {
      return;
    }
    if (this.page === 'events') {
      this.yaMetricService.callReachGoal('overviewEvents', {
        all: 'filter',
        count: this.feeds.length,
        type: this.selectedCategory.mnemonic,
        screen: this.loadService.attributes.deviceType
      });
    } else if (this.page === 'orders') {
      this.yaMetricService.callReachGoal('feedsOrder', {
        action: 'filter',
        count: this.feeds.length,
        type: this.selectedCategory.mnemonic,
        screen: this.loadService.attributes.deviceType
      });
    }
  }

  public notEqueueType(feed: FeedModel, page: string): boolean {
    if (feed.feedType !== 'EQUEUE') {
      return true;
    }
  }

  public clickButton(): void {
    if (this.selectedTypes === 'APPEAL') {
      location.href = this.loadService.config.betaUrl + 'help/obratitsya_v_vedomstvo';
    } else if (this.getIsArchive()) {
      this.router.navigate(['/orders/all']);
    } else if (this.selectedTypes === 'CLAIM') {
      location.href = this.loadService.config.betaUrl + 'pay?categories=fine';
    } else {
      location.href = this.loadService.config.betaUrl + 'category';
    }
  }

  public getFeedbackStatus(feed: FeedModel): string {
    let status = '';
    switch (feed.status) {
      case 'new':
        status = 'Новый';
        break;
      case 'assigned':
        status = 'Назначен';
        break;
      case 'in_progress':
        status = 'Выполняется';
        break;
      case 'waiting':
        status = '';
        break;
      case 'solved':
        status = 'Решено';
        break;
      case 'done': {
        status = 'Решено';
        break;
      }
      case 'closed':
        status = 'Закрыто';
        break;
      case 'canceled':
        status = 'Отменено';
        break;
      case 'request_info':
        status = 'Запрос информации';
        break;
    }
    return status;
  }

  public isKindergartenSnippet(feed: any): boolean {
    return this.checkSnippetsExists(feed) && this.page === 'orders' && feed.data.snippets[0].type === 'CHILD';
  }
}
