import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogTabItemComponent } from './catalog-tab-item.component';

describe('CatalogTabItemComponent', () => {
  let component: CatalogTabItemComponent;
  let fixture: ComponentFixture<CatalogTabItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogTabItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogTabItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
