import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Modal } from '../../models/modal-container';

@Component({
  selector: 'lib-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss']
})

@Modal()

export class ConfirmActionComponent implements OnInit {
  public title: string;
  public subtitle: string;
  public description: string;
  public value: any;
  public image: string;
  public widthAuto = false;
  public maxWidth: number;
  public buttons: {
    title: string,
    color: string,
    loader?: boolean,
    handler: (d?) => {}
  }[];

  public destroy: () => {};

  @HostListener('document:keydown', ['$event']) public onKeydownComponent(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.destroy();
    }
  }

  constructor() { }

  public ngOnInit() { }

  public onCancel(): void {
    this.destroy();
  }

}
