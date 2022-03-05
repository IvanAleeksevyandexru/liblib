import { Component, EventEmitter, HostListener, Input, NgModuleRef, OnInit, Output, ViewChild } from '@angular/core';
import { CountersService } from '@epgu/ui/services/counters';
import { LoadService } from '@epgu/ui/services/load';
import { MenuService } from '@epgu/ui/services/menu';
import { Catalog, Category, MenuLink, UserMenuState, UserRole } from '@epgu/ui/models';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from '@epgu/ui/services/modal';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HelperService } from '@epgu/ui/services/helper';
import { LangWarnModalComponent } from '@epgu/ui/components/lang-warn-modal';
import { CounterData, CounterTarget } from '@epgu/ui/models/counter';
import { Translation } from '@epgu/ui/models/common-enums';
import { FeedsComponent } from '@epgu/ui/components/feeds';
import { take } from 'rxjs/operators';
import { User } from '@epgu/ui/models/user';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { UserHelperService } from '@epgu/ui/services/user-helper';
import { HeaderService } from '@epgu/ui/services/header';

const HIDE_TIMOUT = 300;

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public user = this.loadService.user as User;
  public userRoles = this.menuService.getUserRoles(this.user) as UserRole[];
  public userMenuState: UserMenuState;
  public showNotifications: boolean;
  public isUnread: boolean;
  public showCategories: boolean;
  public emptyCategories = true;
  public hideTimout: any;
  public categories: Category[] = [];
  public showRolesList: boolean;
  public menuCatalogOpened: boolean;
  public burgerWithCatalog = true;
  public burgerDemoMode = this.loadService.config.burgerDemoMode;
  public Translation = Translation;
  public psoContainer = document.getElementById('pso-widget-container');

  private closeBurger = new BehaviorSubject(false);
  public closeBurger$ = this.closeBurger.asObservable();

  @ViewChild(FeedsComponent) public feedsComponent: FeedsComponent;

  @Input() public userCounter: CounterData;
  @Input() public comingSoon?: boolean;
  @Input() public isPortal = false;
  @Input() public links?: MenuLink[] = [];
  @Input() public mergeHeaderMenu?: boolean;
  @Input() public rolesListEnabled?: boolean;
  @Input() public searchSputnikEnabled?: boolean;
  @Input() public logoHref?: string;
  @Input() public showBurger = true;
  @Input() public catalog?: Catalog[];
  @Input() public languageChangeAvailable: boolean;
  @Input() public translation: Translation | string = Translation.APP;
  @Input() public closeStatisticPopup$: Observable<boolean>;
  @Input() public loginWithNode = true;

  @Input() public alwaysShowLocationSelect = false;
  @Input() public hideBurgerDesc = false;

  @Input() public reloadAbsoluteInternalLinks = false;

  @Output() public backClick = new EventEmitter<any>();

  @ViewChild('menu') private menu;

  @HostListener('document:keydown', ['$event'])
  public onKeydownComponent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showNotifications = false;
      this.showRolesList = false;
    }
  }

  @HostListener('document:click', ['$event'])
  public onClickOut(event) {
    if (!event.target.classList.contains('user-role')) {
      this.showRolesList = false;
    }
    if (!event.target.classList.contains('bell')) {
      this.showNotifications = false;
    }
  }


  constructor(
    public loadService: LoadService,
    private menuService: MenuService,
    private countersService: CountersService,
    public translate: TranslateService,
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
    private router: Router,
    private yaMetricService: YaMetricService,
    public userHelper: UserHelperService,
    public headerService: HeaderService
  ) {
    this.onRouteChange();
  }

  public ngOnInit(): void {
    this.initUserMenuState();
    if (this.burgerDemoMode) {
      this.burgerWithCatalogShow(location.pathname);
    }
    if (!this.links.length && this.user.authorized) {
      this.links = this.menuService.getUserMenuDefaultLinks();
    }
    this.countersService.counters$.subscribe(() => {
      const counter = this.countersService.getCounter(CounterTarget.USER);
      this.isUnread = !!(counter && counter.unread);
    });

    if (HelperService.isMpWebView()) {
      this.headerService.setVisible(false);
    }
  }

  public burgerWithCatalogShow(currentPath): void {
    const urls = ['/new', '/newsearch', '/departments', '/pay', '/help', '/life'];
    if (this.isPortal) {
      urls.push('/');
    }
    if (currentPath === '/pay' || currentPath.startsWith('/pay/')) {
      currentPath = '/pay';
    }
    if (currentPath === '/help' || currentPath.startsWith('/help/')) {
      currentPath = '/help';
    }
    if (currentPath === '/life' || currentPath.startsWith('/life/')) {
      currentPath = '/life';
    }
    this.burgerWithCatalog = urls.indexOf(currentPath) > -1;
  }

  private onRouteChange(): void {
    if (this.burgerDemoMode) {
      this.router.events.subscribe((evt) => {
        if (evt instanceof NavigationEnd) {
          this.burgerWithCatalogShow(evt.url);
        }
      });
    }
  }

  public showUserMenu(isMobileView: boolean) {
    this.menuService.closeBurgerOutside.next(true);

    this.userMenuState = {
      active: true,
      isMobileView
    } as UserMenuState;

    const html = document.getElementsByTagName('html')[0];
    html.classList.add('disable-scroll-sm');
    if (this.psoContainer && (window as any).screen.width < 812) {
      this.psoContainer.style.display = 'none';
    }

    this.yaMetricService.callReachGoal('header', { 'header': ['Правое меню'] });
  }

  public hideUserMenu() {
    if (this.menu) {
      this.menu.onClose();
      if (this.psoContainer && (window as any).screen.width < 812) {
        this.psoContainer.style.display = 'unset';
      }
    }
  }

  public initUserMenuState(): void {
    this.userMenuState = {
      active: false,
      isMobileView: false
    } as UserMenuState;
  }

  public backClickHandler(): void {
    this.backClick.emit();
  }

  public redirect(event: Event, link: MenuLink): void {
    if (link.handler) {
      event.stopPropagation();
      event.preventDefault();
      link.handler(link);
      return;
    }

    const url = link.url;
    const isAbsUrl = /^(http|\/\/)/.test(url);

    event.stopPropagation();
    event.preventDefault();
    if (url && !HelperService.langIsRus(this.translate.currentLang)) {
      this.showLangWarnModal(url, isAbsUrl);
    } else {
      if (this.closeStatisticPopup$) {
        this.closeStatisticPopup$.pipe(take(1)).subscribe(condition => {
          if (condition) { this.menuService.menuStaticItemClick(link.title, link.mnemonic); }
        });
      } else {
        this.menuService.menuStaticItemClick(link.title, link.mnemonic);
      }
    }
  }

  public showLangWarnModal(url: string, isAbs: boolean): void {
    this.modalService.popupInject(LangWarnModalComponent, this.moduleRef, {
      url, isAbs
    });
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

  public onMenuCatalogClick(menuCatalogOpened: boolean, isCatalogSimple = false) {
    this.menuCatalogOpened = menuCatalogOpened;
    const htmlEl = (document.getElementsByTagName('html')[0] as HTMLElement);
    if (isCatalogSimple) {
      htmlEl.classList.toggle('hide-scroll', menuCatalogOpened);
    } else {
      htmlEl.style.overflowY = menuCatalogOpened ? 'hidden' : 'auto';
    }
    if (menuCatalogOpened) {
      this.hideUserMenu();
    }
  }

  public closeCategories() {
    this.hideTimout = setTimeout(() => {
      this.showCategories = false;
    }, HIDE_TIMOUT);
  }

  public sendMetric(evt, url: string, name: string) {
    evt.stopPropagation();
    evt.preventDefault();
    this.yaMetricService.callReachGoal('header', { 'header': [name] }, () => {
      window.location.href = url;
    });
  }
}

