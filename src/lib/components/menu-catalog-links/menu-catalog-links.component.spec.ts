import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCatalogLinksComponent } from './menu-catalog-links.component';

describe('MenuCatalogLinksComponent', () => {
  let component: MenuCatalogLinksComponent;
  let fixture: ComponentFixture<MenuCatalogLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuCatalogLinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuCatalogLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
