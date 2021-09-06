import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from '../../services/menu/menu.service';
import { UserRole } from '../../models/menu-link';
import { CatalogTabsService } from '../../services/catalog-tabs/catalog-tabs.service';
import { SharedService } from '../../services/shared/shared.service';
import { CatalogData } from '../../models/catalog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'lib-menu-catalog',
  templateUrl: './menu-catalog.component.html',
  styleUrls: ['./menu-catalog.component.scss', '../user-menu/user-menu.component.scss']
})
export class MenuCatalogComponent implements OnInit, OnChanges, OnDestroy {

  public user = this.loadService.user;
  public emptyRegionPopular: boolean;
  public showSubCatalog: boolean;
  public catalog = this.catalogTabsService.catalogTabsList;
  public showMenu = false;
  public userRoles = this.menuService.getUserRoles(this.user);
  public activeRole: UserRole;
  public subscription: Subscription;
  public subscriptionBurger: Subscription;
  public roleChangeAvailable = true;
  private translateSubscription: Subscription;
  public activeRoleCode: string;

  @Input() public languageChangeAvailable?: boolean;
  @Input() public hideBurgerDesc = false;
  @Input() public alwaysShowLocationSelect?: boolean;

  @Output() public menuCatalogOpened?: EventEmitter<boolean> = new EventEmitter<boolean>();
  public currentCategoryCode: string;

  @HostListener('document:click', ['$event'])
  public onClickOut(event) {
    if (event.target.classList.contains('catalog-menu')) {
      this.onClose();
    }
  }

  @ViewChild('catalogMenu') private catalogMenu: ElementRef<HTMLDivElement>;

  constructor(
    public loadService: LoadService,
    private menuService: MenuService,
    public catalogTabsService: CatalogTabsService,
    public sharedService: SharedService,
    public translate: TranslateService,
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
    this.translateSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.roleChangeAvailable = HelperService.langIsRus(event.lang);
    });
    this.roleChangeAvailable = HelperService.langIsRus(this.translate.currentLang);
    this.loadService.userTypeNA$.subscribe(type => {
      this.activeRoleCode = type;
    });
  }

  public ngOnChanges() {
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
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
    if (evt) {
      const top = this.catalogMenu.nativeElement.scrollTop + 56;
      setTimeout( () => this.catalogMenu.nativeElement.scrollTop = top, 0);
    }
  }

}
