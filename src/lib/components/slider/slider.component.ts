import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';

const BREAKPOINT_PAD = 768;
const BREAKPOINT_DESK = 1140;

@Component({
  selector: 'lib-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, AfterViewInit {

  @Input() public items: any[];
  @Input() public contentTemplate: TemplateRef<any>;
  @Input() public breakpointPad = BREAKPOINT_PAD;
  @Input() public breakpointDesk = BREAKPOINT_DESK;
  @Input() public betweenOffsets: number[] = [16, 16, 16]; // Массив значений для разных устройств [mob, pad, desk]
  // Поля перед первым и после последнего элемента
  @Input() public sidePaddings: number[] = [17, 0, 0]; // Массив значений для разных устройств [mob, pad, desk]
  // Количество элементов, которое нужно отобразить на устройстве
  @Input() public countLimits: number[] = [1, 2, 3]; // Массив значений для разных устройств [mob, pad, desk]
  // Фиксированная ширина элемента. Если задана, то countLimits учитываться не будет
  @Input() public fixedWidth: number;

  @Output() public selectItem = new EventEmitter();

  @ViewChild('sliderContainer', {static: true}) private sliderContainer: ElementRef;
  @ViewChild('sliderWrapper', {static: true}) private sliderWrapper: ElementRef;
  @ViewChild('sliderList', {static: true}) private sliderList: ElementRef;

  private device: 'mob' | 'pad' | 'desk' = 'desk';
  private slideWidth: number;
  private listWidth: number;
  private wrapperWidth: number;
  public betweenOffset = this.betweenOffsets[0];
  public containerTransform: string;
  public offset = 0;
  public sidePadding: number;

  public disableLeftArrow = true;
  public disableRightArrow: boolean;
  public hideArrows: boolean;

  constructor(
    private renderer: Renderer2,
  ) { }

  public ngOnInit(): void {
    this.detectDevice();
  }

  public ngAfterViewInit(): void {
    this.buildSlider();
  }

  @HostListener('window:resize')
  public onResize() {
    this.buildSlider();
  }

  private buildSlider() {
    const deviceIndex = this.device === 'desk' ? 2 : this.device === 'pad' ? 1 : 0;
    this.betweenOffset = this.betweenOffsets[deviceIndex];
    this.sidePadding = this.sidePaddings?.length ? this.sidePaddings[deviceIndex] : 0;
    this.wrapperWidth = this.sliderWrapper.nativeElement.clientWidth;

    if (this.fixedWidth) {
      this.slideWidth = this.fixedWidth;
    } else {
      const offsetsCount = this.countLimits[deviceIndex] - 1;
      this.slideWidth = (this.wrapperWidth - this.betweenOffset * offsetsCount - this.sidePadding * 2) / this.countLimits[deviceIndex];
      this.slideWidth = Math.floor(this.slideWidth);
    }

    const additionOffset = this.sidePadding * 2 - this.betweenOffset;
    this.listWidth = (this.slideWidth + this.betweenOffset) * this.items.length + additionOffset;
    this.hideArrows = this.listWidth <= this.wrapperWidth;
    this.setElementWidth(this.sliderList.nativeElement, this.listWidth);
  }

  private detectDevice(): void {
    this.device = window.innerWidth < this.breakpointPad ? 'mob' : window.innerWidth < this.breakpointDesk ? 'pad' : 'desk';
  }

  private setElementWidth(el, width: number) {
    if (el) {
      this.renderer.setStyle(el, 'width', `${width}px`);
    }
  }

  public changeOffset() {
    this.containerTransform = 'translateX(' + this.offset + 'px)';
  }

  public showNext(): void {
    if (this.disableRightArrow) {
      return;
    }
    this.offset -= this.slideWidth + this.betweenOffset;
    this.changeOffset();
    this.disableRightArrow = -this.offset + this.wrapperWidth >= this.listWidth;
    this.disableLeftArrow = false;
  }

  public showPrevious(): void {
    if (this.disableLeftArrow) {
      return;
    }
    this.offset += this.slideWidth + this.betweenOffset;
    this.changeOffset();
    this.disableLeftArrow = this.offset >= 0;
    this.disableRightArrow = false;
  }

  public onSelect(item: any): void {
    this.selectItem.emit(item);
  }
}

