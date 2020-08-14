import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateStore, TranslateLoader, TranslateService, TranslateFakeCompiler,
  TranslateDefaultParser, FakeMissingTranslationHandler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoadService } from '../load/load.service';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class LibTranslateService extends TranslateService {

  constructor(httpClient: HttpClient, @Optional() loadService?: LoadService) {
    const store = new TranslateStore();
    const compiler = new TranslateFakeCompiler();
    const parser = new TranslateDefaultParser();
    const missingHandler = new FakeMissingTranslationHandler();
    const assetsLocation = loadService && loadService.isInitializationStarted() ?
      `${loadService.config.staticDomain}lib-assets/i18n/` : ConstantsService.ASSETS_DEFAULT_LOCATION;
    const loader: TranslateLoader = new TranslateHttpLoader(httpClient, assetsLocation, '.json');
    super(store, loader, compiler, parser, missingHandler, true, true);
    this.addLangs(['ru']);
    this.setDefaultLang('ru');
  }

  public followLanguageChange(appTranslateService: TranslateService) {
    appTranslateService.onLangChange.subscribe((info) => this.use(info.lang));
    appTranslateService.onDefaultLangChange.subscribe((info) => this.setDefaultLang(info.lang));
  }

}
