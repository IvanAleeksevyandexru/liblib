import { Component, HostListener, OnInit } from '@angular/core';
import { Modal } from '../../../models/modal-container';
import { EdsItem } from '../../../models/ds.plugin.model';

@Component({
  templateUrl: './eds-pin.component.html',
  styleUrls: ['./eds-pin.component.scss']
})
@Modal()
export class EdsPinComponent implements OnInit {

  public item: EdsItem;
  public title: string;
  public pin = '';
  public error;
  public submit: (pin: string) => {};

  public destroy: () => {};

  @HostListener('document:keydown', ['$event'])
  public onKeydownComponent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

  constructor() { }

  public ngOnInit() {
  }

  public onCancel(): void {
    this.destroy();
  }

  public onSubmit(): void {
    this.submit(this.pin);
    this.destroy();
  }

}
