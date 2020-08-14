import { Component, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { Router } from '@angular/router';
import { CookieService } from '../../services/cookie/cookie.service';
import { TranslateService } from '@ngx-translate/core';
import { GosbarService } from '../../services/gosbar/gosbar.service';

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
