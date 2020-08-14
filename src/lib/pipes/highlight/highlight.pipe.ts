import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  public transform(value: any, args: any): any {
    if (!args) {
      return value;
    }

    const re = new RegExp(args, 'gi');
    const match = value.match(re);

    if (!match) {
      return value;
    }

    return this.sanitizer.bypassSecurityTrustHtml(value.replace(new RegExp(args, 'gi'), '<span class="highlighted">$&</span>'));
  }
}
