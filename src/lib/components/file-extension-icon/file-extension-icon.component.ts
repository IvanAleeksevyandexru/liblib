import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-file-extension-icon',
  templateUrl: './file-extension-icon.component.html',
  styleUrls: ['./file-extension-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionIconComponent implements OnInit {

  public extensionName: string;
  @Input() public set extension(str) {
    if (str) {
      this.extensionName = this.getShotName(str.toUpperCase());
    } else {
      this.extensionName = 'x_x';
    }
  }

  constructor() { }

  public ngOnInit(): void {
  }

  private getShotName(extension) {
    switch (extension) {
      case 'DOCX':
        return 'DOC';
      case 'PPTX':
        return 'PPT';
      case 'XLSX':
        return 'XLS';
      case 'TIFF':
        return 'TIF';
      case 'JPEG':
        return 'JPG';
      default:
        return extension;
    }
  }
}
