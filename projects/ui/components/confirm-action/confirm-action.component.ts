import { Component, HostListener, OnInit } from '@angular/core';
import { IConfirmActionModal, Modal, ModalButtonType } from '@epgu/ui/models';

@Component({
  selector: 'lib-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss']
})

@Modal()
export class ConfirmActionComponent implements OnInit, IConfirmActionModal {
  public title: string;
  public subtitle: string;
  public description: string;
  public value: any;
  public checkboxConfirm: boolean;
  public isChecked: boolean;
  public image: string;
  public closeButton = true;
  public imagesPosition: 'left' | 'above' = 'left';
  public maxWidth: number;
  public popupClassModifier: string;
  public buttons: ModalButtonType[];
  public spaceButtonsBetween: boolean;
  public buttonsCenter: boolean;

  public destroy: () => {};

  public cancelHandler?: () => {};

  @HostListener('document:keydown', ['$event']) public onKeydownComponent(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.cancelHandler?.();
      this.destroy();
    }
  }

  constructor() { }

  public ngOnInit() {
  }

  public onConfirmChange(): void {
    this.buttons.forEach((button) => {
      if (button.hasOwnProperty('disabled')) {
        button.disabled = !(this.isChecked = !this.isChecked);
      }
    });
  }

  public onCancel(): void {
    this.cancelHandler?.();
    this.destroy();
  }

}
