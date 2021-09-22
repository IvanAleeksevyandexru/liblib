import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogTabsComponent } from './catalog-tabs.component';

describe('CatalogTabsComponent', () => {
  let component: CatalogTabsComponent;
  let fixture: ComponentFixture<CatalogTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
