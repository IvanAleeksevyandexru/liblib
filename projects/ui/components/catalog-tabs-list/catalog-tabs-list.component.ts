import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { CatalogData } from '@epgu/ui/models';

@Component({
  selector: 'lib-catalog-tabs-list',
  templateUrl: './catalog-tabs-list.component.html',
  styleUrls: ['./catalog-tabs-list.component.scss']
})
export class CatalogTabsListComponent implements OnInit, OnDestroy {

  @Input() public catalog: CatalogData[];
  @Input() public viewType: 'main-page-view' | 'side-view';
  @Input() public alwaysShowLocationSelect: boolean;
  @Output() public catalogTabListItemClick = new EventEmitter<CatalogData>();

  constructor(
    private yaMetricService: YaMetricService,
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {

  }

  public ngOnDestroy() {
  }

  public onReachEnd(): void {
    console.log('end!!');
  }

  public tabClick($event: any, item: CatalogData) {
    $event.preventDefault();
    $event.stopPropagation();
    item.viewType = this.viewType;
    this.catalogTabListItemClick.emit(item);
    this.yaMetricService.callReachGoal('main-page', {
      'main-header': item.code
    });
  }
}
