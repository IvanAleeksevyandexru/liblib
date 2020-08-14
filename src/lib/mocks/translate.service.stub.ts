import { EMPTY, of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import * as translationImport from '../../assets/i18n/ru.json';
const defaultsKey = 'default';
const translation = translationImport[defaultsKey];

export class TranslateServiceStub {
  public translations = [];
  public onTranslationChange = new EventEmitter();
  public onDefaultLangChange = new EventEmitter();
  public onLangChange = new EventEmitter();

  public addLangs() {}

  public followLanguageChange() {}

  public setDefaultLang() {}

  public getBrowserLang(): string {
    return 'ru-RU';
  }

  public getTranslation(): any {
    return EMPTY;
  }

  public use() {}

  public get(translationKey: any): any {
    const get = (translationTree: any, key: string) => {
      if (key.includes('.')) {
        return get((translationTree || {})[key.substring(0, key.indexOf('.'))], key.substring(key.indexOf('.') + 1));
      } else {
        return (translationTree || {})[key] || key;
      }
    };
    return translationKey ? of(get(translation, translationKey)) : of(translationKey);
  }

  public stream(key: any, interpolateParams: any) {
    return this.get(key);
  }

}

export class LibTranslateServiceStub extends TranslateServiceStub {
}
