import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileExt'
})
export class FileExtPipe implements PipeTransform {

  public transform(fileName: string): string {
    const existedExt = ['doc', 'jpeg', 'jpg', 'mp3', 'xml', 'mp4', 'pdf', 'png', 'ppt', 'pptx', 'rtf', 'tif', 'tiff', 'txt', 'wav', 'xls', 'xlsx', 'zip', 'html', 'txt'];
    const extDotPos = fileName.lastIndexOf('.');
    if (extDotPos !== -1) {
      const ext = fileName.substr(extDotPos + 1, fileName.length - extDotPos - 1).toLowerCase();
      if (existedExt.indexOf(ext) !== -1) {
        return ext;
      }
    }
    return 'file';
  }

}
