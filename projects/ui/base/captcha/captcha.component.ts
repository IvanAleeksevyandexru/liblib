import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { LoadAsyncStaticService } from '@epgu/ui/services/load-async-static';
import { HttpClient } from '@angular/common/http';

declare var CaptchaPlugin: any;

@Component({
  selector: 'lib-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss']
})
export class CaptchaComponent implements OnInit {
  @Output() public resolve = new EventEmitter<any>();
  @Output() public token = new EventEmitter<string>();
  @Output() public loaded = new EventEmitter<any>();

  public captcha: any;
  public errorCaptcha = false;

  constructor(private loadService: LoadService,
              private http: HttpClient,
              private loadAsyncStaticService: LoadAsyncStaticService) {
  }

  public ngOnInit() {
    this.initCaptcha();
  }

  private initCaptcha(): void {
    const captchaPluginUrl = this.loadService.config.esiaUrl + this.loadService.config.captchaPluginUrl;
    this.loadAsyncStaticService.loadScriptAsync(captchaPluginUrl, true, () => {
      this.captcha = new CaptchaPlugin({
        widgetUri: this.loadService.config.esiaUrl
      });
      this.captcha.init('captcha-plugin', (response) => {
        this.loaded.emit(response);
      });
    });
  }

  public reloadCaptcha(): void {
    this.captcha.result = false;
    this.captcha.reload();
  }

  public checkCaptcha(): void {
    this.errorCaptcha = false;

    if (this.captcha.result) {
      this.resolve.emit(this.captcha.result);
    } else {
      this.captcha.check((token: string) => {
        const captchaServiceUrl = this.loadService.config.captchaServiceUrl;
        const esiaUrl = this.loadService.config.esiaUrl;

        this.http.get(`${esiaUrl}${captchaServiceUrl}?verify_token=${token}`).subscribe((response: {result: boolean}) => {
          this.resolve.emit(response && response.result ? response.result : null);
          this.captcha.result = response.result;
        }, (error) => {
          this.errorCaptcha = true;
          this.captcha.reload();
          this.resolve.emit(error && error.result ? error.result : null);
        });
      });
    }
  }

  public getToken(): void {
    this.captcha.check((token: string) => {
      this.token.emit(token);
    });
  }
}
