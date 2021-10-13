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

  constructor() { }

  public ngOnInit(): void {
  }

}
