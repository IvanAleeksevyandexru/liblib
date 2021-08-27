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
import { DragDropManager } from '../../services/drag-drop/drag-drop.manager';
import {
  DragDropBinding,
  DragDropDirection,
  DragDropOffsetType,
  DragDropType,
  DragState
} from '../../models/drag-drop.model';
import { interval, Subscription } from 'rxjs';
import { HelperService } from '../../services/helper/helper.service';

const DEFAULT_SLIDE_SHOW_INTERVAL = 6000;
const DEFAULT_SLIDE_TIME = 300;

@Component({
  selector: 'lib-drag-slider',
  templateUrl: './drag-slider.component.html',
  styleUrls: ['./drag-slider.component.scss']
})
export class DragSliderComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  constructor(
    private animationBuilder: AnimationBuilder,
    private dragDropManager: DragDropManager,
    private changeDetection: ChangeDetectorRef,
  ) { }

  @Input() public items: Array<any> = [];
  @Input() public contentTemplate: TemplateRef<any>;

  @Input() public slideShow = true;
  @Input() public slideShowInterval = DEFAULT_SLIDE_SHOW_INTERVAL;
  @Input() public slideShowReverse = false;

  @Input() public showBullets = true;
  @Input() public bulletSettings: string; // классы для настройки отображения

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

  public offset = 0;

  @ViewChild('slidesContainer') private slidesContainer: ElementRef;
  @ViewChild('slideBlock') private slideBlock: ElementRef;

  private animationPlayer: AnimationPlayer = null;

  @HostListener('window:resize')
  public onResize() {
    this.rebuildListAccordingToActiveSlide();
  }

  public ngOnInit(): void {
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
    this.rebuildListAccordingToActiveSlide();
    this.dragDropBinding = {
      feedElement: this.slideBlock,
      type: DragDropType.TOUCH, direction: DragDropDirection.HORIZONTAL, offsetType: DragDropOffsetType.POSITION,
      centeringNeeded: true, cleanUp: false, limit: false, centeringDuration: DEFAULT_SLIDE_TIME,
      dragStart: () => {
        this.stopAndFreezeOffsetAnimation();
        this.cancelSlideShow();
      }, dragRelease: (dragState: DragState) => {
        this.offset = dragState.offset;
        this.activeSlideTraceable = this.cycleList[dragState.selected];
      }, dragEnd: (dragState: DragState) => {
        this.offset = dragState.offset;
        this.rebuildListAccordingToActiveSlide();
      }
    } as DragDropBinding;
    this.dragDropManager.attach(this.dragDropBinding);
  }

  public ngOnChanges(changes: SimpleChanges) {
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

  public update() {
    this.rebuildList();
    this.rerunSlideShow();
  }

  public rebuildList() {
    this.list = HelperService.deepCopy(this.items);
    this.activeSlideTraceable = this.list?.length ? this.list[0] : null;
    this.rebuildListAccordingToActiveSlide();
  }

  public rebuildListAccordingToActiveSlide() {
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
    this.offset = -SLIDES_OUT_THE_AREA * this.stdSlideWidth();
    this.activeSlideIndex = SLIDES_OUT_THE_AREA;
    this.changeDetection.detectChanges();
    this.changeActiveSlide.emit(this.originActiveSlide);
  }

  public rerunSlideShow() {
    this.cancelSlideShow();
    if (this.slideShow) {
      this.animationSubscription = interval(this.slideShowInterval).subscribe(() => {
        if (this.list && this.list.length > 1) {
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
    const offsetDiff = (newSlideIndex - this.activeSlideIndex) * this.stdSlideWidth();
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
    this.animateOffset(this.offset + this.stdSlideWidth()).then(() => {
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
    this.animateOffset(this.offset - this.stdSlideWidth()).then(() => {
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
    return this.slidesContainer && this.slidesContainer.nativeElement && this.slideBlock
      && this.slideBlock.nativeElement && this.list && this.list.length && (!requireListSize || this.list.length > 1);
  }

  private stdSlideWidth(): number {
    return this.slidesContainer.nativeElement.clientWidth;
  }
}
