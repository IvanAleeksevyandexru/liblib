import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  isDevMode,
  NgModuleRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Category, MAIN_TABS, MenuLink, Tab, Tabs, UserMenuState } from '@epgu/ui/models';
import { User } from '@epgu/ui/models/user';
import { CounterData, CounterTarget } from '@epgu/ui/models/counter';
import { Router } from '@angular/router';
import { CountersService } from '@epgu/ui/services/counters';
import { MenuService } from '@epgu/ui/services/menu';
import { LoadService } from '@epgu/ui/services/load';
import { ModalService } from '@epgu/ui/services/modal';
import { AuthService } from '@epgu/ui/services/auth';
import { TabsService } from '@epgu/ui/services/tabs';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { HelperService } from '@epgu/ui/services/helper';
import { Observable, Subscription } from 'rxjs';
import { AccessesService } from '@epgu/ui/services/accesses';
import { take } from 'rxjs/operators';

@Component({
  selector: 'lib-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  public categories: Category[] = [];
  public menuOffset: number;
  public user: User;
  public staticUrls: object;
  // public settingsCounter: CounterData; Это вроде уже не нужно. Но пока пусть будет. Мб передумают
  public userCounter: CounterData;
  public partnersCounter: CounterData;
  public avatarError = false;
  public mainTabs: Tabs = null;
  public tabsSubscription: Subscription;
  public titleChangeRole: string;
  public userRoles;
  public activeRole;
  public showRolesList = false;
  public showAllMenu = true;
  public staticList = true;

  @Input() public state: UserMenuState;
  @Input() public rolesListEnabled = false;
  @Input() public searchSputnikEnabled = false;
  @Input() public position: 'left' | 'right' = 'right';
  @Input() public links: MenuLink[] = [];
  @Input() public closeStatisticPopup$: Observable<boolean>;

  @ViewChild('menuDesk') public menuDesk;
  @ViewChild('menuMobile') public menuMobile;

  @HostListener('document:keydown', ['$event'])
  public onKeydownComponent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClose();
    }
  }

  @HostListener('document:click', ['$event'])
  public onClickOut(event) {
    if (event.target.classList.contains('content-overlay') && !this.state.isMobileView) {
      this.onClose();
    }
  }

  constructor(
    public loadService: LoadService,
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
    private menuService: MenuService,
    private authService: AuthService,
    private countersService: CountersService,
    public tabsService: TabsService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private yaMetricService: YaMetricService,
    private helperService: HelperService,
    private accessesService: AccessesService,
  ) {
  }

  public ngOnInit() {
    if (!this.links.length) {
      this.links = this.menuService.getUserMenuDefaultLinks();
    }
    this.user = this.loadService.user as User;
    this.userRoles = this.menuService.getUserRoles(this.user);
    this.activeRole = this.userRoles.find((role) => role.isActive);
    this.staticUrls = this.menuService.getStaticItemUrls();
    this.countersService.counters$.subscribe(_ => {
      this.partnersCounter = this.countersService.getCounter(CounterTarget.PARTNERS);
      //this.settingsCounter = this.countersService.getCounter(CounterTarget.SETTINGS);
      this.userCounter = this.countersService.getCounter(CounterTarget.USER);
    });
    this.tabsSubscription = this.tabsService.register(MAIN_TABS).subscribe((tabs: Tabs) => {
      this.mainTabs = tabs;
      this.changeDetector.detectChanges();
    });
    this.getTitleChangeRole();
  }

  public ngAfterViewInit() {
    const menu = this.menuDesk;
    this.menuOffset = menu.nativeElement.offsetTop;
  }

  public ngOnDestroy() {
    this.tabsSubscription.unsubscribe();
  }

  public logout() {
    if (isDevMode()) {
      this.authService.logout().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      this.sendYaMetric('logout');
      window.location.href = this.loadService.config.betaUrl + 'auth/logout?_=' + Math.random();
    }
  }

  public getUrl(menuItemName: string): string {
    return this.staticUrls[menuItemName] || '';
  }

  public onClose() {
    const html = document.getElementsByTagName('html')[0];
    html.classList.remove('disable-scroll');
    html.classList.remove('disable-scroll-sm');
    this.state.active = false;
  }

  public showDeskView() {
    return this.state.active && !this.state.isMobileView;
  }

  public showMobileView() {
    return this.state.active && this.state.isMobileView;
  }

  public menuItemClick(link: MenuLink): void {
    this.sendYaMetric(link.mnemonic);
    this.onClose();
    if (link.handler) {
      link.handler(link);
    } else {
      this.helperService.navigate(link.url);
    }
  }

  public menuStaticItemClick(itemName: string, mnemonic) {
    const staticUrl = this.getUrl(itemName);
    if (this.closeStatisticPopup$) {
      this.closeStatisticPopup$.pipe(take(1)).subscribe(condition => {
        if (condition) {
          this.menuItemClick({url: staticUrl, mnemonic} as MenuLink);
        }
      });
    } else {
      this.menuItemClick({url: staticUrl, mnemonic} as MenuLink);
    }
  }

  public selectTab(tab: Tab) {
    const proceed = () => {
      if (tab.url) {
        this.helperService.navigate(tab.url);
      }
      this.onClose();
    };
    if (tab.metric) {
      const menuTabMetric = Object.assign({}, tab.metric, {name: 'new_lk_dashboard'});
      this.yaMetricService.callReachGoalParamsAsMap(menuTabMetric).then(proceed);
    } else {
      proceed();
    }
  }

  public sendYaMetric(linkName: string): void {
    this.yaMetricService.callReachGoal('new_lk_dashboard',
      {
        type: this.loadService.attributes.deviceType,
        choice: linkName
      });
  }

  public showMenuTabs(): boolean {
    let show = true;
    if (this.loadService.attributes.appContext === 'PARTNERS') {
      show = this.accessesService.getAccessTech();
    }

    return show;
  }

  private getTitleChangeRole(): void {
    if (['B', 'L'].includes(this.user.type)) {
      this.titleChangeRole = 'HEADER.MENU.CHANGE_ROLE';
    } else {
      this.titleChangeRole = 'HEADER.MENU.LOGIN_ORG';
    }
  }

  public needCounter(type: string): boolean {
    const types = ['notifications', 'partnersOrders'];
    return types.includes(type);
  }

  public getKindOfCounter(type: string): CounterData {
    switch (type) {
      case 'notifications':
        return this.userCounter;
      case 'partnersOrders':
        return this.partnersCounter;
    }
  }

}
