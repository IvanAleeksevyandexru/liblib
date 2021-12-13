import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FeedsService } from '@epgu/ui/services/feeds';
import { FeedDataModel, FeedModel, FeedsModel, SnippetModel } from '@epgu/ui/models';
import { LoadService } from '@epgu/ui/services/load';
import { User } from '@epgu/ui/models/user';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NotifierService } from '@epgu/ui/services/notifier';
import { SharedService } from '@epgu/ui/services/shared';
import { HelperService } from '@epgu/ui/services/helper';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { CountersService } from '@epgu/ui/services/counters';
import { ActivatedRoute, Router } from '@angular/router';
import { differenceInDays, differenceInYears, format, isAfter, isValid, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LibTranslateService } from '@epgu/ui/services/translate';
import { UserHelperService } from '@epgu/ui/services/user-helper';
import { ConfirmActionComponent } from '@epgu/ui/components/confirm-action';
import { ModalService } from '@epgu/ui/services/modal';

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
  @Input() public unread: boolean;
  @Input() public selectedCategory: any;
  @Input() public count = 0;
  @Input() public types: string | null;
  @Input() public page = 'overview';
  @Input() public autoload: boolean;
  @Output() public emptyFeeds: EventEmitter<boolean> = new EventEmitter();
  @Output() public searching = new EventEmitter<boolean>();
  @Output() public serviceError = new EventEmitter<boolean>();
  @Output() public archiveMoving = new EventEmitter<'fromArchive' | 'inArchive'>();

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
    SIGN_REJECT: 'in_progress',
    DONE: 'executed',
    EXPIRED: 'in_progress',
    ERROR: 'reject',
    RESULT_FILE_NOT_FOUND: 'reject',
    FILE_MAP_FAIL: 'reject',
    MIMETYPE_LENGTH_INCORRECT: 'reject'
  };
  private titlesMap = {
    DONE: 'Документы подписаны',
    REQUEST: 'Запрос на подписание документов',
    REQUEST_ERROR: 'Ошибка запроса',
    SIGN_REJECT: 'Подписание документов отклонено',
    EXPIRED: 'Истекло время подписания документов',
    ERROR: 'Ошибка запроса',
    RESULT_FILE_NOT_FOUND: 'Ошибка запроса',
    FILE_MAP_FAIL: 'Ошибка запроса',
    MIMETYPE_LENGTH_INCORRECT: 'Ошибка запроса'
  };
  public isHeader: boolean;
  public config = this.loadService.config;

  public getFeedTypeName = this.feedsService.getFeedTypeName;

  public get emptyMessageTitle(): string {
    if (this.search) {
      if (this.types === 'PARTNERS_DRAFT' || this.page === 'drafts') {
        return 'FEEDS.NOT_FOUND.DRAFTS';
      } else if (this.page === 'orders') {
        return 'FEEDS.NOT_FOUND.ORDERS';
      }
      return 'FEEDS.NOT_FOUND.DEFAULT';
    }

    if (this.types === 'PARTNERS_DRAFT') {
      return 'FEEDS.EMPTY.PARTNERS_DRAFT';
    } else if (this.types === 'PARTNERS') {
      return 'FEEDS.EMPTY.PARTNERS';
    } else if (this.page === 'drafts') {
      return 'FEEDS.EMPTY.DRAFT';
    } else if (this.page === 'orders') {
      return 'FEEDS.EMPTY.ORDERS';
    } else if (this.selectedCategory?.mnemonic) {
      return `FEEDS.EMPTY.${this.selectedCategory.mnemonic.toUpperCase()}`;
    }
    return 'FEEDS.EMPTY.DEFAULT';
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public feedsService: FeedsService,
    public loadService: LoadService,
    public notifier: NotifierService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef,
    private sharedService: SharedService,
    public yaMetricService: YaMetricService,
    private countersService: CountersService,
    private libTranslate: LibTranslateService,
    private userHelper: UserHelperService,
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
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
      changes.selectedCategory.previousValue.mnemonic !== changes.selectedCategory.currentValue.mnemonic) {
      this.enableFeedsSearch();
      this.selectedTypes = this.selectedCategory.type;
      this.defaultTypesSelected = this.selectedTypes === this.types;
      this.unread = this.selectedCategory.mnemonic === 'unread';
      this.getFeeds('', '', this.search);
    }
  }

  public showMore($evt?): void {
    if (this.feeds && this.feeds.length && this.hasMore) {
      this.addFeedsIsLoading = true;
      const last = this.feeds[this.feeds.length - 1];
      const date = last.date;
      this.getFeeds(last.id, date ? date : '', this.search);

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
      q: query,
      unread: this.unread
    })
      .subscribe((feeds: FeedsModel) => {
        this.searching.emit(false);
        const feedsItems = feeds.items.map<FeedModel>((feed) => {
          if (feed.status === 'invite_to_equeue') {
            if (!feed.data.snippets) {
              feed.data.snippets = [];
            }
            feed.data.snippets.push({type: 'INVITE', comment: 'Выберите время для визита в ведомство'});
          }
          if (feed.data.snippets) {
            feed.data.snippets = feed.data.snippets.filter(item => {
              const isDraft = item.type === 'DRAFT';
              const paid = item.type === 'PAYMENT' && feed.data.reminder;
              const rejectedPayment = item.type === 'PAYMENT' && feed.status === 'reject_no_pay';
              return !(isDraft || paid || rejectedPayment);
            });
          }
          if (feed.data.orderCreator) {
            feed.data.orderCreator = this.parseDataParam(feed.data, 'orderCreator');
          }
          if (feed.data.branch) {
            feed.data.branch = this.parseDataParam(feed.data, 'branch');
          }
          return {
            ...feed,
            data: {
              ...feed.data,
              snippets: feed?.data?.snippets?.map((item) => {
                let snippet: any = null;
                if (item.type === 'CHILD') {
                  if (item.birthDate) {
                    item.years = this.getYears(item.birthDate);
                  }
                } else if (item.type === 'CUSTOM' && item.json) {
                  snippet = {
                    json: JSON.parse(item?.json),
                    type: item?.type,
                  };
                  if (snippet.json.birthDate) {
                    snippet.json.years = this.getYears(snippet.json.birthDate);
                  }
                }
                return snippet
                  ? snippet
                  : item;
              }),
            }
          };
        });
        this.feeds =
          this.feeds && this.feeds.length
            ? this.feeds.concat(feedsItems)
            : feedsItems;

        this.feedsIsLoading = false;
        this.addFeedsIsLoading = false;
        this.hasMore = feeds.hasMore;
        this.feeds.forEach((item, index) => {
          if (item.feedType === 'SIGN') {
            if (!!['AL10', 'AL15'].includes(this.loadService.user.assuranceLevel)) {
              this.feeds.splice(index, 1);
            } else {
              item.title = item.title || this.titlesMap[item.status];
              item.status = this.statusesMap[item.status] || item.status;
            }
          }
        });
        this.emitEmptyFeedsEvent();
        this.loadedFeedsCount += this.feeds.length;
        this.yaMetricOnSearch(query);
        this.yaMetricOnFilter();
        this.changeDetector.detectChanges();
      }, () => {
        this.feedsIsLoading = false;
        this.serviceError.emit(true);
      });
  }

  private parseDataParam(data: FeedDataModel, paramName: string): any {
    let paramAsObj;
    try {
      paramAsObj = JSON.parse(data[paramName]);
    } catch {
      paramAsObj = null;
    }
    return paramAsObj;
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
    const otherDomainFeeds = ['KND_APPEAL', 'KND_APPEAL_DRAFT', 'PAYMENT'];
    return !(this.isLk && !otherDomainFeeds.includes(feed.feedType) || this.isPartners) || !!(feed.data && feed.data.p16url);
  }

  public getUserData(): User {
    return this.user = this.loadService.user;
  }

  public setFeedItemCls(feed: FeedModel): string[] {
    return [feed.data.imOrgName ? 'feed-im' : '',
      'feed-' + feed.feedType, 'feed-' + this.page,
      feed.removeInProgress ? 'feed-remove-in-progress' : '',
      this.isUpdated(feed) ? 'is-updated' : '',
      this.setUnreadFeedCls(feed) ? 'feed-header-unread' : ''
    ];
  }

  public setUnreadFeedCls(feed: FeedModel): boolean {
    const escapedFeedTypes = ['DRAFT', 'PARTNERS_DRAFT', 'KND_APPEAL_DRAFT'];
    return feed.unread && !escapedFeedTypes.includes(feed.feedType);
  }

  public isFormattedLoginName(feed: FeedModel): boolean {
    return !!(feed.data.orderCreator && feed.data.orderCreator.formattedLoginName);
  }

  public isOrderCreator(feed: FeedModel): boolean {
    return (this.userHelper.isIP || this.userHelper.isEntity) &&
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

  public isDraft(feed: FeedModel): boolean {
    return ['DRAFT', 'PARTNERS_DRAFT', 'KND_APPEAL_DRAFT'].includes(feed.feedType);
  }

  public isOrder(feed: FeedModel): boolean {
    return ['ORDER', 'EQUEUE', 'APPEAL', 'CLAIM', 'COMPLEX_ORDER', 'SIGN'].includes(feed.feedType);
  }

  public isMain(): boolean {
    return this.page === 'main';
  }

  public getSnippetsDate(feed: FeedModel): string {
    if (feed.data && feed.data.snippets && feed.data.snippets.length) {
      const date = feed.data.snippets[0].localDate || feed.data.snippets[0].date;
      return date ? format(new Date(date), 'dd.MM.yyyy, EEEEEE, HH:mm ', {locale: ru}) : '';
    }
    return '';
  }

  public getSnippetsOrgName(feed: FeedModel): string {
    if (feed.data.snippets?.length) {
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
    const end = new Date(feed.data.expiryDate);
    const start = new Date();
    const dayDiff = +differenceInDays(end, start);

    return Math.abs(dayDiff) <= days && !feed.data.imOrgName;
  }

  public showExpiryForLk(feed: FeedModel): boolean {
    return this.showExpiryDateDraft(feed, 87) && this.loadService.config.viewType === 'LK';
  }

  public enableShowMoreButton(): boolean {
    return this.feeds && !this.feedsIsLoading && !this.addFeedsIsLoading && !!this.feeds.length && !this.isMain();
  }

  public isFeedsEmpty(): boolean {
    return !this.feedsIsLoading && this.feeds && (!this.feeds.length || this.feeds.every(item => item.isHidden));
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

  private isOrderExecuted(snippet: SnippetModel, feed: FeedModel): boolean {
    return snippet.type === 'PAYMENT' && feed.feedType === 'ORDER' && feed.status === 'executed';
  }

  public showSnippets(snippet: SnippetModel, feed: FeedModel): boolean {
    if (this.isIpshAborted(feed) || this.isOrderReject(snippet, feed) || this.isOrderExecuted(snippet, feed)) {
      return false;
    }
    if (this.checkSnippetStatus(snippet, feed)) {
      return !snippet.payDate || isAfter(new Date(snippet.payDate), new Date());
    }
    return true;
  }

  public checkRemoveFeed($event: MouseEvent, feed: FeedModel, index: number): void {
    $event.preventDefault();
    $event.stopPropagation();

    const popupTexts = [
      'FEEDS.DELETE.TITLE',
      'FEEDS.DELETE.TEXT',
      'FEEDS.DELETE.ACCEPT',
      'FEEDS.DELETE.CANCEL'
    ];

    this.libTranslate.get(popupTexts).subscribe(texts => {
      this.modalService.popupInject(ConfirmActionComponent, this.moduleRef, {
        title: texts['FEEDS.DELETE.TITLE'],
        subtitle: texts['FEEDS.DELETE.TEXT'],
        popupClassModifier: 'text-left',
        buttons: [{
          title: texts['FEEDS.DELETE.ACCEPT'],
          handler: () => {
            this.modalService.destroyForm();
            this.removeFeed(feed, index);
          }
        }, {
          title: texts['FEEDS.DELETE.CANCEL'],
          color: 'white',
          handler: () => {
            this.modalService.destroyForm();
          }
        }]
      });
    });
  }

  public removeFeed(feed: FeedModel, index: number): void {
    this.yaMetricRemoveFeed();
    const onSubscribe = () => {
      this.feeds.splice(index, 1);
      const feedsLength = this.feeds.length;
      if (feedsLength && this.hasMore) {
        const last = this.feeds[feedsLength - 1];
        const date = last.date;
        this.getFeeds(last.id, date ? date : '', this.search, '1');
      }
      this.removeInProgress = false;
      this.changeDetector.detectChanges();
    };
    const onRemoveError = () => {
      this.libTranslate.get('FEEDS.DELETE.DRAFT_DELETED_ERROR').subscribe((errorText: string) => {
        this.notifier.error({
          message: errorText,
          onAction: () => {
            this.removeFeed(feed, index);
          }
        });
        this.removeInProgress = false;
        feed.removeInProgress = false;
        this.changeDetector.detectChanges();
      });
    };
    if (!this.removeInProgress) {
      this.removeInProgress = true;
      feed.removeInProgress = true;
      if (['DRAFT', 'KND_APPEAL_DRAFT'].includes(feed.feedType)) {
        this.feedsService.removeDraft(feed.extId).subscribe(onSubscribe, onRemoveError);
      } else {
        this.feedsService.removeFeed(feed.id).subscribe(onSubscribe, onRemoveError);
      }
    }
  }

  public moveInArchive(feed: FeedModel, index: number) {
    let timeout;
    const successArchiveMoving = () => {
      // Так как возможна отмена действия (отмена в бабле), сначала фид просто скрываем.
      feed.isHidden = true;
      // По истечении времени, которое показывается бабл, удаляем фид из списка.
      timeout = setTimeout(() => {
        this.feeds.splice(index, 1);
      }, 5000);
      this.archiveMoving.emit(this.isArchive ? 'fromArchive' : 'inArchive');

      const feedsLength = this.feeds.length;
      if (feedsLength && this.hasMore) {
        const last = this.feeds[feedsLength - 1];
        const date = last.date;
        this.getFeeds(last.id, date ? date : '', this.search, '1');
      }

      this.changeDetector.detectChanges();
    };

    if (this.isArchive) {
      this.feedsService.getFromArchive([feed.id]).subscribe(res => {
        successArchiveMoving();
        this.notifier.success({
          message: this.page === 'orders' ? 'Заявление извлечено из архива' : 'Уведомление извлечено из архива',
          onCancel: () => {
            // Отменяем удаление фида из списка и делаем его снова видимым
            clearTimeout(timeout);
            this.feedsService.putToArchive([feed.id]).subscribe(() => {
              feed.isHidden = false;
              this.archiveMoving.emit('inArchive');
              this.changeDetector.detectChanges();
            });
          }
        });
      }, error => {
        this.notifier.success({
          message: 'Не удалось извлечь из архива',
        });
      });
    } else {
      this.feedsService.putToArchive([feed.id]).subscribe(res => {
        successArchiveMoving();
        this.notifier.success({
          message: this.page === 'orders' ? 'Заявление перемещено в архив' : 'Уведомление перемещено в архив',
          onCancel: () => {
            // Отменяем удаление фида из списка и делаем его снова видимым
            clearTimeout(timeout);
            this.feedsService.getFromArchive([feed.id]).subscribe(() => {
              feed.isHidden = false;
              this.archiveMoving.emit('fromArchive');
              this.changeDetector.detectChanges();
            });
          }
        });
      }, error => {
        this.notifier.success({
          message: 'Не удалось перенести в архив'
        });
      });
    }
  }

  public actionsEnabled(): boolean {
    return !this.isHeader && !this.isMain() && !['overview', 'orders'].includes(this.page);
  }

  public showRemoveFeedButton(feed: FeedModel): boolean {
    const rightPage = ['drafts', 'partners_drafts', 'knd_appeal_draft'].includes(this.page) ||
      this.page === 'events' && this.isDraft(feed);
    return rightPage && !feed.data.reminder && !this.isPaymentDraft(feed);
  }

  public showArchiveFeedButton(feed: FeedModel): boolean {
    if (this.isArchive) {
      return true;
    }
    if (this.isOrder(feed)) {
      return ['reject', 'executed'].includes(feed.status) && !feed.unread;
    }
    if (this.isDraft(feed)) {
      return false;
    }
    return !feed.unread;
  }

  public isPaymentDraft(feed: FeedModel): boolean {
    return feed.feedType === 'DRAFT' && feed.data.snippets?.length && feed.data.snippets.some((item: SnippetModel) => {
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

    if (['ORGANIZATION', 'BUSINESSMAN', 'ACCOUNT', 'ACCOUNT_CHILD', 'PAYMENT'].includes(feed.feedType)) {
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
        status = 'Новое';
        break;
      case 'assigned':
        status = 'Назначен ответственный';
        break;
      case 'in_progress':
        status = 'Выполняется';
        break;
      case 'waiting':
        status = 'В ожидании';
        break;
      case 'solved':
        status = 'Решено';
        break;
      case 'done':
        status = 'Решено';
        break;
      case 'warn':
        status = 'Срочный запрос  информации';
        break;
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

  public getYears(date: string): string {
    let result = '';
    if (!date) {
      return result;
    }
    const now = new Date();
    const formatDate = parse(date, 'dd.MM.yyyy', new Date());
    const diff = isValid(formatDate) ? differenceInYears(now, formatDate) : 0;
    if (diff && diff > 0) {
      result = String(diff) + HelperService.pluralize(
        diff,
        [' год', ' года', ' лет']
      );
    }
    return result;
  }
}
