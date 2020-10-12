import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateStore, TranslateLoader, TranslateService, TranslateFakeCompiler,
  TranslateDefaultParser, FakeMissingTranslationHandler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoadService } from '../load/load.service';
import { HelperService } from '../helper/helper.service';
import { ConstantsService } from '../constants.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LibTranslateService extends TranslateService {

  constructor(httpClient: HttpClient, @Optional() loadService?: LoadService) {
    const store = new TranslateStore();
    const compiler = new TranslateFakeCompiler();
    const parser = new TranslateDefaultParser();
    const missingHandler = new FakeMissingTranslationHandler();
    let libAssetsLocation = '/' + ConstantsService.ASSETS_DEFAULT_PATH;
    const config = loadService && loadService.config;
    if (config && config.staticDomainLibAssetsPath) {
      libAssetsLocation = config.staticDomainLibAssetsPath;
    } else if (config && config.staticDomain) {
      libAssetsLocation = config.staticDomain + ConstantsService.ASSETS_DEFAULT_PATH;
    }
    const assetsLocationAndPath = libAssetsLocation + ConstantsService.TRANSLATIONS_PATH;
    const loader: TranslateLoader = new TranslateHttpLoader(httpClient, assetsLocationAndPath, '.json');
    super(store, loader, compiler, parser, missingHandler, true, true, true, 'ru');
    this.addLangs(['ru']);
    this.setDefaultLang('ru');
  }

  public static pluralizeTranslate(translate: TranslateService, quantity: number, pluralizeNouns: Array<string>): Observable<string> {
    const observables = pluralizeNouns.map((pluralizeForm: string) => translate.get(pluralizeForm));
    return forkJoin(observables).pipe(map((translations: Array<string>) => {
      return HelperService.pluralize(quantity, translations);
    }));
  }

  public followLanguageChange(appTranslateService: TranslateService) {
    appTranslateService.onLangChange.subscribe((info) => this.use(info.lang));
    appTranslateService.onDefaultLangChange.subscribe((info) => this.setDefaultLang(info.lang));
  }

}
