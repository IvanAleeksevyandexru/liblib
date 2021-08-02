import { Component, ViewChild, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef,
  HostListener, ChangeDetectorRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { AnimationBuilder, AnimationPlayer, style, animate } from '@angular/animations';
import { Banner, BannerGroup } from '../../models/main-page.model';
import { DragDropManager } from '../../services/drag-drop/drag-drop.manager';
import { DragDropBinding, DragDropType, DragDropDirection, DragDropOffsetType, DragState } from '../../models/drag-drop.model';
import { HelperService } from '../../services/helper/helper.service';
import { interval, Subscription } from 'rxjs';

export const DEFAULT_SLIDE_SHOW_INTERVAL = 6000;
export const DEFAULT_SLIDE_TIME = 300;

@Component({
  selector: 'lib-slider-banner',
  templateUrl: 'banner-slider.component.html',
  styleUrls: [
    './banner-slider.component.scss',
    './banner-slider-portal-main-page.component.scss'
  ]
})
export class SliderBannerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  constructor(
    private animationBuilder: AnimationBuilder,
    private dragDropManager: DragDropManager,
    private changeDetection: ChangeDetectorRef,
  ) {
  }

  @Input() public banners: Array<BannerGroup> = [];
  @Input() public path = '';
  @Input() public templateType: 'default' | 'portal-main-page' = 'default';

  @Input() public slideShow = true;
  @Input() public slideShowInterval = DEFAULT_SLIDE_SHOW_INTERVAL;
  @Input() public slideShowReverse = false;
  @Input() public showArrowBtn = false;
  @Input() public showBullBtn = false;
  @Input() public bullBtnPosition: string;
  @Input() public navBtnStyle: string;
  @Input() public needContainer = true;
  @Input() public showAlwaysArrow = false;

  public activeBanner: Banner = null; // центральный баннер
  public get activeBannerTracable() {
    return this.activeBanner;
  }
  public set activeBannerTracable(value: Banner) {
    this.activeBanner = value;
    this.updateCloseButton();
  }
  public activeBannerFeedIndex = 0;
  public backgroundColor?: string;
  public backgroundImage?: string;

  @Input() public fixedHeight?: number = undefined;
  @Input() public noBorder = true;
  @Input() public borderColor = '';
  @Input() public noBorderRadius = true;
  @Input() public noPadding = true;
  @Input() public closable?: boolean = undefined;
  @Input() public classBannerWrapper?: string;

  @Output() private close = new EventEmitter();
  @Output() private arrowClick = new EventEmitter();

  public bannerList: Array<Banner> = [];
  // лента баннеров имеет циклическую структуру, необходимо чтобы можно было "бесконечно" и гладко прокручивать ленту в любую сторону
  public bannersFeedList: Array<Banner> = [];
  public dragDropBinding: DragDropBinding = null;
  private animationSubscription: Subscription = undefined;

  public closed = false;
  public closeDisplay = false;
  public offset = 0;

  @ViewChild('bannersFeedContainer') private bannersFeedContainer: ElementRef;
  @ViewChild('bannersFeed') private bannersFeed: ElementRef;

  private animationPlayer: AnimationPlayer = null;
  private startDragPosition: number = undefined;

  @HostListener('window:resize')
  public onResize() {
    this.rebuildBannersFeedAccordingToActiveBanner();
  }

  public ngOnInit() {
    this.update();
  }

  public ngOnDestroy() {
    this.cancelSlideShow();
    if (this.animationPlayer) {
      this.animationPlayer.destroy();
      this.animationPlayer = null;
    }
    if (this.dragDropBinding) {
      this.dragDropManager.detach(this.dragDropBinding);
    }
  }

  public ngAfterViewInit() {
    this.rebuildBannersFeedAccordingToActiveBanner();
    this.dragDropBinding = {
      feedElement: this.bannersFeed,
      type: DragDropType.TOUCH, direction: DragDropDirection.HORIZONTAL, offsetType: DragDropOffsetType.POSITION,
      centeringNeeded: true, cleanUp: false, limit: false, centeringDuration: DEFAULT_SLIDE_TIME,
      dragStart: () => {
        this.stopAndFreezeOffsetAnimation();
        this.cancelSlideShow();
      }, dragRelease: (dragState: DragState) => {
        this.offset = dragState.offset;
        this.activeBannerTracable = this.bannersFeedList[dragState.selected];
      }, dragEnd: (dragState: DragState) => {
        this.offset = dragState.offset;
        this.rebuildBannersFeedAccordingToActiveBanner();
      }
    } as DragDropBinding;
    this.dragDropManager.attach(this.dragDropBinding);
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'banners':
        case 'path': {
          this.rebuildBannersList();
          this.rerunSlideShow();
          break;
        }
        case 'slideShow':
        case 'slideShowInterval':
        case 'slideShowReverse': {
          this.rerunSlideShow();
          break;
        }
        case 'closable': {
          this.updateCloseButton();
        }
      }
    }
  }

  public update() {
    // вручную применяет все изменения разом из ngOnChanges
    this.rebuildBannersList();
    this.rerunSlideShow();
    this.updateCloseButton();
  }

  public rebuildBannersList() {
    const group: BannerGroup = (this.banners || []).find((item: BannerGroup) => item.group === this.path);
    if (group) {
      this.bannerList = HelperService.deepCopy(group.banners);  // клонирование чтобы не изменять исходный массив
      this.bannerList.sort((a, b) => {
        if (a.orderNumber > b.orderNumber) {
          return 1;
        }
        if (a.orderNumber < b.orderNumber) {
          return -1;
        }
        return 0;
      });
      if (group.bgImage) {
        if (group.bgImage.indexOf('http') !== -1) {
          this.backgroundImage = (group.bgImage.indexOf('url') !== -1 ? group.bgImage : 'url(' + group.bgImage + ')') + ' 0 0 / cover no-repeat';
        } else {
          this.backgroundColor = group.bgImage;
        }
      }
      this.activeBannerTracable = this.bannerList && this.bannerList.length ? this.bannerList[0] : null;
      this.rebuildBannersFeedAccordingToActiveBanner();
    }
  }

  public excludeActiveBannerOrClose() {
    if (this.closable === true) {
      this.closed = true;
      this.close.emit();
    } else if (this.activeBanner && this.activeBanner.closable) {
      let bannerIndex = this.bannerList.indexOf(this.activeBanner);
      if (bannerIndex !== -1) {
        this.bannerList.splice(bannerIndex, 1);  // удаление на месте в клонированном массиве
      }
      if (this.bannerList.length) {
        if (bannerIndex >= this.bannerList.length) {
          bannerIndex--;
        }
        this.activeBannerTracable = this.bannerList[bannerIndex];
        this.rebuildBannersFeedAccordingToActiveBanner();
      } else {
        this.closed = true;
        this.close.emit();
      }
    }
    if (this.closed) {
      this.cancelSlideShow();
    }
  }

  public rebuildBannersFeedAccordingToActiveBanner() {
    if (!this.listAndViewReady(false)) {
      return;
    }
    const BANNERS_OUT_THE_AREA = this.bannerList.length === 1 ? 0 : Math.round(this.bannerList.length / 2);
    let bannerIndex = this.bannerList.findIndex((item: Banner) => item === this.activeBanner);
    if (bannerIndex === -1) {
      bannerIndex = 0;
    }
    const getCiclicBanner = (base: number, index: number) => {
      if (base + index < 0) {
        return getCiclicBanner(this.bannerList.length - 1, base + index + 1); // перепрыгиваем в конец когда смещение отрицательно
      } else if (base + index >= this.bannerList.length) {
        return getCiclicBanner(0, index - (this.bannerList.length - base)); // в начало если смещение больше размера массива
      } else {
        return this.bannerList[base + index];
      }
    };
    const newBannersFeedList = [];
    for (let i = -BANNERS_OUT_THE_AREA; i <= BANNERS_OUT_THE_AREA; i++) {
      newBannersFeedList.push(getCiclicBanner(bannerIndex, i));
    }
    this.bannersFeedList = newBannersFeedList;
    this.offset = -BANNERS_OUT_THE_AREA * this.stdBannerWidth();
    this.activeBannerFeedIndex = BANNERS_OUT_THE_AREA;
    this.changeDetection.detectChanges();
  }

  public rerunSlideShow() {
    this.cancelSlideShow();
    if (this.slideShow) {
      this.animationSubscription = interval(this.slideShowInterval).subscribe(() => {
        if (this.bannerList && this.bannerList.length > 1) {
          this.slideShowReverse ? this.prevBanner(false) : this.nextBanner(false);
        }
      });
    }
  }

  public cancelSlideShow() {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
      this.animationSubscription = undefined;
    }
  }

  public scrollToBanner(banner: Banner, index: number) {
    if (!this.listAndViewReady(true)) {
      return;
    }
    this.cancelSlideShow();
    const activeBannerIndex: number = this.bannerList.indexOf(this.activeBanner);
    let newBannerIndex: number;
    if (index < activeBannerIndex) {
      newBannerIndex = this.bannersFeedList.indexOf(banner);
    } else {
      newBannerIndex = this.bannersFeedList.lastIndexOf(banner);  // любой итем гарантированно присутствует в ленте
    }
    const offsetDiff = (newBannerIndex - this.activeBannerFeedIndex) * this.stdBannerWidth();
    this.activeBannerTracable = banner;
    const animationTime = Math.max(DEFAULT_SLIDE_TIME, Math.abs(newBannerIndex - this.activeBannerFeedIndex) * 100);
    this.animateOffset(this.offset - offsetDiff, animationTime).then(() => {
      this.rebuildBannersFeedAccordingToActiveBanner();
    });
  }

  // stopAnimation flag is used from template
  public prevBanner(stopAnimation: boolean) {
    if (!this.listAndViewReady(true)) {
      return;
    }
    if (stopAnimation) {
      this.arrowClick.emit();
      this.cancelSlideShow();
    }
    this.activeBannerTracable = this.bannersFeedList[--this.activeBannerFeedIndex];
    this.animateOffset(this.offset + this.stdBannerWidth()).then(() => {
      this.rebuildBannersFeedAccordingToActiveBanner();
    });
  }

  public nextBanner(stopAnimation: boolean) {
    if (!this.listAndViewReady(true)) {
      return;
    }
    if (stopAnimation) {
      this.arrowClick.emit();
      this.cancelSlideShow();
    }
    this.activeBannerTracable = this.bannersFeedList[++this.activeBannerFeedIndex];
    this.animateOffset(this.offset - this.stdBannerWidth()).then(() => {
      this.rebuildBannersFeedAccordingToActiveBanner();
    });
  }

  public updateCloseButton() {
    if (this.closable !== undefined) {
      this.closeDisplay = this.closable;
    } else {
      this.closeDisplay = this.activeBanner && this.activeBanner.closable;
    }
  }

  private animateOffset(newOffset: number, duration?: number) {
    this.animationPlayer = this.animationBuilder.build([
      style({left: this.offset}), animate(duration || DEFAULT_SLIDE_TIME, style({left: newOffset}))
    ]).create(this.bannersFeed.nativeElement);
    this.animationPlayer.play();
    return new Promise((resolve, reject) => {
      this.animationPlayer.onDone(() => {
        resolve();
        this.stopAndFreezeOffsetAnimation();
      });
      this.animationPlayer.onDestroy(reject);
    });
  }

  private stopAndFreezeOffsetAnimation() {
    if (this.animationPlayer) {
      if (this.animationPlayer.hasStarted()) {
        this.animationPlayer.pause();
      }
      this.animationPlayer.destroy();
      this.animationPlayer = null;
    }
  }

  private listAndViewReady(requireListSize: boolean): boolean {
    return this.bannersFeedContainer && this.bannersFeedContainer.nativeElement && this.bannersFeed
      && this.bannersFeed.nativeElement && this.bannerList && this.bannerList.length && (!requireListSize || this.bannerList.length > 1);
  }

  private stdBannerWidth(): number {
    return this.bannersFeedContainer.nativeElement.clientWidth;
  }

}
