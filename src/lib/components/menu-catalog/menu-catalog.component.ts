import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Catalog } from '../../models/main-page.model';
import { Subscription } from 'rxjs';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from "../../services/menu/menu.service";
import { UserRole } from "../../models/menu-link";
import { CatalogTabsService } from '../../services/catalog-tabs/catalog-tabs.service';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'lib-menu-catalog',
  templateUrl: './menu-catalog.component.html',
  styleUrls: ['./menu-catalog.component.scss', '../user-menu/user-menu.component.scss']
})
export class MenuCatalogComponent implements OnInit, OnDestroy {

  @Output() public menuCatalogOpened = new EventEmitter<boolean>();
  public currentCategoryCode: string;

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
    public catalogTabsService: CatalogTabsService,
    public sharedService: SharedService
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
    html.classList.remove('menu-catalog-opened');
    this.showMenu = false;
    this.menuCatalogOpened.emit(false);
    this.showSubCatalog = false;
    this.closeAllTabs();
  }

  public disableScroll(isMenuOpen: boolean, allResolutions: boolean): void {
    const html = document.getElementsByTagName('html')[0];
    if (isMenuOpen) {
      html.classList.add('menu-catalog-opened');
    } else {
      html.classList.remove('menu-catalog-opened');
    }
  }

  private closeAllTabs(): void {
    this.catalog.forEach(item => item.sideActive = false);
    this.catalog.forEach(item => item.active = false);
  }

  public closeCatalog() {
    this.closeAllTabs();
    this.onClose();
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
    // this.sharedService.send('menuCatalogClick');
    this.showMenu = manualClose ? !manualClose : !this.showMenu;
    this.disableScroll(this.showMenu, allResolutions);
    this.menuCatalogOpened.emit(this.showMenu);
  }

  public catalogTabListItemClick(item: any) {

    this.showSubCatalog = false;

    if (item.active) {
      item.active = false;
      return;
    }

    this.closeAllTabs();

    item.active = !item.active;

    this.currentCategoryCode = item.code;
    this.showSubCatalog = item.active;

  }

  public subCatalogClose(): void {
    this.showSubCatalog = false;
    this.closeAllTabs();
  }
}
