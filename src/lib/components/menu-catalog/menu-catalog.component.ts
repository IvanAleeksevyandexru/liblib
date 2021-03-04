import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Catalog } from '../../models/main-page.model';
import { Subscription } from 'rxjs';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from "../../services";
import { UserRole } from "../../models";

@Component({
  selector: 'lib-menu-catalog',
  templateUrl: './menu-catalog.component.html',
  styleUrls: ['./menu-catalog.component.scss', '../user-menu/user-menu.component.scss']
})
export class MenuCatalogComponent implements OnInit, OnDestroy {

  @Input() public catalog?: Catalog[];
  @Output() public menuCatalogOpened = new EventEmitter<boolean>();

  public user = this.loadService.user;
  public showRolesList = false;
  public rolesListEnabled = true;
  public showMenu = false;
  public userRoles = this.menuService.getUserRoles(this.user);
  public activeRole: UserRole;
  public subscription: Subscription;
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
  }

  public onMenuClick(allResolutions?: boolean) {
    this.showMenu = !this.showMenu;
    this.disableScroll(this.showMenu, allResolutions);
    this.menuCatalogOpened.emit(this.showMenu);
  }
}
