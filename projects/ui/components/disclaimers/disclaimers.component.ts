import { Component, Input, OnInit } from '@angular/core';
import { DisclaimerService } from '@epgu/ui/services/disclaimers';
import { CookieService } from '@epgu/ui/services/cookie';
import { LoadService } from '@epgu/ui/services/load';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Disclaimer, DisclaimerInterface } from '@epgu/ui/models';
import { User } from '@epgu/ui/models/user';

@Component({
  selector: 'lib-disclaimers',
  templateUrl: './disclaimers.component.html',
  styleUrls: ['./disclaimers.component.scss']
})
export class DisclaimerComponent implements OnInit {

  @Input() private isPortal  = false;
  @Input() public isMainPage = false;

  public disclaimerPack: [Disclaimer[], Disclaimer[], Disclaimer[]] = [[], [], []];
  private user = this.loadService.user as User;
  private config = this.loadService.config;
  private region = this.loadService.attributes.selectedRegion;
  private havePriority = 0; // если есть хоть один приоритетный - прячем все. Как только все приоритетные закрыты, показываем остальные

  constructor(
    private disclaimerService: DisclaimerService,
    private cookieService: CookieService,
    private loadService: LoadService,
    private fb: FormBuilder
  ) {
  }

  public ngOnInit() {

    if (this.isPortal) {
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
      const mainDisclaimerPosition = this.isPortal ? 1 : 0;
      this.disclaimerPack[mainDisclaimerPosition] = newData;
      this.checkDisclaimers(this.disclaimerPack[mainDisclaimerPosition]);
    });

    // Получаем доп.дисклеймеры
    this.disclaimerService.disclaimersAdditional.subscribe((data: DisclaimerInterface[]) => {
      const additionalDisclaimerPosition = this.isPortal ? 2 : 1;
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

  public showDisclaimer(disclaimer: Disclaimer): boolean {
    return (this.havePriority && disclaimer.isPriority && disclaimer.show) || (!this.havePriority && disclaimer.show);
  }

}
