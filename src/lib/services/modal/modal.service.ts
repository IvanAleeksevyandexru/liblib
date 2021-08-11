import { ComponentFactory, ComponentFactoryResolver, Injectable, Injector, NgModuleRef, Type, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private vcRef: ViewContainerRef;
  private injector: Injector;
  private cRefObj = {};
  private activeInstances = 0;
  private isManyModals = false;

  constructor(private cfr: ComponentFactoryResolver) {
  }

  public popupInject(modalComponent: Type<any>, moduleRef?: NgModuleRef<any>, modalRules?, isManyModals: boolean = false): any {
    this.isManyModals = isManyModals;
    if (this.activeInstances > 0 && !isManyModals) {
      return null;
    }
    const cfr = moduleRef ? moduleRef.componentFactoryResolver : this.cfr;
    const modal = this.createFromFactory(cfr.resolveComponentFactory(modalComponent), modalRules);

    if (modal.location.nativeElement.querySelector('.popup-wrapper')) {
      document.documentElement.classList.add('modal-opened');
      setTimeout(() => {
        this.checkForScroll();
      });

      if (!modalRules?.disableOutsideClickClosing) {
        const elem = document.getElementsByClassName('popup-wrapper')[0];
        if (elem) {
          elem.addEventListener('click', ((ev: any) => {
            if (ev.target.classList.contains('popup-wrapper')) {
              if (typeof modalRules?.outsideClick === 'function') {
                modalRules?.outsideClick();
              }
              modal.instance.cancelHandler?.();
              modal.instance.destroy();
              elem.removeEventListener('click', null);
            }
          }));
        }
      }
    }
    // ref.location.nativeElement.querySelector('.overlay').classList.add('show');
    return modal;
  }

  public registerViewContainerRef(vcRef: ViewContainerRef): void {
    this.vcRef = vcRef;
  }

  public checkForScroll() {
    const popup = document.getElementsByClassName('popup')[0];
    const wrapper = document.getElementsByClassName('popup-wrapper')[0];

    if (!popup || !wrapper) { return; }

    if (popup.clientHeight >= window.innerHeight) {
      wrapper.classList.add('popup-wrapper-scroll');
      popup.classList.add('popup-scroll');
    } else {
      wrapper.classList.remove('popup-wrapper-scroll');
      popup.classList.remove('popup-scroll');
    }
  }

  public registerInjector(injector: Injector): void {
    this.injector = injector;
  }

  public destroyForm(): void {
    if (this.cRefObj && this.cRefObj[1] && this.cRefObj[1].instance) {
      this.cRefObj[1].instance.destroy();
    }
  }

  private createFromFactory<T>(componentFactory: ComponentFactory<T>, parameters?: object): any {
    const childInjector = Injector.create({
      providers: [],
      parent: this.injector
    });
    const componentRef = this.vcRef.createComponent(componentFactory, 0, childInjector);
    const overlay = document.getElementById('modal-overlay');
    const destroyKey = 'destroy';
    overlay.classList.add('modal-overlay');
    Object.assign(componentRef.instance, parameters);
    this.activeInstances++;
    this.cRefObj[this.activeInstances] = componentRef;

    componentRef.instance[destroyKey] = () => {
      if (this.activeInstances === 1) {
        overlay.classList.remove('modal-overlay');
      }
      document.documentElement.classList.remove('modal-opened');
      componentRef.destroy();
      delete this.cRefObj[this.activeInstances];
      this.activeInstances--;
    };
    return componentRef;
  }
}
