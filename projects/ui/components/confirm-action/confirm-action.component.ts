import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Modal } from '@epgu/ui/models';

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
  public checkboxConfirm: boolean;
  public isChecked: boolean;
  public image: string;
  public closeButton = true;
  public imagesPosition: 'left' | 'above' = 'left';
  public maxWidth: number;
  public popupClassModifier: string;
  public buttons: {
    title: string,
    type: 'anchor' | undefined,
    color: string,
    loader?: boolean,
    disabled?: boolean,
    handler: (d?) => {}
  }[];
  public spaceButtonsBetween: boolean;

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
