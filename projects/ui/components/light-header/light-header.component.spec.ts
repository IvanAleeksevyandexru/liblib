import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { MockComponent } from '../../mocks/mock.component';
import { LightHeaderComponent } from './light-header.component';

describe('LightHeaderComponent', () => {
  let component: LightHeaderComponent;
  let fixture: ComponentFixture<LightHeaderComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LightHeaderComponent,
        MockComponent({ selector: 'logo' })
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightHeaderComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
