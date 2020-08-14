import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, isDevMode, NgModuleRef, OnInit, ViewChild } from '@angular/core';
import { MenuService } from '../../services/menu/menu.service';
import { LoadService } from '../../services/load/load.service';
import { ModalService } from '../../services/modal/modal.service';
import { Category } from '../../models/category';
import { MenuLink } from '../../models/menu-link';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user';
import { UserMenuState } from '../../models/user-menu';
import { Router } from '@angular/router';
import { CountersService } from '../../services/counters/counters.service';
import { CounterTarget } from '../../models/counter';
import { TabsService } from '../../services/tabs/tabs.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';

@Component({
  selector: 'lib-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, AfterViewInit {
  public categories: Category[] = [];
  public links: MenuLink[] = [];
  public menuOffset: number;
  public user: User;
  public staticUrls: object;
  public settingsCounter;
  public avatarError = false;

  @Input()
  public state: UserMenuState;

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
    public  tabsService: TabsService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private yaMetricService: YaMetricService
  ) {
  }

  public ngOnInit() {
    this.links = this.menuService.getUserMenuLinks();
    this.user = this.loadService.user as User;
    this.staticUrls = this.menuService.getStaticItemUrls();
    this.countersService.counters$.subscribe(_ => {
      this.settingsCounter = this.countersService.getCounter(CounterTarget.SETTINGS);
    });
  }

  public ngAfterViewInit() {
    const menu = this.state && this.state.isMobileView ? this.menuMobile : this.menuDesk;
    this.menuOffset = menu.nativeElement.offsetTop;
  }

  public logout() {
    if (isDevMode()) {
      this.authService.logout().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      this.sendYaMetric('logout');
      window.location.href = this.loadService.config.betaUrl + 'auth-provider/logout';
    }
  }

  public getUrl(menuItemName: string): string {
    return this.staticUrls[menuItemName] || '';
  }

  public onClose(tabName?: string) {
    if (tabName) {
      this.sendYaMetric(tabName);
    }
    this.state.active = false;
  }

  public showDeskView() {
    return this.state.active && !this.state.isMobileView;
  }

  public showMobileView() {
    return this.state.active && this.state.isMobileView;
  }

  public menuItemClick(url: string, mnemonic: string) {
    this.sendYaMetric(mnemonic);
    if (url && (url.startsWith('//') || url.startsWith('http'))) {
      window.location.href = url;
    } else {
      this.router.navigate([url]);
    }
  }

  public menuStaticItemClick(itemName: string, mnemonic) {
    const staticUrl = this.getUrl(itemName);
    return this.menuItemClick(staticUrl, mnemonic);
  }

  public sendYaMetric(linkName: string): void {
    this.yaMetricService.callReachGoal('new_lk_dashboard',
      {
        type: this.loadService.attributes.deviceType,
        choice: linkName
      });
  }
}
