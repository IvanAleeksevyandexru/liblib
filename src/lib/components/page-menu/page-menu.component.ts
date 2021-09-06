import {
  AfterViewInit, AfterViewChecked, Component,
  ElementRef, EventEmitter, HostListener,
  Input, Output, ViewChild, TemplateRef,
} from '@angular/core';
import { IMenuItems } from '../../models/page-menu.model';

@Component({
  selector: 'lib-page-menu',
  templateUrl: './page-menu.component.html',
  styleUrls: ['./page-menu.component.scss']
})
export class PageMenuComponent implements AfterViewInit, AfterViewChecked {

  // При загрузке страницы document.documentElement.scrollTop должен быть равен нулю.
  // Здесь не помогает возврат наверх. Необходиом делать там, где сама страница. То, что описано в app компоненте не подходит,
  // т.к. при внешнем редиректе не проходит условие.

  @Input() public items: IMenuItems[];
  @Input() public content: TemplateRef<any>; // если items не подходит
  @Input() public offsetFromHeader: string | number = 56;
  @Input() public offsetFromFooter: string | number = 56;
  @Input() public nameOfHeader = 'lib-header'; // хедеры могут быть любые
  @Input() public nameOfFooter = 'lib-footer'; // футеры могут быть любые
  @Input() public styleType: '' | 'padLikeMob' = ''; // различные стилевые виды:
  // '' - в мобиле статично в стопку, в паде статично в три колонки, в деске ездит по длине контента страницы; ссылки подчеркнуты
  // 'padLikeMob' - в мобиле статично в стопку, в паде статично в стопку, в деске ездит по длине контента страницы; ссылки не подчеркнуты
  @Input() public maxHeight: number | string = 384; // максимальная высота менюхи, далее начинается скролл

  @Output() public onclick = new EventEmitter<string>();

  @ViewChild('menu') private menuElement: ElementRef;

  private menu: HTMLDivElement;
  private availableFloat = false;
  private isFixedNow = false;

  private header: HTMLElement;
  private headerHeight = 0;

  private needStartFloat = 0; // с какого места начинать плавать
  private needOffsetTop = 0; // на сколько отступать сверху при плавании

  private footer: HTMLElement;
  private footerHeight = 0;

  private needStopFloat = 0; // на каком месте перестать плавать около футера
  private needOffsetBottom = 0; // на сколько отступать от футера

  private needOffsetRight = 0; // расстояния от правого края во время плавания

  @HostListener('document:scroll') public scroll() {
    if (this.availableFloat) {
      this.onScroll();
    }
  }

  @HostListener('window:resize') public resize() {
    if (this.availableFloat) {
      this.getSizes();
    }
  }

  constructor() { }

  public ngAfterViewInit(): void {
    this.availableFloat = (this.items?.length || this.content) && window.screen.width > 1140;
    if (this.availableFloat) {
      this.menu = this.menuElement.nativeElement as HTMLDivElement;
      this.header = document.getElementsByTagName(this.nameOfHeader)[0] as HTMLElement;
      this.footer = document.getElementsByTagName(this.nameOfFooter)[0] as HTMLElement;
      this.getSizes();
    }
  }

  public ngAfterViewChecked(): void {
    if (this.availableFloat) {
      if (this.header && this.headerHeight !== this.header.clientHeight) {
        this.getHeaderAndTopHeight();
      }

      if (this.footer && this.footerHeight !== this.footer.clientHeight) {
        this.getFooterAndBottomData();
      }

      if (this.needStopFloat !== document.documentElement.scrollHeight - this.needOffsetBottom) {
        this.needStopFloat = document.documentElement.scrollHeight - this.needOffsetBottom;
      }

      if (!this.isFixedNow && !document.documentElement.scrollTop) {
        const currentTopOffset = this.menu.getBoundingClientRect().top;

        if (currentTopOffset !== this.needStartFloat) {
          this.needStartFloat = currentTopOffset - this.needOffsetTop;
        }
      }
    }
  }

  public onClick(id): void {
    this.onclick.emit(id);
  }

  private getSizes() {
    this.getHeaderAndTopHeight();
    this.getFooterAndBottomData();
    this.getWidthWindow();

    this.needStartFloat = this.menu.getBoundingClientRect().top - this.needOffsetTop;

    this.needStopFloat = document.documentElement.scrollHeight - this.needOffsetBottom;
  }

  private getHeaderAndTopHeight(): void {
    this.headerHeight = this.header.clientHeight;
    this.needOffsetTop = this.headerHeight + +this.offsetFromHeader;
  }

  private getFooterAndBottomData(): void {
    this.footerHeight = this.footer.clientHeight;
    this.needOffsetBottom = this.footerHeight + +this.offsetFromFooter + this.menu.scrollHeight;
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
    const classList = this.menu.classList;

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
    if (type === 'delete') {
      this.menu.style[direction] = '';
      return;
    }

    if (this.menu.style[direction] !== `${offset}px`) {
      this.menu.style[direction] = `${offset}px`;
    }
  }

}
