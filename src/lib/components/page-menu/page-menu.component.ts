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

  private needOffsetFromHeader = 0;
  private needOffsetFromFooter = 0;
  private enabled = false;
  private header;
  private headerHeight = 0;
  private content;
  private contentHeight = 0;
  private contentInitialTop = 0;

  @HostListener('document:scroll') public onScroll() {
    if (this.items.length && this.enabled) {
      this.onScrollf();
    }
  }

  @HostListener('window:resize') public resize() {
    if (this.enabled) {
      this.getSizes();
    }
  }

  constructor() { }

  public ngAfterViewInit(): void {
    if (this.items.length) {
      this.enabled = !(/hide/.test(this.menu.nativeElement.parentElement.parentElement.className));
      if (this.enabled) {
        this.getSizes();
      }
    }
  }

  public ngAfterViewChecked(): void {
    if (this.enabled) {
      if (this.header && this.headerHeight !== this.header.clientHeight) {
        this.headerHeight = this.header.clientHeight;
      }
      if (!(/fixed/.test(this.menu.nativeElement.className))) {
        if (!document.documentElement.scrollTop) {
          const topOffset = (this.menu.nativeElement as HTMLDivElement).getBoundingClientRect().top;
          if (topOffset !== this.needOffsetFromHeader + this.offsetFromHeader + this.headerHeight) {
            this.needOffsetFromHeader = topOffset - this.offsetFromHeader - this.headerHeight;
          }
          const h = this.content.getBoundingClientRect().top + this.contentHeight - this.offsetFromFooter - this.menu.nativeElement.offsetHeight;
          if (h !== this.needOffsetFromFooter) {
            this.needOffsetFromFooter = this.content.getBoundingClientRect().top + this.contentHeight - this.offsetFromFooter - this.menu.nativeElement.offsetHeight;
          }
        }
      }
    }
  }

  public onClick(id): void {
    this.onclick.emit(id);
  }

  private getSizes() {
    if (document.getElementsByTagName('lib-header')[0]) {
      this.header = document.getElementsByTagName('lib-header')[0] as HTMLElement;
    } else if (document.getElementsByTagName('lib-light-header')[0]) {
      this.header = document.getElementsByTagName('lib-light-header')[0] as HTMLElement;
    }
    this.headerHeight = this.header.clientHeight;

    this.needOffsetFromHeader = (this.menu.nativeElement as HTMLDivElement).getBoundingClientRect().top - this.offsetFromHeader - this.headerHeight;

    this.content = (document.getElementsByTagName('main')[0] as HTMLElement);
    this.contentHeight = this.content.offsetHeight;
    this.needOffsetFromFooter = this.content.getBoundingClientRect().top + this.contentHeight - this.offsetFromFooter - this.menu.nativeElement.offsetHeight;
  }

  private onScrollf() {
    const scrollTop = document.documentElement.scrollTop;
    const classList = this.menu.nativeElement.classList;
    if (scrollTop < this.needOffsetFromHeader) {
      this.toggleClass(classList, 'fixed', 'remove');
      this.toggleClass(classList, 'fixed-bottom', 'remove');
    } else if (scrollTop >= this.needOffsetFromHeader && scrollTop + 112 <= this.needOffsetFromFooter) { // 112 изза стиля fixed.
      this.toggleClass(classList, 'fixed', 'add');
      this.toggleClass(classList, 'fixed-bottom', 'remove');
      if (this.menu.nativeElement.style.top) {
        this.menu.nativeElement.style.top = '';
      }
    } else {
      this.toggleClass(classList, 'fixed-bottom', 'add');
      this.toggleClass(classList, 'fixed', 'remove');
      if (this.menu.nativeElement.style.top !== `${this.needOffsetFromFooter}px`) {
        this.menu.nativeElement.style.top = `${this.needOffsetFromFooter}px`;
      }
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

}
