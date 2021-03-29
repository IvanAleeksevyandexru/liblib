import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  NgModuleRef,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MenuService } from '../../services/menu/menu.service';
import { LoadService } from '../../services/load/load.service';
import { ModalService } from '../../services/modal/modal.service';
import { ModalSearchComponent } from '../modal-search/modal-search.component';
import { Category } from '../../models/category';
import { MenuLink } from '../../models/menu-link';
import { UserMenuState } from '../../models/user-menu';
import { CounterData } from '../../models/counter';
import { LangWarnModalComponent } from '../lang-warn-modal/lang-warn-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

const HIDE_TIMOUT = 300;

@Component({
  selector: 'lib-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, AfterViewInit {

  @Input() public userCounter: CounterData;
  @Input() public showLinks = true;
  @Input() public newView = false;
  @Input() public background: string;
  @Input() public showBorder = false;
  @Input() public rolesListEnabled = false;
  @Input() public searchSputnikEnabled = false;
  @Input() public links: MenuLink[] = [];

  @Output() public clickMenuItem = new EventEmitter<any>();

  public categories: Category[] = [];
  public showCategories = false;
  public emptyCategories = true;
  public userMenuState: UserMenuState;
  public hideTimout: any;
  public menuOffset: number;
  public user: any;
  public isFixed = false;
  public showMenuBtns = this.loadService.config.showMenuBtns;
  public isMainPage = this.checkMainPage();

  private staticUrls: object;

  @ViewChild('menu') public menu;

  @HostListener('document:scroll') public onScroll() {
    if (window.pageYOffset > this.menuOffset + this.menu.nativeElement.clientHeight && !this.userMenuState.isMobileView) {
      if (!this.menu.nativeElement.classList.contains('fixed') || !document.body.classList.contains('menu-fixed')) {
        this.menu.nativeElement.classList.add('fixed');
        this.menu.nativeElement.classList.remove('white-field');
        document.body.classList.add('menu-fixed');
      }
      this.isFixed = true;
    } else {
      this.menu.nativeElement.classList.remove('fixed');
      this.menu.nativeElement.classList.add('white-field');
      document.body.classList.remove('menu-fixed');
      this.isFixed = false;
    }
  }

  @HostListener('click', ['$event']) public onClick(event) {
    if (event.target.localName === 'a' &&
      !event.target.classList.contains('open-mobile-menu') &&
      !event.target.classList.contains('close-mobile-menu') ||
      event.target.classList.contains('content-overlay') &&
      event.target.classList.contains('show')) {
      this.initUserMenuState();
    }
  }

  constructor(
    public loadService: LoadService,
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
    private menuService: MenuService,
    public translate: TranslateService,
    private router: Router
  ) { }

  public ngOnInit() {
    if (!this.links.length) {
      this.links = this.menuService.getUserMenuDefaultLinks();
    }
    this.staticUrls = this.menuService.getStaticItemUrls();
    this.user = this.loadService.user;
    this.initUserMenuState();
  }

  public ngAfterViewInit() {
    this.menuOffset = this.menu.nativeElement.offsetTop;
    this.onScroll();
  }

  public openCategories() {
    this.showCategories = true;

    if (this.emptyCategories) {
      this.menuService.loadCategories().then((data: Category[]) => {
        this.emptyCategories = data.length === 0;
        this.categories = data;
      });
    }

    clearTimeout(this.hideTimout);
  }

  public closeCategories() {
    this.hideTimout = setTimeout(() => {
      this.showCategories = false;
    }, HIDE_TIMOUT);
  }

  public popupSearch() {
    this.modalService.popupInject(ModalSearchComponent, this.moduleRef);
  }

  public logout() {
    this.loadService.logout();
  }

  public showUserMenu(isMobileView: boolean) {
    this.userMenuState = {
      active: true,
      isMobileView
    } as UserMenuState;

    if (isMobileView) {
      const html = document.getElementsByTagName('html')[0];
      html.classList.add('disable-scroll');
    }
  }

  public initUserMenuState(): void {
    this.userMenuState = {
      active: false,
      isMobileView: false
    } as UserMenuState;
  }

  public redirect(event: Event, link: MenuLink): void {
    if (link.handler) {
      event.stopPropagation();
      event.preventDefault();
      link.handler(link);
      return;
    }

    const url = this.staticUrls[link.title];
    const isAbsUrl = /^(http|\/\/)/.test(url);

    if (url && this.translate.currentLang !== 'ru') {
      event.stopPropagation();
      event.preventDefault();
      this.showLangWarnModal(url, isAbsUrl);
    } else if (!isAbsUrl) {
      event.stopPropagation();
      event.preventDefault();
      this.router.navigate([url]);
    } else {
      event.stopPropagation();
      event.preventDefault();
      location.href = url;
    }
  }

  public showLangWarnModal(url: string, isAbs: boolean): void {
    this.modalService.popupInject(LangWarnModalComponent, this.moduleRef, {
      url, isAbs
    });
  }

  private checkMainPage() {
    if (this.loadService.attributes.appContext === 'PORTAL') {
      return location.pathname === '/';
    }
    return true;
  }

}
