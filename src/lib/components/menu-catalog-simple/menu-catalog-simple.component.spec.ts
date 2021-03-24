import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCatalogComponent } from './menu-catalog.component';

describe('MenuCatalogComponent', () => {
  let component: MenuCatalogComponent;
  let fixture: ComponentFixture<MenuCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
