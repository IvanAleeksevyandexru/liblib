import { Component, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { Router } from '@angular/router';
import { CookieService } from '@epgu/ui/services/cookie';
import { TranslateService } from '@ngx-translate/core';
import { GosbarService } from '@epgu/ui/services/gosbar';

@Component({
  selector: 'lib-lang-warn-modal',
  templateUrl: './lang-warn-modal.component.html',
  styleUrls: ['./lang-warn-modal.component.scss']
})
export class LangWarnModalComponent implements OnInit {

  public destroy: () => {};
  public config;
  public url: string;
  public isAbs: boolean;

  constructor(
    private loadService: LoadService,
    private router: Router,
    private cookieService: CookieService,
    private translate: TranslateService,
    private gosbarService: GosbarService
  ) { }

  public ngOnInit() {
    this.config = this.loadService.config;
  }

  public onCancel(): void {
    this.destroy();
  }

  public continue(): void {
    if (this.isAbs) {
      this.cookieService.set('userSelectedLanguage', 'ru');
      location.href = this.url;
    } else {
      this.destroy();
      this.translate.use('ru');
      this.gosbarService.updateGosbar('ru');
      this.router.navigate([this.url]);
    }
  }

}
