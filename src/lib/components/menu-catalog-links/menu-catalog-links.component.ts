import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { CatalogTabsService } from '../../services/catalog-tabs/catalog-tabs.service';

@Component({
  selector: 'lib-menu-catalog-links',
  templateUrl: './menu-catalog-links.component.html',
  styleUrls: ['./menu-catalog-links.component.scss']
})
export class MenuCatalogLinksComponent implements OnInit {

  @Input() public mobile: boolean;
  @Output() public catalogLinkClick = new EventEmitter<boolean>()

  public showCatalogTabItem: boolean;
  public currentCategoryCode: string;

  public catalog = this.catalogTabsService.catalogTabsList;

  constructor(
    public loadService: LoadService,
    public catalogTabsService: CatalogTabsService
  ) {
  }

  public ngOnInit(): void {
  }

  private closeAllTabs(): void {
    this.catalog.forEach(item => item.sideActive = false);
  }

  public openTab($event: any, item: any) {
    $event.preventDefault();
    $event.stopPropagation();

    this.showCatalogTabItem = false;

    if (item.sideActive) {
      item.sideActive = false;
      this.catalogLinkClick.emit(false);
      return;
    }

    this.closeAllTabs();

    item.sideActive = !item.sideActive;

    this.currentCategoryCode = item.code;
    this.showCatalogTabItem = item.sideActive;

    this.catalogLinkClick.emit(item.sideActive);
  }
}
