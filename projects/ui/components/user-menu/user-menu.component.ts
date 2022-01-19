import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, EventEmitter,
  HostListener,
  Input,
  isDevMode,
  NgModuleRef,
  OnDestroy,
  OnInit, Output,
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
import { Translation } from '@epgu/ui/models/common-enums';

@Component({
  selector: 'lib-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  public categories: Category[] = [];
  public menuOffset: number;
  public user: User;
  public userCounter: CounterData;
  public partnersCounter: CounterData;
  public mainTabs: Tabs = null;
  public tabsSubscription: Subscription;
  public titleChangeRole: string;
  public userRoles;
  public activeRole;
  public Translation = Translation;
  public psoContainer = document.getElementById('pso-widget-container');

  @Input() public state: UserMenuState;
  @Input() public rolesListEnabled = false;
  @Input() public searchSputnikEnabled = false;
  @Input() public position: 'left' | 'right' = 'right';
  @Input() public links: MenuLink[] = [];
  @Input() public translation: Translation | string = Translation.APP;
  @Input() public closeStatisticPopup$: Observable<boolean>;

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
    public tabsService: TabsService,
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
      this.userCounter = this.countersService.getCounter(CounterTarget.USER);
      this.partnersCounter = this.countersService.getCounter(CounterTarget.PARTNERS);
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
      this.yaMetricService.callReachGoal('header', { 'header': { 'Выйти': '' } }, () => {
        window.location.href = this.loadService.config.betaUrl + 'auth/logout?_=' + Math.random();
      });
    }
  }

  public onClose() {
    const html = document.getElementsByTagName('html')[0];
    html.classList.remove('disable-scroll');
    html.classList.remove('disable-scroll-sm');
    this.state.active = false;
    if (this.psoContainer && (window as any).screen.width < 812) {
      this.psoContainer.style.display = 'unset';
    }
  }

  public showDeskView() {
    return this.state.active && !this.state.isMobileView;
  }

  public menuStaticItemClick(itemName: string, mnemonic): void {
    if (this.closeStatisticPopup$) {
      this.closeStatisticPopup$.pipe(
        take(1)
      ).subscribe(condition => {
        if (condition) {
          this.menuService.menuStaticItemClick(itemName, mnemonic);
        }
      });
    } else {
      this.menuService.menuStaticItemClick(itemName, mnemonic);
    }
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
      const menuTabMetric = Object.assign({}, tab.metric, { name: 'new_lk_dashboard' });
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
    const types = ['notifications', 'overview', 'partnersOrders', 'orders'];
    return types.includes(type);
  }

  public getKindOfCounter(type: string): CounterData {
    switch (type) {
      case 'notifications':
      case 'overview':
        return this.userCounter;
      case 'partnersOrders':
        return this.partnersCounter;
    }
  }

}
