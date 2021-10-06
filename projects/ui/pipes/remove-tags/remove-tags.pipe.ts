import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeTags'
})
export class RemoveTagsPipe implements PipeTransform {

  public transform(text: string, limit: number = 150): string {
    if ( !text) {
      return text;
    }
    let replacesText =  text.replace(/<\/?[^>]+>/g, ' ');
    if (replacesText.length > limit) {
      if (replacesText.substr(limit + 1, 1) !== ' ') {
        const pos =  replacesText.lastIndexOf(' ', limit);
        replacesText =  ((pos !== 1) ? replacesText.substring(0, pos) : replacesText.substring(0, limit));
      } else {
        replacesText = replacesText.substring(0, limit);
      }
      return replacesText + '...';
    }
    return replacesText.substring(0, limit);
  }

}
