import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  Renderer2,
  HostListener,
  SimpleChanges,
  OnChanges,
  OnDestroy, NgModuleRef, ChangeDetectorRef, ViewChildren, QueryList, ChangeDetectionStrategy
} from '@angular/core';
import { SliderImage } from '../../models/slider-image';
import { SliderImagesModalComponent } from './slider-images-modal/slider-images-modal.component';
import { ModalService } from '../../services/modal/modal.service';
import { LoadService } from '../../services/load/load.service';
import { DragDropManager } from '../../services/drag-drop/drag-drop.manager';
import { DragDropBinding, DragDropType, DragDropDirection, DragDropOffsetType, DragState } from '../../models/drag-drop.model';

export const SLIDES_OFFSET = 32;
export const SLIDES_WIDTH = 280;
export const SLIDES_HEIGHT = 280;
export const SLIDES_HEIGHT_CARD = 226;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
})
export class ImageSliderComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() public slidesOffset = SLIDES_OFFSET;
  @Input() public slidesWidth = SLIDES_WIDTH;
  @Input() public slidesHeight = SLIDES_HEIGHT;

  @Input() public images: SliderImage[] = [];
  @Input() public links: Array<string> = [];
  @Input() public limit = 3;
  @Input() public showByIndex: number;
  @Input() public showModal = false;
  @Input() public enterImages = false;
  @Input() public view: 'payment-fines-popup' | 'simple' | 'card' | 'logos' = 'simple';
  @Input() public showTitle = false;
  @Input() public showBullet = true;
  @Input() public target = false;

  private perPage = this.limit;
  public containerTransform: string;
  public currentIndex = 0;
  public offset: number;
  public slidesWidthToSet: number;
  public dragDropDescriptor: DragDropBinding = null;

  @ViewChild('sliderContainer', {static: true}) private sliderContainer: ElementRef;
  @ViewChild('sliderWrapper', {static: true}) private sliderWrapper: ElementRef;
  @ViewChild('sliderFeedContainer', {static: true}) private sliderFeedContainer: ElementRef;
  @ViewChild('sliderFeedWrapper', {static: true}) private sliderFeedWrapper: ElementRef;
  @ViewChildren('images') private imagesElements: QueryList<ElementRef>;

  public get imagesLength(): number {
    return !!this.images ? this.images.length : 0;
  }

  public get dots(): any[] {
    return new Array(this.imagesLength && this.imagesLength > this.perPage ? this.imagesLength - this.perPage + 1 : 1);
  }

  public get controlsVisible(): boolean {
    return this.dots.length > 1;
  }

  constructor(private renderer: Renderer2,
              private modalService: ModalService,
              private moduleRef: NgModuleRef<any>,
              private changeDetector: ChangeDetectorRef,
              private dragDropManager: DragDropManager,
              private loadService: LoadService) {
  }

  public ngAfterViewInit(): void {
    this.rebuildSlider();
    if (this.enterImages) {
      this.checkImagesSize();
    }
    this.dragDropDescriptor = {
      feedElement: this.sliderFeedContainer,
      type: DragDropType.TOUCH, direction: DragDropDirection.HORIZONTAL, offsetType: DragDropOffsetType.TRANSFORM,
      centeringNeeded: true, cleanUp: false, limit: true,
      containerDimension: this.slidesWidthToSet, itemsDistance: this.slidesOffset,
      dragStart: () => {
        this.renderer.addClass(this.sliderFeedContainer.nativeElement, 'no-transition');
      },
      dragProgress: (dragState: DragState) => {
        this.currentIndex = dragState.selected;
        this.offset = dragState.offset;
      },
      dragEnd: (dragState: DragState) => {
        this.renderer.removeClass(this.sliderFeedContainer.nativeElement, 'no-transition');
        this.currentIndex = dragState.selected;
        this.offset = dragState.offset;
        this.changeOffset();
      }
    } as DragDropBinding;
    this.dragDropManager.attach(this.dragDropDescriptor);
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'images':
        case 'limit': {
          if (!this.showByIndex) {
            this.rebuildSlider();
            break;
          }
        }
      }
    }
  }

  public ngOnDestroy() {
    if (this.dragDropDescriptor) {
      this.dragDropManager.detach(this.dragDropDescriptor);
    }
  }

  private rebuildSlider() {
    if (this.sliderContainer && this.sliderWrapper) {
      this.currentIndex = this.dots.length ? 0 : -1;
      if (this.showByIndex === undefined) {
        this.offset = -(this.slidesWidth + this.slidesOffset) * this.currentIndex;
        this.changeOffset();
      }
      // 30 - сумма padding, необходимых для отображения тени
      // 20 - отсупы для стрелок
      const paddings = this.view === 'card' ? 30 : (this.view === 'logos' ? 20 : 0);
      const containerWidth = this.sliderContainer.nativeElement.offsetWidth - paddings;
      if (containerWidth < SLIDES_WIDTH || this.limit === 1) {
        this.perPage = 1;
        this.slidesWidth = containerWidth;
        this.slidesOffset = 0;
      } else {
        let visibleSlidesCount = Math.floor(containerWidth / (this.slidesWidth + this.slidesOffset));
        const rest = containerWidth - (this.slidesWidth + this.slidesOffset) * visibleSlidesCount;
        if (rest >= this.slidesWidth) {
          visibleSlidesCount++;
        }
        this.perPage = visibleSlidesCount < this.limit ? visibleSlidesCount : this.limit;
      }
      if (this.perPage === 1) {
        this.setElementWidth(this.sliderWrapper.nativeElement, containerWidth + paddings);
        this.slidesWidthToSet = containerWidth;
      } else {
        const sliderWrapperWidth = this.perPage * this.slidesWidth + (this.perPage - 1) * this.slidesOffset + paddings;
        if (this.view === 'logos') {
          this.setElementWidth(this.sliderFeedWrapper.nativeElement, sliderWrapperWidth - paddings);
        } else {
          this.setElementWidth(this.sliderWrapper.nativeElement, sliderWrapperWidth);
        }
        this.slidesWidthToSet = this.slidesWidth;
      }

      this.setElementWidth(this.sliderFeedContainer.nativeElement, this.imagesLength * (this.slidesOffset + this.slidesWidth));
      if (['payment-fines-popup', 'simple'].includes(this.view)) {
        const increaseHeight = this.view === 'payment-fines-popup' ? 96 : 72;
        const wrapperHeight = this.showTitle ? this.slidesHeight + increaseHeight : this.slidesHeight;
        this.renderer.setStyle(this.sliderFeedWrapper.nativeElement, 'height', `${wrapperHeight}px`);
      }
      if (this.view === 'card') {
        this.slidesHeight = SLIDES_HEIGHT_CARD;
      }
      if (this.showByIndex) {
        this.slideTo(this.showByIndex);
      }
    }
  }

  private setElementWidth(el, width: number) {
    if (el) {
      this.renderer.setStyle(el, 'width', `${width}px`);
    }
  }

  public slidePrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.offset = -(this.slidesWidthToSet + this.slidesOffset) * this.currentIndex;
      this.changeOffset();
    }
  }

  public slideTo(index: number) {
    if (index >= 0 && index < this.dots.length) {
      this.currentIndex = index;
      this.offset = -(this.slidesWidthToSet + this.slidesOffset) * this.currentIndex;
      this.changeOffset();
    }
  }

  public slideNext() {
    if (this.currentIndex < this.dots.length - 1) {
      this.currentIndex++;
      this.offset = -(this.slidesWidthToSet + this.slidesOffset) * this.currentIndex;
      this.changeOffset();
    }
  }

  @HostListener('window:resize')
  public onResize() {
    this.rebuildSlider();
  }

  public onImageError(e) {
    e.target.src = `${this.loadService.config.staticDomain}/lib-assets/svg/photo-error.svg`;
  }

  public showImageSliderModal = (i?) => {
    if (this.showModal) {
      this.modalService.popupInject(SliderImagesModalComponent, this.moduleRef, {
        images: this.images,
        imageIndex: i
      });
    }
  }

  public changeOffset() {
    this.containerTransform = 'translateX(' + this.offset + 'px)';
    this.changeDetector.detectChanges();
  }

  private checkImagesSize() {
    this.imagesElements.forEach(item => {
      item.nativeElement.onload = () => {
        if (item.nativeElement.naturalWidth > this.slidesWidth || item.nativeElement.naturalWidth > SLIDES_HEIGHT_CARD) {
          this.renderer.addClass(item.nativeElement, 'entered-img');
        }
      };
    });
  }
}
