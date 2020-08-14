import { Component, OnInit } from '@angular/core';
import { Modal } from '../../../models/modal-container';

@Component({
  templateUrl: './eds-loader.component.html',
  styleUrls: ['./eds-loader.component.scss']
})
@Modal()
export class EdsLoaderComponent implements OnInit {

  public destroy: () => {};

  constructor() { }

  public ngOnInit() {
  }

  public onCancel(): void {
    this.destroy();
  }

}
