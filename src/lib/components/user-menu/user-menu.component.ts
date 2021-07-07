import {
  Component, NgModuleRef, HostListener, isDevMode, ViewChild, ChangeDetectorRef,
  Input, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter
} from '@angular/core';
import { Category } from '../../models/category';
import { MenuLink } from '../../models/menu-link';
import { Tabs, Tab, MAIN_TABS } from '../../models/tabs';
import { User } from '../../models/user';
import { CounterData, CounterTarget } from '../../models/counter';
import { UserMenuState } from '../../models/user-menu';
import { Router } from '@angular/router';
import { CountersService } from '../../services/counters/counters.service';
import { MenuService } from '../../services/menu/menu.service';
import { LoadService } from '../../services/load/load.service';
import { ModalService } from '../../services/modal/modal.service';
import { AuthService } from '../../services/auth/auth.service';
import { TabsService } from '../../services/tabs/tabs.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { HelperService } from '../../services/helper/helper.service';
import { Subscription } from 'rxjs';
import { AccessesService } from '../../services/accesses/accesses.service';
import { Translation } from '../../models/common-enums';

@Component({
  selector: 'lib-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  public categories: Category[] = [];
  public menuOffset: number;
  public user: User;
  // public settingsCounter: CounterData; Это вроде уже не нужно. Но пока пусть будет. Мб передумают
  public userCounter: CounterData;
  public partnersCounter: CounterData;
  public mainTabs: Tabs = null;
  public tabsSubscription: Subscription;
  public titleChangeRole: string;
  public userRoles;
  public activeRole;
  public Translation = Translation;

  @Input() public state: UserMenuState;
  @Input() public rolesListEnabled = false;
  @Input() public searchSputnikEnabled = false;
  @Input() public position: 'left' | 'right' = 'right';
  @Input() public links: MenuLink[] = [];
  @Input() public translation: Translation | string = Translation.APP;

  @Output() public closeMenu: EventEmitter<any> = new EventEmitter();

  @ViewChild('menuDesk') public menuDesk;

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
    public  tabsService: TabsService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private yaMetricService: YaMetricService,
    private helperService: HelperService,
    private accessesService: AccessesService,
  ) {
  }

  public ngOnInit() {
    this.user = this.loadService.user as User;
    this.userRoles = this.menuService.getUserRoles(this.user);
    this.activeRole = this.userRoles.find((role) => role.isActive);
    this.countersService.counters$.subscribe(_ => {
      this.partnersCounter = this.countersService.getCounter(CounterTarget.PARTNERS);
      // this.settingsCounter = this.countersService.getCounter(CounterTarget.SETTINGS);
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

  public onClose() {
    const html = document.getElementsByTagName('html')[0];
    html.classList.remove('disable-scroll');
    html.classList.remove('disable-scroll-sm');
    this.state.active = false;
  }

  public showDeskView() {
    return this.state.active && !this.state.isMobileView;
  }

  public menuStaticItemClick(itemName: string, mnemonic): void {
    this.menuService.menuStaticItemClick(itemName, mnemonic);
    this.onClose();
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
