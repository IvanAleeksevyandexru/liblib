import { Component, HostListener, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from '@epgu/ui/services/modal';

@Component({
  selector: 'lib-modal-placeholder',
  template: `
    <div #modalplaceholder></div>
    <div id="modal-overlay"></div>`
})

export class ModalPlaceholderComponent implements OnInit {
  @ViewChild('modalplaceholder', { read: ViewContainerRef, static: true }) private viewContainerRef;

  @HostListener('window:resize', []) public onResize() {
    this.modalService.checkForScroll();
  }

  constructor(private modalService: ModalService, private injector: Injector) {
  }

  public ngOnInit() {
    this.modalService.registerViewContainerRef(this.viewContainerRef);
    this.modalService.registerInjector(this.injector);
  }

}
