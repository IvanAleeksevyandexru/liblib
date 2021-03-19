import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundLoaderComponent } from './round-loader.component';

describe('RoundLoaderComponent', () => {
  let component: RoundLoaderComponent;
  let fixture: ComponentFixture<RoundLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
