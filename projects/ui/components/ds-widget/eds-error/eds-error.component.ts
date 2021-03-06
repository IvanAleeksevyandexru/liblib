import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Modal } from '@epgu/ui/models';
import { LoadService } from '@epgu/ui/services/load';


@Component({
  templateUrl: './eds-error.component.html',
  styleUrls: ['./eds-error.component.scss'],
  encapsulation: ViewEncapsulation.None
})
@Modal()
export class EdsErrorComponent implements OnInit {
  public type: 'not_found' | 'old_version';

  public destroy: () => {};

  constructor(public loadService: LoadService) { }

  public ngOnInit() {
  }

  public onCancel(): void {
    this.destroy();
  }

}
