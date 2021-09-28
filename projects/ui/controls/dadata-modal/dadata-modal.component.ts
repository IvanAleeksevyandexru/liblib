import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-dadata-modal',
  templateUrl: './dadata-modal.component.html',
  styleUrls: ['./dadata-modal.component.scss']
})
export class DadataModalComponent implements OnInit {

  public successAddress: string;
  public currentAddress: string;

  public saveHandler: () => {};
  public returnHandler: () => {};

  public destroy: () => {};

  constructor() {
  }

  public ngOnInit() {
  }

  public onCancel(e: Event): void {
    e.stopPropagation();
    this.destroy();
  }

  public returnToEdit(): void {
    this.returnHandler();
    this.destroy();
  }

  public confirmAndClose(): void {
    this.saveHandler();
    this.destroy();
  }

}
