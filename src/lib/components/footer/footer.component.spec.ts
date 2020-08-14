import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from '../../mocks/mock.component';
import { FooterComponent } from './footer.component';
import { ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { ComponentFactoryResolverStub } from '../../mocks/component-factory-resolver.stub';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FooterComponent,
        MockComponent({ selector: 'lib-footer-cms' }),
        MockComponent({ selector: 'lib-footer-copyright' })
      ],
      providers: [
        { provide: ComponentFactoryResolver, useClass: ComponentFactoryResolverStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const viewContainerRef = 'viewContainerRef';

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    component[viewContainerRef] = {
      createComponent: () => {}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
