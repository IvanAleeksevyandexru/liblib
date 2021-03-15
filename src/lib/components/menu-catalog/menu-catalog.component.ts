import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Catalog } from '../../models/main-page.model';
import { Subscription } from 'rxjs';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from "../../services/menu/menu.service";
import { UserRole } from "../../models/menu-link";
import { CatalogTabsService } from '../../services/catalog-tabs/catalog-tabs.service';

@Component({
  selector: 'lib-menu-catalog',
  templateUrl: './menu-catalog.component.html',
  styleUrls: ['./menu-catalog.component.scss', '../user-menu/user-menu.component.scss']
})
export class MenuCatalogComponent implements OnInit, OnDestroy {

  @Output() public menuCatalogOpened = new EventEmitter<boolean>();

  @HostListener('document:click', ['$event'])
  public onClickOut(event) {
    if (event.target.classList.contains('catalog-menu')) {
      this.onClose();
    }
  }

  public user = this.loadService.user;
  public showRolesList = false;
  public showSubCatalog: boolean;
  public catalog = this.catalogTabsService.catalogTabsList;
  public showMenu = false;
  public userRoles = this.menuService.getUserRoles(this.user);
  public activeRole: UserRole;
  public subscription: Subscription;
  public subscriptionBurger: Subscription;

  constructor(
    public loadService: LoadService,
    private menuService: MenuService,
    public catalogTabsService: CatalogTabsService
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

  public onClose() {
    const html = document.getElementsByTagName('html')[0];
    html.classList.remove('disable-scroll');
    this.showMenu = false;
    this.menuCatalogOpened.emit(false);
    this.showSubCatalog = false;
  }

  public disableScroll(isMenuOpen: boolean, allResolutions: boolean): void {
    const html = document.getElementsByTagName('html')[0];
    if (isMenuOpen) {
      html.classList.add(`disable-scroll`);
    } else {
      html.classList.remove(`disable-scroll`);
    }
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptionBurger) {
      this.subscriptionBurger.unsubscribe();
    }
    this.onClose();
  }

  public onMenuClick(allResolutions?: boolean, manualClose?: boolean) {
    this.showMenu = manualClose ? !manualClose : !this.showMenu;
    this.disableScroll(this.showMenu, allResolutions);
    this.menuCatalogOpened.emit(this.showMenu);
  }

  public catalogLinkClick(showSubCatalog: boolean) {
    this.showSubCatalog = showSubCatalog;
  }
}
