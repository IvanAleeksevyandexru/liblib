import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { File } from '../../models/file-link';

@Component({
  selector: 'lib-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComponent implements OnInit {

  @Input() public file: File;

  constructor() { }

  public ngOnInit(): void {
  }

}
