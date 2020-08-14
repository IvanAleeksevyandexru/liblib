import { Pipe, PipeTransform, Injectable, ChangeDetectorRef, Optional } from '@angular/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'libTranslate', pure: false
})
export class LibTranslatePipe extends TranslatePipe implements PipeTransform {

  constructor(translate: LibTranslateService, changeDetection: ChangeDetectorRef) {
    super(translate, changeDetection);
  }
}

@Injectable()
@Pipe({
  name: 'appTranslate', pure: false
})
export class AppTranslatePipe extends TranslatePipe implements PipeTransform {

  protected service: TranslateService;

  constructor(@Optional() translate: TranslateService, changeDetection: ChangeDetectorRef) {
    super(translate, changeDetection);
    this.service = translate;
  }

  public transform(...args: any[]): any {
    if (!this.service) {
      return args.length ? args[0] : '???';
    } else {
      return super.transform.apply(this, args);
    }
  }
}

