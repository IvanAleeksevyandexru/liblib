import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from '../../services/cookie/cookie.service';

@Component({
  selector: 'lib-language-select',
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.scss']
})
export class LanguageSelectComponent implements OnInit {

  public languages: string[] = this.loadService.config.allowedLangs;
  public activeItem: string;
  public staticDomainLibAssetsPath = this.loadService.config.staticDomainLibAssetsPath;
  public showList = false;

  @Output() public openChoice = new EventEmitter<boolean>(false);

  constructor(
    private loadService: LoadService,
    private translate: TranslateService,
    private cookieService: CookieService,
  ) { }

  public ngOnInit(): void {
    const curLang = this.translate.currentLang;
    this.activeItem = this.languages.includes(curLang) ? curLang : this.languages[0];
  }

  public toggleList(flag?: boolean) {
    if (flag === undefined) {
      this.showList = !this.showList;
    } else {
      this.showList = flag;
    }
    this.openChoice.emit(this.showList);
  }

  public selectLang(lang: string) {
    if (this.activeItem !== lang) {
      this.activeItem = lang;
      this.translate.use(lang);
      this.cookieService.set('userSelectedLanguage', lang);
    }
    this.toggleList(false);
  }
}
