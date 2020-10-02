import { Component, OnInit } from '@angular/core';
import { CountersService} from '../../services/counters/counters.service';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from '../../services/menu/menu.service';
import { UserMenuState, CounterTarget } from '../../models';

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

  constructor(
    private loadService: LoadService,
    private menuService: MenuService,
    private countersService: CountersService
  ) {
  }

  public ngOnInit(): void {
    this.loadService.userTypeNA$.subscribe(type => {
      this.updateRole(type);
    });
    this.initUserMenuState();
    this.countersService.counters$.subscribe(() => {
      const counter = this.countersService.getCounter(CounterTarget.USER);
      this.isUnread = !!(counter && counter.unread);
    });
  }

  public showUserMenu(isMobileView: boolean) {
    if (this.user && this.user.authorized) {
      this.userMenuState = {
        active: true,
        isMobileView
      } as UserMenuState;
    }
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

}
