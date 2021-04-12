import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionCasesComponent } from './region-cases.component';

describe('RegionCasesComponent', () => {
  let component: RegionCasesComponent;
  let fixture: ComponentFixture<RegionCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionCasesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
