import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { SharedService } from '@epgu/ui/services/shared';
import { Subscription } from 'rxjs';
import { CatalogData } from '@epgu/ui/models';

@Component({
  selector: 'lib-catalog-tabs',
  templateUrl: './catalog-tabs.component.html',
  styleUrls: ['./catalog-tabs.component.scss']
})
export class CatalogTabsComponent implements OnInit, OnDestroy {

  @Input() public catalog: CatalogData[];
  @Input() public mobile: boolean;

  public showCatalogTabItem: boolean;
  public currentCategoryCode: string;
  public sharedServiceSubscription: Subscription;

  constructor(
    public loadService: LoadService,
    public sharedService: SharedService
  ) {
  }

  public ngOnInit(): void {
      this.sharedServiceSubscription = this.sharedService.on('menuCatalogClick').subscribe(() => {
        this.closeCatalog();
      })
  }

  private closeAllTabs(): void {
    this.catalog.forEach(item => item.sideActive = false);
    this.catalog.forEach(item => item.mainActive = false);
  }

  public closeCatalog() {
    this.closeAllTabs();
    this.toggleScroll(false);
    this.showCatalogTabItem = false;
  }

  public toggleScroll(menuOpened: boolean) {
    document.getElementsByTagName('html')[0].classList.toggle('main-menu-catalog-opened', menuOpened);
  }

  public catalogTabListItemClick(item: any) {

    this.showCatalogTabItem = false;

    if (item.mainActive) {
      item.mainActive = false;
      this.toggleScroll(false);
      return;
    }

    this.closeAllTabs();

    item.mainActive = !item.mainActive;

    this.toggleScroll(item.mainActive);
    this.currentCategoryCode = item.code;
    this.showCatalogTabItem = item.mainActive;
  }

  public ngOnDestroy() {
    this.sharedServiceSubscription.unsubscribe();
    this.closeAllTabs();
  }

}
