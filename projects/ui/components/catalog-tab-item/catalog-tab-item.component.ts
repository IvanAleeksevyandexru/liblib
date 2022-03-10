import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { GosbarService } from '@epgu/ui/services/gosbar';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { CatalogTabsService } from '@epgu/ui/services/catalog-tabs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LocationService } from '@epgu/ui/services/location';
import { LoadService } from '@epgu/ui/services/load';
import {
  CatalogServiceCategory,
  CatalogServiceDepartment,
  CatalogServiceElement,
  Departments,
  FaqCategories,
  FaqCategoriesCMS,
  FaqCategoriesCMSFaq,
  FaqCategoriesItem,
  PopularFederal,
  RegionalPopular
} from '@epgu/ui/models';

@Component({
  selector: 'lib-catalog-tab-item',
  templateUrl: './catalog-tab-item.component.html',
  styleUrls: ['./catalog-tab-item.component.scss']
})
export class CatalogTabItemComponent implements OnInit, OnChanges {

  @Input() public code: string;
  @Input() public viewType: 'main-page-view' | 'side-view';
  @Output() public catalogClose: EventEmitter<null> = new EventEmitter();
  @Output() public subCatalogClose: EventEmitter<null> = new EventEmitter();
  @Output() public regionPopularEmpty: EventEmitter<boolean> = new EventEmitter();

  public popular: CatalogServiceElement[];
  public departmentsData: Departments[];
  public otherPopular: CatalogServiceCategory[];
  public regionPopular: RegionalPopular[];
  public popularMore: undefined | number;
  public faqs: FaqCategoriesCMS[];
  public backTitle: string;
  public itemsCounter: undefined | number;
  public tabListName: string;
  public activeRoleCode: string;

  public loaded: boolean;
  public regionName = this.locationService.userSelectedRegionName;
  public regionPopularMore: boolean;

  @ViewChild('faqAnswerWrap', {static: false}) private faqAnswerWrap: ElementRef;

  constructor(
    private catalogTabsService: CatalogTabsService,
    private yaMetricService: YaMetricService,
    private gosbarService: GosbarService,
    private locationService: LocationService,
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
    this.setItemCounters();
    this.loadService.userTypeNA$.subscribe(type => {
      this.activeRoleCode = type;
    });
  }

  public setItemCounters() {
    this.itemsCounter = this.viewType === 'main-page-view' ? 3 : 5;
    this.popularMore = this.viewType === 'main-page-view' ? undefined : 5;
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.setItemCounters();
    if (this.code === 'ministries') {
      this.getDepartmentsData();
    } else {
      this.getCatalogData();
    }
  }

  public setTargetAttrToFaqLinks() {
    setTimeout(() => {
      if (this.faqAnswerWrap) {
        Array.from(this.faqAnswerWrap.nativeElement.getElementsByTagName('A'))
          .forEach((link: Element) => {
            link.setAttribute('target', '_blank');
          });
      }
    });
  }

  public goToCategory(category: string | number, faq: string | number): void {
    window.open(`${this.loadService.config.betaUrl}help/faq/${category}/${faq}`, '_blank');
  }

  public getDepartmentsData(): void {
    this.loaded = false;
    this.catalogTabsService.getDepartmentsData().subscribe((departmentsData: Departments[]) => {
      this.catalogTabsService.departmentsData = departmentsData;
      this.departmentsData = this.departmentDataHandling(departmentsData);
      this.regionPopularEmpty.emit(false);
      this.loaded = true;
    });
  }

  public departmentDataHandling(departmentsData: Departments[]): Departments[] {
    const departments = departmentsData.slice(0, 6);
    const secondColumnDepartments = [];
    const firstColumnDepartments = [];
    departments.forEach((item, index, arr) => {
      if ((index + 1) % 2 === 0) {
        secondColumnDepartments.push(item);
      } else {
        firstColumnDepartments.push(item);
      }
    });
    return firstColumnDepartments.concat(secondColumnDepartments);
  }

  public getCatalogData(): void {
    this.loaded = false;
    this.faqs = [];
    this.regionPopular = [];
    forkJoin([
      this.catalogTabsService.getCatalogPopular(this.code).pipe(
        catchError((err) => of({}))
      ),
      this.catalogTabsService.getCatalogRegionPopular(this.code).pipe(
        catchError((err) => of([]))
      ),
      this.catalogTabsService.getFaqCategories(this.code).pipe(
        catchError((err) => of({faqCategories: {items: []}}))
      )
    ]).pipe(
      switchMap((data: [PopularFederal, RegionalPopular[], FaqCategories]) => {
        this.tabListName = data[0].name;
        if (this.catalogTabsService.catalogTabsData[this.code] && this.catalogTabsService.getDataCatalogStoreData(this.code)[3]) {
          return of(this.catalogTabsService.getDataCatalogStoreData(this.code));
        }
        const multipleData = [];
        if (data[2] && data[2].faqCategories && data[2].faqCategories.items && data[2].faqCategories.items.length) {
          data[2].faqCategories.items.forEach((item: FaqCategoriesItem) => {
            multipleData.push(this.catalogTabsService.getFaqItemCategory(item.code, this.code));
          });
          return forkJoin(multipleData).pipe(map((faqItemCategory: any) => {
            return data.concat([faqItemCategory]);
          }));
        }
        return of(data.concat([]));
      })
    ).subscribe((data: [PopularFederal, RegionalPopular[], Departments[], FaqCategoriesCMS[]]) => {
      this.catalogTabsService.storeCatalogData(data, this.code);
      if (data[0]) {
        this.createPopular(data[0]);
      }
      if (data[1]) {
        this.createRegionPopular(data[1]);
      }
      if (data[3]) {
        this.createFaqs(data[3]);
      }
      this.loaded = true;
      this.getBackTitle();
      this.setTargetAttrToFaqLinks();
    }, () => {
      // TODO: обработка ошибок
      this.loaded = true;
    });
  }

  public createRegionPopular(regionPopular: RegionalPopular[]) {
    this.regionPopular = regionPopular;
    this.regionPopularEmpty.emit(regionPopular.length === 0 && this.code !== 'ministries');
  }

  public createPopular(popular: PopularFederal): void {
    if (popular.code === 'other') {
      this.otherPopular = popular.categories;
    } else {
      this.popular = popular.elements;
    }
  }

  public createFaqs(faqsData: FaqCategoriesCMS[]): void {
    let children = [];
    let faqs = [];
    faqsData.forEach((item) => {
      if (item.children && item.children.length) {
        children = children.concat(item.children);
      }
    });
    faqsData.forEach((item) => {
      if (item.faqs && item.faqs.length) {
        faqs = faqs.concat({
          title: item.title,
          faqs: item.faqs,
        });
      }
    });
    this.faqs = children.concat(faqs);
  }

  public getBackTitle(): void {
    this.backTitle = this.catalogTabsService.catalogTabsList.find((item) => {
      return item.code === this.code;
    }).title;
  }

  public closeSubCatalog(): void {
    this.subCatalogClose.emit();
  }

  public toggleFaqsQuestions(item: FaqCategoriesCMSFaq): void {
    item.active = !item.active;
  }

  public showRegionModal(): void {
    this.gosbarService.popupLocation();
  }

  public closeCatalog($evt): void {
    $evt.preventDefault();
    $evt.stopPropagation();
    this.catalogClose.emit();
  }

  public goToPopular(item: any): void {
    let yaParams = {};
    this.catalogClose.emit();

    if (this.activeRoleCode === 'P' && this.viewType === 'side-view') {
      yaParams = {
        ['Бургер']: {
          ['для граждан']: {
            [this.tabListName] : [item.name]
          }
        }
      };
    } else {
      yaParams = {
        'main-header': {}
      };
      yaParams['main-header'][this.code] = [item.code];
    }

    this.yaMetricService.callReachGoal('main-page', yaParams, () => {
      location.href = item.type === 'LINK' ? item.url : `${this.loadService.config.betaUrl}${item.url}`;
    });
  }

  public checkOldPortalBanner(): boolean {
    return this.loadService.config.linkToNewOldPortal
      && this.viewType === 'main-page-view'
      && !localStorage.getItem('new-portal-banner-close');
  }

  public goToDepartment(departmentPassport: CatalogServiceDepartment): void {
    let yaParams = {
      'main-header': {}
    };
    yaParams['main-header'][this.code] = [departmentPassport.code];

    this.yaMetricService.callReachGoal('main-page', yaParams, () => {
      location.href = `${this.loadService.config.betaUrl}${departmentPassport.url}`;
    });
  }
}
