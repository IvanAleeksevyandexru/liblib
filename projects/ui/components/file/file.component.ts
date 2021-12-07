import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { File } from '@epgu/ui/models';

@Component({
  selector: 'lib-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComponent implements OnInit {

  @Input() public file: File;
  @Input() public countOutside: number;
  @Input() public allBlockClick = false;

  constructor() { }

  public ngOnInit(): void {
  }

  public onClick(actions) {
    if (this.allBlockClick && actions?.length) {
      actions.forEach(action => {
        if (typeof action.handler === 'function') {
          action.handler();
        }
      });
    }
  }

}
