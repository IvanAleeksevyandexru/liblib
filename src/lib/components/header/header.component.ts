import { Component, EventEmitter, HostListener, Input, NgModuleRef, OnInit, Output, ViewChild } from '@angular/core';
import { CountersService} from '../../services/counters/counters.service';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from '../../services/menu/menu.service';
import { FeedsComponent } from '../feeds/feeds.component';
import { UserMenuState, CounterTarget, MenuLink, Category, CounterData, Catalog } from '../../models';
import { TranslateService } from '@ngx-translate/core';
import { LangWarnModalComponent } from '../lang-warn-modal/lang-warn-modal.component';
import { ModalService } from '../../services/modal/modal.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const HIDE_TIMOUT = 300;

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public user = this.loadService.user;
  public userRoles = this.menuService.getUserRoles(this.user);
  public userMenuState: UserMenuState;
  public showNotifications: boolean;
  public isUnread: boolean;
  public activeRoleCode: string;
  public showCategories: boolean;
  public emptyCategories = true;
  public hideTimout: any;
  public categories: Category[] = [];
  public showRolesList: boolean;
  public menuCatalogOpened: boolean;

  private closeBurger = new BehaviorSubject(false);
  public closeBurger$ = this.closeBurger.asObservable();

  @ViewChild(FeedsComponent) public feedsComponent: FeedsComponent;

  @Input() public userCounter: CounterData;
  @Input() public comingSoon?: boolean;
  @Input() public links?: MenuLink[] = [];
  @Input() public mergeHeaderMenu?: boolean;
  @Input() public rolesListEnabled?: boolean;
  @Input() public searchSputnikEnabled?: boolean;
  @Input() public logoHref?: string;
  @Input() public showBurger = true;
  @Input() public catalog?: Catalog[];

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
    private router: Router
  ) {
  }

  public ngOnInit(): void {
    this.initUserMenuState();
    this.loadService.userTypeNA$.subscribe(type => {
      this.activeRoleCode = type;
    });
    this.countersService.counters$.subscribe(() => {
      const counter = this.countersService.getCounter(CounterTarget.USER);
      this.isUnread = !!(counter && counter.unread);
    });
  }

  public showUserMenu(isMobileView: boolean) {
    this.menuService.closeBurgerOutside.next(true);

    this.userMenuState = {
      active: true,
      isMobileView
    } as UserMenuState;

    const html = document.getElementsByTagName('html')[0];
    html.classList.add('disable-scroll-sm');
  }

  public hideUserMenu() {
    this.menu.onClose();
  }

  public initUserMenuState(): void {
    this.userMenuState = {
      active: false,
      isMobileView: false
    } as UserMenuState;
  }

  public updateRole(code: string): void {
    this.activeRoleCode = code;
  }

  public backClickHandler(): void {
    this.backClick.emit();
  }

  public openRolesList(): void {
    this.showRolesList = !this.showRolesList;
  }

  public getRoleName(code: string): string {
    return this.userRoles.find(role => role.code === code).name;
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

  public onMenuCatalogClick(menuCatalogOpened: boolean) {
    this.menuCatalogOpened = menuCatalogOpened;
    if (menuCatalogOpened) {
      this.hideUserMenu();
    }
  }

  public closeCategories() {
    this.hideTimout = setTimeout(() => {
      this.showCategories = false;
    }, HIDE_TIMOUT);
  }

}
