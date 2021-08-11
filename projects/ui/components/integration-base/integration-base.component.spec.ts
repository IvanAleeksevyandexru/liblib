import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationBaseComponent } from './integration-base.component';

describe('IntegrationBaseComponent', () => {
  let component: IntegrationBaseComponent;
  let fixture: ComponentFixture<IntegrationBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
