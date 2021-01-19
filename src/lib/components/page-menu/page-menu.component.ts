import {
  AfterViewInit, AfterViewChecked, Component,
  ElementRef, EventEmitter, HostListener,
  Input, Output, ViewChild
} from '@angular/core';
import { IMenuItems } from '../../models/page-menu.model';

@Component({
  selector: 'lib-page-menu',
  templateUrl: './page-menu.component.html',
  styleUrls: ['./page-menu.component.scss']
})
export class PageMenuComponent implements AfterViewInit, AfterViewChecked {

  @Input() public items: IMenuItems[];
  @Input() public offsetFromHeader = 56;
  @Input() public offsetFromFooter = 56;

  @Output() public onclick = new EventEmitter<string>();

  @ViewChild('menu') private menu: ElementRef;

  private header;
  private headerHeight = 0;

  private needStartFloat = 0;
  private needOffsetTop = 0;

  private needStopFloat = 0;
  private needOffsetBottom = 0;

  private needOffsetRight = 0;

  private isFixedNow = false;

  private content;
  private contentHeight = 0;

  @HostListener('document:scroll') public scroll() {
    if (this.items.length) {
      this.onScroll();
    }
  }

  @HostListener('window:resize') public resize() {
    if (this.items.length) {
      this.getSizes();
    }
  }

  constructor() {
    if (document.documentElement.scrollTop !== 0) {
      window.scrollTo(0, 0);
    }
  }

  public ngAfterViewInit(): void {
    if (this.items.length) {
      this.getSizes();
    }
  }

  public ngAfterViewChecked(): void {
    if (this.items.length) {
      if (this.header && this.headerHeight !== this.header.clientHeight) {
        this.getOffsetsTop();
      }

      if (!this.isFixedNow && !document.documentElement.scrollTop) {
        const menu = this.menu.nativeElement as HTMLDivElement;



        const topOffset = menu.getBoundingClientRect().top;
        if (topOffset !== this.needStartFloat + this.offsetFromHeader + this.headerHeight) {
          this.needStartFloat = topOffset - this.offsetFromHeader - this.headerHeight;
        }
        const h = this.content.getBoundingClientRect().top + this.contentHeight - this.offsetFromFooter - menu.offsetHeight;
        if (h !== this.needStopFloat) {
          this.needStopFloat = this.content.getBoundingClientRect().top + this.contentHeight - this.offsetFromFooter - menu.offsetHeight;
        }
      }
    }
  }

  public onClick(id): void {
    this.onclick.emit(id);
  }

  private getSizes() {
    this.getHeader();
    this.getWidthWindow();

    this.needStartFloat = (this.menu.nativeElement as HTMLDivElement).getBoundingClientRect().top - this.offsetFromHeader - this.headerHeight;

    this.content = (document.getElementsByTagName('main')[0] as HTMLElement);
    this.contentHeight = this.content.offsetHeight;
    this.needStopFloat = this.content.getBoundingClientRect().top + this.contentHeight - this.offsetFromFooter - this.menu.nativeElement.offsetHeight;
  }

  private getHeader(): void {
    if (document.getElementsByTagName('lib-header')[0]) {
      this.header = document.getElementsByTagName('lib-header')[0] as HTMLElement;
    } else if (document.getElementsByTagName('lib-light-header')[0]) {
      this.header = document.getElementsByTagName('lib-light-header')[0] as HTMLElement;
    }
    this.getOffsetsTop();
  }

  private getOffsetsTop(): void {
    this.headerHeight = this.header.clientHeight;
    this.needOffsetTop = this.headerHeight + this.offsetFromHeader;
  }

  private getWidthWindow(): void {
    const width = window.screen.width;
    this.needOffsetRight = width / 2 + 75 - 9; // - 9 - ну нада. правда) width и availWidth одинаковы, а скролл то мешает.

    if (width > 1216) {
      this.needOffsetRight -= 683;
    }
  }

  private onScroll() {
    const scrollTop = document.documentElement.scrollTop;
    const classList = this.menu.nativeElement.classList;

    if (scrollTop < this.needStartFloat) {
      this.isFixedNow = false;
      this.toggleClass(classList, 'fixed', 'remove');
      this.toggleClass(classList, 'fixed-bottom', 'remove');
      this.setTopOffset(this.needOffsetTop, 'top', 'delete');
      this.setTopOffset(this.needOffsetRight, 'right', 'delete');
    } else if (scrollTop >= this.needStartFloat && scrollTop + this.needOffsetTop <= this.needStopFloat) {
      this.isFixedNow = true;
      this.toggleClass(classList, 'fixed', 'add');
      this.toggleClass(classList, 'fixed-bottom', 'remove');
      this.setTopOffset(this.needOffsetTop, 'top');
      this.setTopOffset(this.needOffsetRight, 'right');
    } else {
      this.isFixedNow = true;
      this.toggleClass(classList, 'fixed-bottom', 'add');
      this.toggleClass(classList, 'fixed', 'remove');
      this.setTopOffset(this.needStopFloat, 'top');
      this.setTopOffset(this.needOffsetRight, 'right');
    }
  }

  private toggleClass(classList: DOMTokenList, name: string, type: 'add' | 'remove'): void {
    if (type === 'add') {
      if (!classList.contains(name)) {
        classList.add(name);
      }
    } else {
      if (classList.contains(name)) {
        classList.remove(name);
      }
    }
  }

  private setTopOffset(offset: number, direction: 'top' | 'right', type?: 'delete'): void {
    const menu = this.menu.nativeElement as HTMLDivElement;

    if (type === 'delete') {
      menu.style[direction] = '';
      return;
    }

    if (menu.style[direction] !== `${offset}px`) {
      menu.style[direction] = `${offset}px`;
    }
  }

}
