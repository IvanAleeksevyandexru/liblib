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
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'lib-catalog-tab-item',
  templateUrl: './catalog-tab-item.component.html',
  styleUrls: ['./catalog-tab-item.component.scss']
})
export class CatalogTabItemComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public code: string;
  @Input() public viewType: 'main-page-view' | 'side-view';
  @Output() public catalogClose: EventEmitter<null> = new EventEmitter();
  @Output() public subCatalogClose: EventEmitter<null> = new EventEmitter();

  public catalogDataSubscription: Subscription;
  public popular: any[];
  public regionPopular: any[];
  public faqsMore: any;
  public popularMore: any;
  public faqs: any[];
  public backTitle: string;
  public itemsCounter: number;

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
    this.itemsCounter = this.viewType === 'main-page-view' ? 3 : 5;
    this.popularMore = this.viewType === 'main-page-view' ? undefined : 5;
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
      this.catalogTabsService.getFaqCategories(this.code, this.viewType === 'main-page-view').pipe(
        catchError((err) => of({faqCategories: {items: []}}))
      )
    ]).pipe(
      switchMap((data: any) => {
        const faqCategoriesData = data[2];
        if (faqCategoriesData && faqCategoriesData.faqCategories && faqCategoriesData.faqCategories.items.length === 0) {
          return of(data);
        }
        if(faqCategoriesData?.faqCategories?.items?.length === 0) {
          return of(data);
        }
        const categoriesCodes = faqCategoriesData.faqCategories.items.map((item: any) => {
          return item.code;
        })
        return of(...categoriesCodes).pipe(
            concatMap(code => this.catalogTabsService.getFaqItemCategory(code, this.code)
          )
        ).pipe(map((faqItemCategory: any) =>  data.concat({faqItemCategory})))
      })
    ).subscribe((data: [any, any[], any, any]) => {
      this.popular = data[0].passports;
      this.regionPopular = data[1];
      if (data[3]) {
        this.createFaqs(data[3]);
      }
      this.loaded = true;
      this.catalogTabsService.storeCatalogData(data, this.code, this.viewType === 'main-page-view');
      this.getBackTitle();
    }, () => {
      // TODO: обработка ошибок
      this.loaded = true;
    });
  }

  public createFaqs(faqsData: any): void {
    this.faqs = faqsData.faqItemCategory.children;
    if (!this.faqs && faqsData.faqItemCategory.faqs.length > 0) {
      this.faqs = [{
        title: faqsData.faqItemCategory.title,
        faqs: faqsData.faqItemCategory.faqs
      }]
    }
  }

  public getBackTitle(): void {
    this.backTitle = this.catalogTabsService.catalogTabsList.find((item) => {
      return item.code === this.code;
    }).title;
  }

  public closeSubCatalog(): void {
    this.subCatalogClose.emit();
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
    this.catalogClose.emit();
    this.router.navigate([link]);
  }

  public ngOnDestroy() {
    this.toggleBodyScroll(false);
  }

}
