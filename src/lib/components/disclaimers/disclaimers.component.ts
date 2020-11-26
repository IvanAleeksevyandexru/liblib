import { Component, Input, OnInit } from '@angular/core';
import { DisclaimerService } from '../../services/disclaimers/disclaimers.service';
import { CookieService } from '../../services/cookie/cookie.service';
import { LoadService } from '../../services/load/load.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Disclaimer, DisclaimerInterface } from '../../models/disclaimer.model';

@Component({
  selector: 'lib-disclaimers',
  templateUrl: './disclaimers.component.html',
  styleUrls: ['./disclaimers.component.scss']
})
export class DisclaimerComponent implements OnInit {

  @Input() isPortal = false;
  @Input() isMainPage = false;

  public disclaimerPack: [Disclaimer[], Disclaimer[], Disclaimer[]] = [[], [], []];
  private user = this.loadService.user;
  private config = this.loadService.config;
  public emailsFormGroup: FormGroup[] = [];
  private region = this.loadService.attributes.selectedRegion;
  private havePriority = 0; // если есть хоть один приоритетный - прячем все. Как только все приоритетные закрыты, показываем остальные

  constructor(private disclaimerService: DisclaimerService,
              private cookieService: CookieService,
              private loadService: LoadService,
              private fb: FormBuilder) {
  }

  public ngOnInit() {

    if(this.isPortal) {
      this.disclaimerService.disclaimersMainPage.subscribe((data: DisclaimerInterface[]) => {
        const newData: Disclaimer[] = data.map((el: DisclaimerInterface): Disclaimer => {
          return new Disclaimer(el);
        });
        this.disclaimerPack[0] = newData;
        this.checkDisclaimers(this.disclaimerPack[0]);
      });
    }

    // Получаем общие дисклеймеры. Они должны быть всегда первыми
    this.disclaimerService.disclaimersMain.subscribe((data: DisclaimerInterface[]) => {
      const newData: Disclaimer[] = data.map((el: DisclaimerInterface): Disclaimer => {
        return new Disclaimer(el);
      });
      let mainDisclaimerPosition = this.isPortal ? 1: 0;
      this.disclaimerPack[mainDisclaimerPosition] = newData;
      this.checkDisclaimers(this.disclaimerPack[mainDisclaimerPosition]);
    });

    // Получаем доп.дисклеймеры
    this.disclaimerService.disclaimersAdditional.subscribe((data: DisclaimerInterface[]) => {
      let additionalDisclaimerPosition = this.isPortal ? 2: 1;
      if (data === null) { // при очистке срабатывает
        this.disclaimerPack[additionalDisclaimerPosition] = [];
      } else if (data.length) {
        data.forEach((elem: DisclaimerInterface) => {
          this.disclaimerPack[additionalDisclaimerPosition].push(new Disclaimer(elem));
        });
        this.checkDisclaimers(this.disclaimerPack[additionalDisclaimerPosition]);
      }
    });

  }

  private checkDisclaimers(data: Disclaimer[]): void {
    data.forEach((elem: Disclaimer) => {
      // проверяем не был ли закрыт пользователем дисклеймер ранее
      elem.show = !this.cookieService.get(`disclaimerClosed-${elem.id}`);
      if (elem.show) {
        // проверяем есть ли приоритетные дисклеймеры
        if (elem.isPriority) {
          this.havePriority++;
        }
        // ставим подписку при необходимости
        if (elem.notificationEnabled) {
          elem.readOnly = false;
          const email = (this.user.email && this.user.userType === 'P' && this.user.emailVerified) ? this.user.email : '';
          this.emailsFormGroup[elem.id] = this.fb.group({
            email: [email, Validators.compose([
              Validators.required,
              Validators.pattern(/^\S+@\S+$/),
              Validators.maxLength(255)
            ])]
          });
          if (email) {
            elem.loading = true;
            elem.readOnly = true; // чувак не может изменить почту т.к. она верифицирована
            this.disclaimerService.checkSubscriptionDisclaimers(elem.id, email).subscribe(() => {
                elem.loading = false;
              },
              (error) => {
                elem.loading = false;
                if (error.status === 409) {
                  elem.notificationEnabled = false;
                  elem.noticeEmail = email;
                  elem.noticeText = 'DISCLAIMER.ALREADY_SUBSCRIBE';
                } else {
                  elem.noticeText = 'DISCLAIMER.ERROR';
                }
              }
            );
          }
        }
      }
    });
  }

  public closeDisclaimer(id: number, priority: boolean) {
    this.cookieService.set(`disclaimerClosed-${id}`, id, 24 * 365);
    document.getElementById(`disclaimer_${id}`).classList.add('hide');
    if (priority) {
      this.havePriority--;
    }
    if (!this.havePriority && priority) { // не будет вызываться при закрытии обычных дисклеймеров
      this.checkDisclaimers(this.disclaimerPack[0]);
      this.checkDisclaimers(this.disclaimerPack[1]);
      this.checkDisclaimers(this.disclaimerPack[2]);
    }
  }

  public showSubscription($event: MouseEvent | TouchEvent) {
    ($event.target as HTMLElement).nextElementSibling.classList.toggle('hide');
  }

  public sendSubscription(elem: Disclaimer) {
    elem.loading = true;
    const mainPagesUrls = ['/entrepreneur', '/legal-entity', '/', '/foreign-citizen', 'lk'];
    const mnemonics = ['PGU', 'EPGU_V3', 'EPGU_V3_DESKTOP', 'EPGU_V3_MOBILE', 'SMU_MAIN'];
    const email = this.emailsFormGroup[elem.id].get('email').value;
    let url;
    if (elem.mnemonic && mnemonics.indexOf(elem.mnemonic) !== -1) {
      url = (mainPagesUrls.indexOf(location.pathname) !== -1 && !this.config.isLk) ? location.href : this.config.betaUrl;
    } else {
      url = location.href;
    }
    const data = {id: elem.id, email, url};
    this.disclaimerService.sendSubscriptionDisclaimers(data).subscribe((res) => {
        elem.notificationEnabled = false;
        elem.noticeEmail = email;
        elem.noticeText = 'DISCLAIMER.SUCCESS';
        elem.loading = false;
      },
      (error) => {
        if (error.status === 409) {
          elem.notificationEnabled = false;
          elem.noticeEmail = email;
          elem.noticeText = 'DISCLAIMER.ALREADY_SUBSCRIBE';
        } else {
          elem.noticeText = 'DISCLAIMER.ERROR';
        }
        elem.loading = false;
      });
  }

  public showDisclaimer(disclaimer: Disclaimer): boolean {
    return (this.havePriority && disclaimer.isPriority && disclaimer.show) || (!this.havePriority && disclaimer.show);
  }

}
