import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input, OnChanges, OnDestroy,
  OnInit,
  Output, SimpleChanges, TemplateRef,
  ViewChild
} from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { DragDropManager } from '@epgu/ui/services/drag-drop';
import { fromEvent, interval, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HelperService } from '@epgu/ui/services/helper';
import {
  DragDropBinding,
  DragDropDirection,
  DragDropOffsetType,
  DragDropType,
  DragState
} from '@epgu/ui/models/drag-drop';

const DEFAULT_SLIDE_SHOW_INTERVAL = 6000;
const DEFAULT_SLIDE_TIME = 300;
const BREAKPOINT_PAD = 768;
const BREAKPOINT_DESK = 1140;

@Component({
  selector: 'lib-drag-slider',
  templateUrl: './drag-slider.component.html',
  styleUrls: ['./drag-slider.component.scss']
})
export class DragSliderComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  constructor(
    private animationBuilder: AnimationBuilder,
    private dragDropManager: DragDropManager,
    private cd: ChangeDetectorRef,
  ) { }

  @Input() public items: Array<any> = [];
  @Input() public contentTemplate: TemplateRef<any>;

  @Input() public slideShow = true;
  @Input() public slideShowInterval = DEFAULT_SLIDE_SHOW_INTERVAL;
  @Input() public slideShowReverse = false;

  @Input() public breakpointPad = BREAKPOINT_PAD;
  @Input() public breakpointDesk = BREAKPOINT_DESK;
  // Фиксированная ширина слайда. Если задана, то countLimits учитываться не будет
  @Input() public fixedWidth: number;
  // Количество элементов, которое нужно отобразить на устройстве
  @Input() public countLimits: number[] = [1, 1, 1]; // Массив значений для разных устройств [mob, pad, desk]
  // Отступы между слайдами
  @Input() public betweenOffsets: number[] = [0, 0, 0]; // Массив значений для разных устройств [mob, pad, desk]

  @Input() public showBullets = true;
  @Input() public bulletSettings: string; // классы для настройки отображения

  @Input() public showArrows: boolean[] = [false, false, false];
  @Input() public arrowsSetting: string; // классы для настройки отображения

  public get arrowsEnabled(): boolean {
    return this.showArrows[this.deviceIndex];
  }
  // Флаг скрытия стрелок, если все слайды помещаются на экран
  public hideArrows: boolean;

  public activeSlide: any = null; // центральный баннер
  public get activeSlideTraceable() {
    return this.activeSlide;
  }
  public set activeSlideTraceable(value: any) {
    this.activeSlide = value;
  }
  public activeSlideIndex = 0;

  public get originActiveSlide() {
    const index = this.list.indexOf(this.activeSlideTraceable);
    return this.items[index];
  }

  @Output() private arrowClick = new EventEmitter();
  @Output() private changeActiveSlide = new EventEmitter();

  public list: Array<any> = [];
  // лента имеет циклическую структуру, необходимо чтобы можно было "бесконечно" и гладко прокручивать ленту в любую сторону
  public cycleList: Array<any> = [];
  public dragDropBinding: DragDropBinding = null;
  private animationSubscription: Subscription = undefined;

  private device: 'mob' | 'pad' | 'desk' = 'desk';
  private deviceIndex = 2;

  // Ширина слайда. Определяется по значениям fixedWidth или countLimits
  public slideWidth: number;
  // Ширина вьюпорта
  // если показываем один слайд, то равна ширине слайда
  // если несколько, то сумме их ширин + отступы между
  public wrapperWidth: number;
  // Размер отступа между слайдами для текущего девайса
  public betweenOffset: number;
  // Сколько слайдов можем показать на экране
  // Если есть fixedWidth, будет вычисляться по ширине контейнера деленного на fixedWidth
  // Если есть countLimits, возьмется значение для текущего девайса
  public visibleSlidesCount: number;
  public offset = 0;

  @ViewChild('slidesContainer') private slidesContainer: ElementRef;
  @ViewChild('slideBlock') private slideBlock: ElementRef;

  private animationPlayer: AnimationPlayer = null;
  private resizeSubscription: Subscription;

  public ngOnInit(): void {
    this.detectDevice();
    this.init();

    this.resizeSubscription = fromEvent(window, 'resize').pipe(
      debounceTime(1000)
    ).subscribe((event) => {
      this.wrapperWidth = null;
      this.dragDropManager.detach(this.dragDropBinding);
      this.dragDropBinding = null;
      this.cd.detectChanges();
      this.initView();
    });
  }

  public ngOnDestroy(): void {
    this.cancelSlideShow();
    if (this.animationPlayer) {
      this.animationPlayer.destroy();
      this.animationPlayer = null;
    }
    if (this.dragDropBinding) {
      this.dragDropManager.detach(this.dragDropBinding);
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  public ngAfterViewInit(): void {
    this.initView();
  }

  private setDragAndDrop(): void {
    this.dragDropBinding = {
      feedElement: this.slideBlock,
      type: DragDropType.TOUCH, direction: DragDropDirection.HORIZONTAL, offsetType: DragDropOffsetType.POSITION,
      centeringNeeded: true, cleanUp: false, limit: false, centeringDuration: DEFAULT_SLIDE_TIME,
      containerDimension: this.slideWidth, itemsDistance: this.betweenOffset,
      dragStart: () => {
        this.stopAndFreezeOffsetAnimation();
        this.cancelSlideShow();
      }, dragRelease: (dragState: DragState) => {
        this.offset = dragState.offset;
        this.activeSlideTraceable = this.cycleList[dragState.selected];
        this.cd.detectChanges();
      }, dragEnd: (dragState: DragState) => {
        this.offset = dragState.offset;
        this.rebuildListAccordingToActiveSlide();
      }
    } as DragDropBinding;
    this.dragDropManager.attach(this.dragDropBinding);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'items': {
          this.rebuildList();
          this.rerunSlideShow();
          break;
        }
        case 'slideShow':
        case 'slideShowInterval':
        case 'slideShowReverse': {
          this.rerunSlideShow();
          break;
        }
      }
    }
  }

  private init(): void {
    this.rebuildList();
    this.rerunSlideShow();
  }

  private initView(): void {
    this.betweenOffset = this.betweenOffsets[this.deviceIndex];
    this.setSlideWidth();
    this.setWrapperWidth();
    this.hideArrows = !(this.arrowsEnabled && this.visibleSlidesCount < this.list.length);

    if (this.visibleSlidesCount < this.list.length) {
      this.rebuildListAccordingToActiveSlide();
      if (!this.dragDropBinding) {
        this.setDragAndDrop();
      }
    } else {
      this.cycleList = this.list;
      if (this.dragDropBinding) {
        this.offset = 0;
        this.dragDropManager.detach(this.dragDropBinding);
        this.dragDropBinding = null;
      }
      this.cd.detectChanges();
    }
  }

  public rebuildList(): void {
    this.list = HelperService.deepCopy(this.items);
    this.activeSlideTraceable = this.list?.length ? this.list[0] : null;
  }

  public rebuildListAccordingToActiveSlide(): void {
    if (!this.listAndViewReady(false)) {
      return;
    }
    const SLIDES_OUT_THE_AREA = this.list.length === 1 ? 0 : Math.round(this.list.length / 2);
    let slideIndex = this.list.findIndex((item: any) => item === this.activeSlide);
    if (slideIndex === -1) {
      slideIndex = 0;
    }
    const getCyclicSlide = (base: number, index: number) => {
      if (base + index < 0) {
        return getCyclicSlide(this.list.length - 1, base + index + 1); // перепрыгиваем в конец когда смещение отрицательно
      } else if (base + index >= this.list.length) {
        return getCyclicSlide(0, index - (this.list.length - base)); // в начало если смещение больше размера массива
      } else {
        return this.list[base + index];
      }
    };
    const newCycleList = [];
    for (let i = -SLIDES_OUT_THE_AREA; i <= SLIDES_OUT_THE_AREA; i++) {
      newCycleList.push(getCyclicSlide(slideIndex, i));
    }
    this.cycleList = newCycleList;
    this.offset = -SLIDES_OUT_THE_AREA * (this.slideWidth + this.betweenOffset);
    this.activeSlideIndex = SLIDES_OUT_THE_AREA;
    this.cd.detectChanges();
    this.changeActiveSlide.emit(this.originActiveSlide);
  }

  public rerunSlideShow() {
    this.cancelSlideShow();
    if (this.slideShow) {
      this.animationSubscription = interval(this.slideShowInterval).subscribe(() => {
        if (this.list?.length > 1 && this.visibleSlidesCount < this.list.length) {
          this.slideShowReverse ? this.prevSlide(false) : this.nextSlide(false);
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

  public scrollToSlide(slide: any, index: number) {
    if (!this.listAndViewReady(true)) {
      return;
    }
    this.cancelSlideShow();
    const activeSlideIndex: number = this.list.indexOf(this.activeSlide);
    let newSlideIndex: number;
    if (index < activeSlideIndex) {
      newSlideIndex = this.cycleList.indexOf(slide);
    } else {
      newSlideIndex = this.cycleList.lastIndexOf(slide);  // любой итем гарантированно присутствует в ленте
    }
    const offsetDiff = (newSlideIndex - this.activeSlideIndex) * this.slideWidth;
    this.activeSlideTraceable = slide;
    const animationTime = Math.max(DEFAULT_SLIDE_TIME, Math.abs(newSlideIndex - this.activeSlideIndex) * 100);
    this.animateOffset(this.offset - offsetDiff, animationTime).then(() => {
      this.rebuildListAccordingToActiveSlide();
    });
  }

  // stopAnimation flag is used from template
  public prevSlide(stopAnimation: boolean) {
    if (!this.listAndViewReady(true)) {
      return;
    }
    if (stopAnimation) {
      this.arrowClick.emit();
      this.cancelSlideShow();
    }
    this.activeSlideTraceable = this.cycleList[--this.activeSlideIndex];
    this.animateOffset(this.offset + this.slideWidth).then(() => {
      this.rebuildListAccordingToActiveSlide();
    });
  }

  public nextSlide(stopAnimation: boolean) {
    if (!this.listAndViewReady(true)) {
      return;
    }
    if (stopAnimation) {
      this.arrowClick.emit();
      this.cancelSlideShow();
    }
    this.activeSlideTraceable = this.cycleList[++this.activeSlideIndex];
    this.animateOffset(this.offset - this.slideWidth).then(() => {
      this.rebuildListAccordingToActiveSlide();
    });
  }

  private animateOffset(newOffset: number, duration?: number) {
    this.animationPlayer = this.animationBuilder.build([
      style({left: this.offset}), animate(duration || DEFAULT_SLIDE_TIME, style({left: newOffset}))
    ]).create(this.slideBlock.nativeElement);
    this.animationPlayer.play();
    return new Promise((resolve, reject) => {
      this.animationPlayer.onDone(() => {
        resolve(true);
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
    return this.slidesContainer?.nativeElement && this.slideBlock?.nativeElement &&
      this.list?.length && (!requireListSize || this.list.length > 1);
  }

  private setSlideWidth(): void {
    if (this.fixedWidth) {
      this.slideWidth = this.fixedWidth;
    } else if (this.countLimits) {
      const wrapperWidth = this.slidesContainer.nativeElement.clientWidth;
      const count = this.countLimits[this.deviceIndex];
      this.slideWidth = Math.floor((wrapperWidth - this.betweenOffset * (count - 1)) / count) || null;
    } else {
      this.slideWidth = this.slidesContainer.nativeElement.clientWidth || null;
    }
  }

  private setWrapperWidth(): void {
    if (this.fixedWidth) {
      const curWrapperWidth = this.slidesContainer.nativeElement.clientWidth;
      const visibleSlideCount = Math.floor(curWrapperWidth / (this.slideWidth + this.betweenOffset));
      this.wrapperWidth = visibleSlideCount * this.slideWidth + (visibleSlideCount - 1) * this.betweenOffset || null;
      this.visibleSlidesCount = visibleSlideCount;
    } else if (this.countLimits) {
      this.visibleSlidesCount = this.countLimits[this.deviceIndex];
    }
  }

  private detectDevice(): void {
    this.device = window.innerWidth < this.breakpointPad ? 'mob' : window.innerWidth < this.breakpointDesk ? 'pad' : 'desk';
    this.deviceIndex = this.device === 'desk' ? 2 : this.device === 'pad' ? 1 : 0;
  }
}
