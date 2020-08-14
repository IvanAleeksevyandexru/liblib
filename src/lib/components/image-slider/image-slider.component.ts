import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  Renderer2,
  HostListener,
  SimpleChanges,
  OnChanges, NgModuleRef, ChangeDetectorRef, ViewChildren, QueryList
} from '@angular/core';
import { SliderImage } from '../../models/slider-image';
import { SliderImagesModalComponent } from '../slider-images-modal/slider-images-modal.component';
import { ModalService } from '../../services/modal/modal.service';
import { LoadService } from '../../services/load/load.service';

export const SLIDES_OFFSET = 32;
export const SLIDES_WIDTH = 280;
export const SLIDES_HEIGHT = 280;
export const SLIDES_HEIGHT_CARD = 226;

@Component({
  selector: 'lib-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
})
export class ImageSliderComponent implements AfterViewInit, OnChanges {
  @Input() public slidesOffset = SLIDES_OFFSET;
  @Input() public slidesWidth = SLIDES_WIDTH;
  @Input() public slidesHeight = SLIDES_HEIGHT;

  @Input() public images: SliderImage[] = [];
  @Input() public limit = 3;
  @Input() public showByIndex: number;
  @Input() public showModal = false;
  @Input() public enterImages = false;
  @Input() public view: 'simple' | 'card' | 'logos' = 'simple';
  @Input() public showTitle = false;
  @Input() public showBullet = true;

  private perPage = this.limit;
  public containerTransform: any;
  public currentIndex = 0;
  public offset: number;
  public slidesWidthToSet: number;

  private initialOffset: number = undefined;
  private startDragPosition: number = undefined;

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
              private loadService: LoadService) {
  }

  public ngAfterViewInit(): void {
    this.rebuildSlider();
    if (this.enterImages) {
      this.checkImagesSize();
    }
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

  private rebuildSlider() {
    if (this.sliderContainer && this.sliderWrapper) {
      this.currentIndex = this.dots.length ? 0 : -1;
      if (this.showByIndex === undefined) {
        this.offset = -(this.slidesWidth + this.slidesOffset) * this.currentIndex;
        this.changeOffset();
      }
      // 30 - сумма padding, необходимых для отображения тени
      const paddings = this.view === 'card' ? 30 : 0;
      const containerWidth = this.sliderContainer.nativeElement.offsetWidth - paddings;
      if (containerWidth < SLIDES_WIDTH) {
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
          this.setElementWidth(this.sliderFeedWrapper.nativeElement, sliderWrapperWidth);
        } else {
          this.setElementWidth(this.sliderWrapper.nativeElement, sliderWrapperWidth);
        }
        this.slidesWidthToSet = this.slidesWidth;
      }

      this.setElementWidth(this.sliderFeedContainer.nativeElement, this.imagesLength * (this.slidesOffset + this.slidesWidth));
      if (this.view === 'simple') {
        const wrapperHeight = this.showTitle ? this.slidesHeight + 72 : this.slidesHeight;
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

  public beginFeedDragging(e: TouchEvent | any) {
    this.initialOffset = -this.currentIndex * (this.slidesWidthToSet + this.slidesOffset);
    this.startDragPosition = e.touches[0].clientX;
    this.renderer.addClass(this.sliderFeedContainer.nativeElement, 'no-transition');
  }

  @HostListener('document:touchmove', ['$event'])
  public dragFeed(e: TouchEvent | any) {
    if (!this.sliderFeedContainer.nativeElement) {
      return;
    }
    if (this.initialOffset === undefined || this.startDragPosition === undefined) {
      return;
    }

    const delta = e.touches[0].clientX - this.startDragPosition;
    this.offset = this.initialOffset + delta;
    this.changeOffset();
    const index = -Math.round(this.offset / (this.slidesWidth + this.slidesOffset));
    this.currentIndex = Math.max(Math.min(index, this.dots.length - 1), 0);
  }

  @HostListener('document:touchend')
  public endFeedDragging() {
    if (this.initialOffset === undefined || this.startDragPosition === undefined) {
      return;
    }
    this.renderer.removeClass(this.sliderFeedContainer.nativeElement, 'no-transition');
    const offset = this.initialOffset;
    this.startDragPosition = this.initialOffset = undefined;
    if (this.offset === offset) {
      return;
    }
    const index = -Math.round(this.offset / (this.slidesWidthToSet + this.slidesOffset));
    this.currentIndex = Math.max(Math.min(index, this.dots.length - 1), 0);
    this.offset = -(this.currentIndex) * (this.slidesWidthToSet + this.slidesOffset);
    this.changeOffset();
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
        if (item.nativeElement.naturalWidth > this.slidesWidth || item.nativeElement.naturalWidth > 226) {
          this.renderer.addClass(item.nativeElement, 'entered-img');
        }
      };
    });
  }
}
