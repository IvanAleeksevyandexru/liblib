import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'lib-file-extension-icon',
  templateUrl: './file-extension-icon.component.html',
  styleUrls: ['./file-extension-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileExtensionIconComponent {
  public extensionName: string;
  @Input() public set extension(str: string) {
    if (str) {
      this.extensionName = this.getShortName(str.toUpperCase());
    } else {
      this.extensionName = 'x_x';
    }
  }

  private getShortName(extension: string) {
    switch (extension) {
      case 'DOCX':
        return 'DOC';
      case 'PPTX':
        return 'PPT';
      case 'APPLICATION/VND.MS-EXCEL':
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
