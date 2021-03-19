import {
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  OnChanges,
  OnDestroy,
  OnInit,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { User } from '../../models/user';
import { FeedBannerModel, FeedItemModel, FeedModel, FeedsModel } from '../../models/feed';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { FeedsService } from '../../services/feeds/feeds.service';
import { LoadService } from '../../services/load/load.service';
import * as moment_ from 'moment';
import { Banner, BannerGroup } from '../../models/main-page.model';
import { BannersService } from '../../services/banners/banners.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';

const moment = moment_;

@Component({
  selector: 'lib-feeds-geps',
  templateUrl: './feeds-geps.component.html',
  styleUrls: ['./feeds-geps.component.scss']
})
export class FeedsGepsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public search = '';
  @Input() public type: 'inbox' | 'outbox' | '';
  @Input() public archived = false;
  @Output() public searching = new EventEmitter<boolean>();
  @Output() public emptyFeeds = new EventEmitter<boolean>();
  @Output() public serviceError = new EventEmitter<boolean>();

  public user: User;
  public feedItems: FeedItemModel[];
  public addFeedsIsLoading = false;
  public feedsIsLoading = true;
  public feedsNotExistsByFilter: boolean;
  public allFeedsLoaded = false;
  public showMoreButton: boolean;
  private feedsSubscription: Subscription;

  private pageSize = 10;
  private bannerPlace = 'lk-geps';
  public banners: BannerGroup[];
  private activeBanners = 0;

  public get feeds(): FeedModel[] {
    return this.feedItems && this.feedItems.filter(item => this.isFeedModel(item)) as FeedModel[] || [];
  }

  constructor(
    public feedsService: FeedsService,
    public loadService: LoadService,
    private bannersService: BannersService,
    private changeDetector: ChangeDetectorRef,
    public yaMetricService: YaMetricService
  ) {
  }

  public ngOnInit() {
    this.feedsSubscription = forkJoin([
      this.bannersService.getBanners(this.bannerPlace, true),
      this.fetchFeeds()
    ])
      .subscribe(([bannerGroups, feeds]) => {
        this.banners = bannerGroups;
        this.handleFeeds(feeds);
        this.yaMetricService.initBannerYaMetric(bannerGroups);
      }, () => {
      this.serviceError.emit(true);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.onSearch(changes);
  }

  private onSearch(changes: SimpleChanges): void {
    if (changes.search && changes.search.currentValue ||
      changes.search && changes.search.currentValue === '' && changes.search.previousValue) {
      this.enableFeedsSearch();
      this.getFeeds('', '', this.search);
    }
  }

  public showMore(): void {
    if (this.feeds.length) {
      this.addFeedsIsLoading = true;
      const last = this.feeds[this.feeds.length - 1];
      const date = last.date;
      this.getFeeds(last.id, date ? moment(date).toDate() : '', this.search);
    }
  }

  private enableFeedsSearch(): void {
    this.feedsIsLoading = true;
    this.resetFeedItems();
  }

  public updateFeeds() {
    this.feedsIsLoading = true;
    this.resetFeedItems();
    this.getFeeds();
  }

  public getFeeds(lastFeedId: number | string = '', lastFeedDate: Date | string = '', query = ''): void {
    this.feedsNotExistsByFilter = false;
    this.allFeedsLoaded = false;
    this.searching.emit(true);
    if (this.feedsSubscription) {
      this.feedsSubscription.unsubscribe();
    }
    this.feedsSubscription = this.fetchFeeds(lastFeedId, lastFeedDate, query)
      .subscribe((feeds: FeedsModel) => {
        this.handleFeeds(feeds, lastFeedDate, query);
      });
  }

  private fetchFeeds(lastFeedId: number | string = '', lastFeedDate: Date | string = '', query = ''): Observable<FeedsModel> {
    return this.feedsService.getFeeds({
      pageSize: this.pageSize.toString(),
      types: 'GEPS',
      isArchive: this.archived,
      lastFeedId: lastFeedId.toString(),
      lastFeedDate,
      q: query,
      status: this.type
    });
  }

  private checkBanner(feeds): void {
    feeds.forEach((item) => {
      if (!item.feedType) {
        this.yaMetricMessageBanner(item);
      }
    });
  }

  private handleFeeds(feedsModel: FeedsModel, lastFeedDate: Date | string = '', query = ''): void {
    this.searching.emit(false);
    const feeds = this.type ? feedsModel.items.filter(item => item.status === this.type) : feedsModel.items;
    const feedsWithBanner = this.injectBanners(feeds);
    this.feedItems = this.feedItems ? this.feedItems.concat(feedsWithBanner) : feedsWithBanner;
    if (!this.feedItems.length) {
      this.emptyFeeds.emit(true);
    }
    this.feedsIsLoading = false;
    this.addFeedsIsLoading = false;
    this.showMoreButton = feedsModel.hasMore;
    this.checkFeedsExists(lastFeedDate, query);
    this.yaMetricOnSearch(query);
    this.checkBanner(feeds);
    this.changeDetector.detectChanges();
  }

  private yaMetricOnSearch(query: string) {
    this.yaMetricService.callReachGoal('feedsGeps', {
      search: true,
      query,
      count: this.feeds.length,
      screen: this.loadService.attributes.deviceType
    });
  }

  private checkFeedsExists(lastFeedDate, query): void {
    // Проверяем есть ли фиды у юзера, а также их наличие при разных фильтрах
    if (lastFeedDate || query || this.search) {
      // поиск по категории или по input
      this.feedsNotExistsByFilter = true;
    }
  }

  public trackById(index, item) {
    return item.id;
  }

  public setUnreadFeedCls(feed: FeedModel): boolean {
    return feed.unread && feed.feedType !== 'DRAFT';
  }

  public markAsFlag(feed: FeedModel): boolean {
    return feed.hasLegal || feed.isLegal || feed.data.hasRegLetter;
  }

  public setClsDateByUnread(feed: FeedModel): { [key: string]: boolean } {
    return {gray: !feed.unread, 'notification-item__date': feed.unread};
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

  public enableShowMoreButton(): boolean {
    return !this.feedsIsLoading && !this.addFeedsIsLoading && this.showMoreButton;
  }

  public isFeedsEmpty(): boolean {
    return this.feeds && !this.feeds.length && !this.feedsIsLoading;
  }

  public getAmount(feed: FeedModel) {
    function discountIsActual(): boolean {
      return feed.data.DiscountDate && moment(feed.data.snippets[0].discountDate) >= moment();
    }

    if (feed.data.snippets?.length) {
      if ((!feed.data.snippets[0].discountDate || !discountIsActual()) && feed.data.snippets[0].originalAmount) {
        return feed.data.snippets[0].originalAmount;
      }
      return feed.data.snippets[0].sum;
    }
    return null;
  }

  public isAttach(feed: FeedModel) {
    return feed.data.attachCnt !== 0;
  }

  public ngOnDestroy(): void {
    if (this.feedsSubscription) {
      this.feedsSubscription.unsubscribe();
    }
  }

  public isFeedModel(feedItem: FeedItemModel | FeedBannerModel): boolean {
    return 'feedType' in feedItem;
  }

  private getBannerMnemonic(path: string): string {
    let mnemonic = '';
    if (path && path.includes('.')) {
      mnemonic = path.split('.')[1];
    } else {
      const group = (this.banners || []).find((bannerGroup: BannerGroup) => bannerGroup.group === path);
      mnemonic = group && group.banners && group.banners.length === 1 ? group.banners[0].mnemonic : '';
    }
    return mnemonic;
  }

  private yaMetricMessageBanner(feedItem: FeedBannerModel): void {
    const mnemonic = this.getBannerMnemonic(feedItem.path);
    if (!mnemonic) {
      return;
    }
    this.yaMetricService.callReachGoal('new_lk_banners_geps', {
      banners: 'show',
      banner: mnemonic,
      screen: this.loadService.attributes.deviceType
    });
  }

  public onBannerClick(path: string): void {
    // TODO: область нажатия на баннер - скорее всего придется эту функцию переносить в комп banner-static
    const mnemonic = this.getBannerMnemonic(path);
    if (!mnemonic) {
      return;
    }
    this.yaMetricService.callReachGoal('new_lk_banners_geps', {
      banners: 'action',
      banner: mnemonic,
      screen: this.loadService.attributes.deviceType
    });
  }

  private injectBanners(feeds: FeedItemModel[]): FeedItemModel[] {
    const part: FeedItemModel[] = [].concat(feeds);
    if (part.length > 1) {
      const banner = this.getActualBanner();
      if (banner) {
        if (part.length > 3) {
          part.splice(3, 0, banner);
        } else {
          part.push(banner);
        }
        this.activeBanners++;
      }
    }
    return part;
  }

  private getActualBanner(): FeedBannerModel {
    const banners = this.getGroupBanners();
    if (this.activeBanners === banners.length) {
      this.activeBanners = 0;
    }
    const banner = banners.length && this.activeBanners < banners.length ? banners[this.activeBanners] : null;
    return banner ? {path: this.bannerPlace + '.' + banner.mnemonic} : null;
  }

  public onCloseBanner(model: FeedBannerModel) {
    const mnemonic = this.bannersService.getMnemonic(model.path);
    model.closed = true;
    this.yaMetricService.callReachGoal('new_lk_banners_geps', {
      banners: 'action',
      banner: mnemonic,
      area: 'close',
      type: this.loadService.attributes.deviceType
    });
    this.bannersService.closeBanner(mnemonic);
  }

  private getGroupBanners(): Banner[] {
    if (this.banners && this.banners.length) {
      const group = this.banners[0];
      if (group.banners.length) {
        return group.banners;
      }
    }
    return [];
  }

  private resetFeedItems(): void {
    this.feedItems = [];
    this.activeBanners = 0;
  }

  public onFeedGepsClick() {
    this.yaMetricService.callReachGoal('feedsGeps', {
      from: 'feedRow',
      action: 'feedRow',
      screen: this.loadService.attributes.deviceType

    });
  }
}
