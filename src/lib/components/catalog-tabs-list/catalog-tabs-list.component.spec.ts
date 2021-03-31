import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogTabsListComponent } from './catalog-tabs-list.component';

describe('CatalogTabsComponent', () => {
  let component: CatalogTabsListComponent;
  let fixture: ComponentFixture<CatalogTabsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogTabsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogTabsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
