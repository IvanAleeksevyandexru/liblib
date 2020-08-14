import { Component, OnInit } from '@angular/core';
import { PopupData } from '../../models/mail-delivery';

@Component({
  selector: 'lib-address-save-modal',
  templateUrl: './address-save-modal.component.html',
  styleUrls: ['./address-save-modal.component.scss']
})
export class AddressSaveModalComponent implements OnInit {

  public data: PopupData;
  public closeCallback: (withSave: boolean) => {};

  public destroy: () => {};

  constructor() {
  }

  public updateAddress() {
    this.closeCallback(true);
    this.destroy();
  }

  public ngOnInit() {
  }

  public onCancel(): void {
    this.closeCallback(false);
    this.destroy();
  }
}
