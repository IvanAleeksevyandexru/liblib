import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, QueryList,
  SimpleChanges,
  ViewChild, ViewChildren
} from '@angular/core';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { forkJoin, of, Subscription } from 'rxjs';

import { GosbarService } from '../../services/gosbar/gosbar.service';
import { SharedService } from '../../services/shared/shared.service';
import { CatalogTabsService } from '../../services/catalog-tabs/catalog-tabs.service';

import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'lib-catalog-tab-item',
  templateUrl: './catalog-tab-item.component.html',
  styleUrls: ['./catalog-tab-item.component.scss']
})
export class CatalogTabItemComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public code: string;
  @Input() public viewType: 'main-page-view' | 'side-view';
  @Output() public catalogClose: EventEmitter<null> = new EventEmitter();

  @ViewChild('scrollbarComponent', {static: false}) public scrollbarComponent: PerfectScrollbarComponent;
  @ViewChildren('elements') public listItems: QueryList<any>;

  public catalogDataSubscription: Subscription;
  public popular: any[];
  public regionPopular: any[];
  public faqsMore: any;
  public faqs: any[];

  public loaded: boolean;
  public regionName: string;
  public regionPopularMore: boolean;

  constructor(
    private catalogTabsService: CatalogTabsService,
    private sharedService: SharedService,
    private gosbarService: GosbarService,
    private router: Router
  ) {
  }

  public ngOnInit(): void {
    this.getRegionName();
    this.toggleBodyScroll(true);
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.getCatalogData();
  }

  public getCatalogData(): void {
    this.loaded = false;
    forkJoin([
      this.catalogTabsService.getCatalogPopular(this.code).pipe(
        catchError((err) => of({}))
      ),
      this.catalogTabsService.getCatalogRegionPopular(this.code).pipe(
        catchError((err) => of([]))
      ),
      this.catalogTabsService.getCatalogFaqs(this.code).pipe(
        catchError((err) => of({faq: {items: []}}))
      )
    ]).subscribe((data: [any, any[], any]) => {
      this.popular = data[0].passports;
      this.regionPopular = data[1];
      this.faqs = data[2].faq.items;
      this.loaded = true;
      this.catalogTabsService.storeCatalogData(data, this.code);
    }, () => {
      // TODO: обработка ошибок
      this.loaded = true;
    });
  }

  public toggleFaqsQuestions(item: any): void {
    item.active = !item.active;
  }

  public getRegionName(): void {
    this.sharedService.on('regionData').subscribe(regionData => {
      if (regionData && regionData.code !== '00000000000') {
        this.regionName = regionData.name;
      }
    });
  }

  public showRegionModal(): void {
    this.gosbarService.popupLocation();
  }

  public toggleBodyScroll(disable: boolean): void {
    document.body.classList.toggle('disable-scroll', disable);
  }

  public closeCatalog($evt): void {
    $evt.preventDefault();
    $evt.stopPropagation();
    this.toggleBodyScroll(false);
    this.catalogClose.emit();
  }

  public goToPopular(item: any): void {
    const link = item.epguPassport ? `/group/${item.epguId}` : `${item.epguId}`;
    this.router.navigate([link]);
  }

  // public scrollToQuestion(): void {
  //   const el = this.listItems.toArray();
  //   this.scrollbarComponent.directiveRef.scrollToTop(30, 300);
  // }

  public ngOnDestroy() {
    this.toggleBodyScroll(false);
  }

}
