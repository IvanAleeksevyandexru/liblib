import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { forkJoin, of } from 'rxjs';

import { GosbarService } from '../../services/gosbar/gosbar.service';
import { SharedService } from '../../services/shared/shared.service';
import { CatalogTabsService } from '../../services/catalog-tabs/catalog-tabs.service';

import { Router } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LocationService } from '../../services/location/location.service';
import { LoadService } from '../../services/load/load.service';
import {
  Children, DepartmentPassport,
  Departments, FaqCategories, FaqCategoriesCMS, FaqCategoriesCMSFaq,
  FaqCategoriesItem,
  PassportChildren,
  PopularFederal,
  RegionalPopular
} from '../../models/catalog';

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
  @Output() public regionPopularEmpty: EventEmitter<boolean> = new EventEmitter();

  public popular: PassportChildren[];
  public departmentsData: Departments[];
  public otherPopular: Children[];
  public regionPopular: RegionalPopular[];
  public popularMore: undefined | number;
  public faqs: FaqCategoriesCMS[];
  public backTitle: string;
  public itemsCounter: undefined | number;

  public loaded: boolean;
  public regionName = this.locationService.userSelectedRegionName;
  public regionPopularMore: boolean;

  constructor(
    private catalogTabsService: CatalogTabsService,
    private sharedService: SharedService,
    private gosbarService: GosbarService,
    private locationService: LocationService,
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
    this.itemsCounter = this.viewType === 'main-page-view' ? 3 : 5;
    this.popularMore = this.viewType === 'main-page-view' ? undefined : 5;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.code === 'ministries') {
      this.getDepartmentsData();
    } else {
      this.getCatalogData();
    }
  }

  public getDepartmentsData(): void {
    this.loaded = false;
    this.catalogTabsService.getDepartmentsData().subscribe((departmentsData: Departments[]) => {
      this.catalogTabsService.departmentsData = departmentsData;
      this.departmentsData = this.departmentDataHandling(departmentsData);
      this.regionPopularEmpty.emit(false);
      this.loaded = true;
    })
  }

  public departmentDataHandling(departmentsData: Departments[]): Departments[] {
    const departments = departmentsData.slice(0, 6);
    const secondColumnDepartments = [];
    const firstColumnDepartments = [];
    departments.forEach((item, index, arr) => {
      if((index + 1) % 2 === 0) {
        secondColumnDepartments.push(item);
      } else {
        firstColumnDepartments.push(item);
      }
    });
    return firstColumnDepartments.concat(secondColumnDepartments);
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
      this.catalogTabsService.getFaqCategories(this.code).pipe(
        catchError((err) => of({faqCategories: {items: []}}))
      )
    ]).pipe(
      switchMap((data: [PopularFederal, RegionalPopular[], FaqCategories]) => {
        if (this.catalogTabsService.catalogTabsData[this.code] && this.catalogTabsService.getDataCatalogStoreData(this.code)[3]) {
          return of(this.catalogTabsService.getDataCatalogStoreData(this.code));
        }
        const multipleData = [];
        data[2].faqCategories.items.forEach((item: FaqCategoriesItem) => {
          multipleData.push(this.catalogTabsService.getFaqItemCategory(item.code, this.code))
        })

        return forkJoin(multipleData).pipe(map((faqItemCategory: any) =>  {
          return data.concat([faqItemCategory]);
        }))
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
    if(popular.code === 'other') {
      this.otherPopular = popular.children;
    } else {
      this.popular = popular.passports;
    }
  }

  public createFaqs(faqsData: FaqCategoriesCMS[]): void {
    let children = [];
    let faqs = [];
    faqsData.forEach((item) => {
      if(item.children && item.children.length) {
        children = children.concat(item.children);
      }
    });
    faqsData.forEach((item) => {
      if(item.faqs && item.faqs.length)
        faqs = faqs.concat({
          title: item.title,
          faqs: item.faqs,
        });
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

  public goToPopular(item: PassportChildren | RegionalPopular): void {
    const link = item.epguPassport ? `/group/${item.epguId}` : `${item.epguId}`;
    this.catalogClose.emit();
    location.href = link;
  }

  public ngOnDestroy() {
  }

  public goToDepartment(departmentPassport: DepartmentPassport): void {
    location.href = `${this.loadService.config.betaUrl}${departmentPassport.url}`;
  }
}