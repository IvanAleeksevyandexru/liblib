import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadService } from '@epgu/ui/services/load';
import { MenuService } from '@epgu/ui/services/menu';
import { CatalogData, UserRole } from '@epgu/ui/models';
import { CatalogTabsService } from '@epgu/ui/services/catalog-tabs';
import { SharedService } from '@epgu/ui/services/shared';
import { User } from '@epgu/ui/models/user';

@Component({
  selector: 'lib-menu-catalog',
  templateUrl: './menu-catalog.component.html',
  styleUrls: ['./menu-catalog.component.scss', '../user-menu/user-menu.component.scss']
})
export class MenuCatalogComponent implements OnInit, OnDestroy {

  public user = this.loadService.user as User;
  public showRolesList = false;
  public emptyRegionPopular: boolean;
  public showSubCatalog: boolean;
  public catalog = this.catalogTabsService.catalogTabsList;
  public showMenu = false;
  public userRoles = this.menuService.getUserRoles(this.user);
  public activeRole: UserRole;
  public subscription: Subscription;
  public subscriptionBurger: Subscription;
  public isOpenLangMenu = false;

  @Input() public languageChangeAvailable?: boolean;

  @Output() public menuCatalogOpened?: EventEmitter<boolean> = new EventEmitter<boolean>();
  public currentCategoryCode: string;

  @HostListener('document:click', ['$event'])
  public onClickOut(event) {
    if (event.target.classList.contains('catalog-menu')) {
      this.onClose();
    }
  }

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
    this.catalog.forEach(item => item.mainActive = false);
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
    this.sharedService.send('menuCatalogClick', 'menuCatalogClick');
    this.showMenu = manualClose ? !manualClose : !this.showMenu;
    this.disableScroll(this.showMenu, allResolutions);
    this.menuCatalogOpened.emit(this.showMenu);
  }

  public catalogTabListItemClick(item: CatalogData) {

    this.showSubCatalog = false;

    if (item.sideActive) {
      item.sideActive = false;
      return;
    }

    this.closeAllTabs();

    item.sideActive = !item.sideActive;

    this.currentCategoryCode = item.code;
    this.showSubCatalog = item.sideActive;

  }

  public subCatalogClose(): void {
    this.showSubCatalog = false;
    this.closeAllTabs();
  }

  public regionPopularEmpty($event): void {
    setTimeout(() => {
      this.emptyRegionPopular = $event;
    });
  }

  public openLanguageMenu(evt: boolean) {
    this.isOpenLangMenu = evt;
  }
}
