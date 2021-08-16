import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Catalog, UserRole } from '@epgu/ui/models';
import { Subscription } from 'rxjs';
import { LoadService } from '@epgu/ui/services/load';
import { MenuService } from '@epgu/ui/services/menu';

@Component({
  selector: 'lib-menu-catalog-simple',
  templateUrl: './menu-catalog-simple.component.html',
  styleUrls: ['./menu-catalog-simple.component.scss', '../user-menu/user-menu.component.scss']
})
export class MenuCatalogSimpleComponent implements OnInit, OnDestroy {

  @Input() public catalog?: Catalog[];
  @Output() public menuCatalogOpened = new EventEmitter<boolean>();

  public user = this.loadService.user;
  public showRolesList = false;
  public rolesListEnabled = true;
  public showMenu = false;
  public userRoles = this.menuService.getUserRoles(this.user);
  public activeRole: UserRole;
  public subscription: Subscription;
  public subscriptionBurger: Subscription;
  public readonly scrollConfig = {
    wheelPropagation: true
  };

  constructor(
    public loadService: LoadService,
    private menuService: MenuService
  ) {
  }

  public ngOnInit(): void {
    this.loadService.userTypeNA$.subscribe(type => {
      this.activeRole = this.userRoles.find(role => {
        return role.code === type;
      });
    });
    this.subscriptionBurger = this.menuService.closeBurgerOutside$.subscribe(res => {
      if (res) {
        this.onMenuClick(false, true);
      }
    });
  }

  public disableScroll(isMenuOpen: boolean, allResolutions: boolean): void {
    const html = document.getElementsByTagName('html')[0];
    const postfix = allResolutions ? '' : '-sm';
    if (isMenuOpen) {
      html.classList.add(`disable-scroll${postfix}`);
    } else {
      html.classList.remove(`disable-scroll${postfix}`);
    }
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptionBurger) {
      this.subscriptionBurger.unsubscribe();
    }
  }

  public onMenuClick(allResolutions?: boolean, manualClose?: boolean) {
    this.showMenu = manualClose ? !manualClose : !this.showMenu;
    this.disableScroll(this.showMenu, allResolutions);
    this.menuCatalogOpened.emit(this.showMenu);
  }
}
