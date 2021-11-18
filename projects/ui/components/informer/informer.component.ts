import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { InformersService } from '@epgu/ui/services/informers';
import {
  DataInformer,
  InformerShortInterface,
  TypeDebt,
  WordsOfDebt,
  TypeIcons,
  DebtYaMetricInterface,
  TypeDataOfInformers,
  TypeStatus, HintInterface, RestrictionsState
} from '@epgu/ui/models';
import { DeclinePipe } from '@epgu/ui/pipes';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { LoadService } from '@epgu/ui/services/load';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HealthService } from '@epgu/ui/services/health';

@Component({
  selector: 'lib-informer',
  templateUrl: './informer.component.html',
  styleUrls: ['./informer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformerComponent implements OnInit {

  @Input() public isMainPage = false;
  @Input() public showAllInformers = false;

  public statusInformer: TypeStatus = 'load';
  public dataInformer = new DataInformer();
  public hintResponse: HintInterface;
  public hintText: string;
  public linkHint: string;
  public config = this.loadService.config;
  public feedsDisabled = this.loadService.attributes.XFeedDisabled;

  private debtForYaMetric: DebtYaMetricInterface = {};

  public otherInformerLoading = false;
  public restrictionsState: RestrictionsState;
  public showRestrictionsInformer: boolean;

  constructor(
    private informersService: InformersService,
    private declinePipe: DeclinePipe,
    private yaMetricService: YaMetricService,
    private loadService: LoadService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private healthService: HealthService,
  ) {
  }

  public ngOnInit() {
    this.getInformerShortData();
    if (this.showAllInformers && this.loadService.config.restrictionShow) {
      this.getRestrictions();
    }
  }

  private setData(type: TypeDataOfInformers) {
    this.dataInformer.title = `INFORMER.${type}.TITLE`;
    this.dataInformer.icon = TypeIcons[type];
    this.dataInformer.button = `INFORMER.${type}.BUTTON`;

    this.statusInformer = type.toLowerCase() as TypeStatus;
  }

  private getWord(debtCount: Array<string>): string[] {
    if (debtCount.length === 1) {
      return WordsOfDebt[debtCount[0]].split('|');
    } else {
      return WordsOfDebt.ALL.split('|');
    }
  }

  private setExtraDebtData(res): void {
    // цена со скидкой или просто цена
    this.dataInformer.priceDiscount = res.amount;

    this.dataInformer.button = 'INFORMER.DEBT.BUTTON';
    this.statusInformer = 'debt';
  }

  private getTextToHint(code: string): void {
    if (this.informersService.hints[code] && code === '03') {
      this.hintText = 'Скидка истекает через' + ' ' + this.declinePipe.transform(this.hintResponse.days, ['день', 'дня', 'дней']) + ' ';
    } else if (this.informersService.hints[code] && code === '05') {
      this.hintText = this.informersService.hints[code].text;
    }
  }

  private getInformerShortData() {
    this.healthService.measureStart('edinformerShort');
    this.informersService.getDataInformer().pipe(
      finalize(() => {
        this.cd.detectChanges();
      })
    ).subscribe((response: InformerShortInterface) => {
        if (response?.hint) {
          this.hintResponse = response.hint;
          const hint = Object.keys(this.informersService.hints).find((code) => {
            return this.hintResponse.code === code;
          });
          this.getTextToHint(hint);
        }

        const errorCode = response?.error?.code;
        if (errorCode === 50) {
          this.setData('NO_RIGHTS');
        } else if (response?.result) {
          // есть начисления
          if (response.result.total) {
            const res = response.result;
            // кол-во доков, по которым созданы начисления
            const debtCount = [];
            this.debtForYaMetric.types = {};
            for (const type in TypeDebt) {
              if (res[TypeDebt[type]]) {
                debtCount.push(type);
                // инфа для метрики
                this.debtForYaMetric.types = Object.assign(this.debtForYaMetric.types, {[TypeDebt[type]]: res[TypeDebt[type]].amount});
              }
            }
            this.dataInformer.type = debtCount.length === 1 ? TypeDebt[debtCount[0]] : 'all';
            this.dataInformer.docs = this.declinePipe.transform(res.total, this.getWord(debtCount));
            this.setExtraDebtData(res);
            // инфа для метрики
            this.debtForYaMetric.counter = res.total;
          } else {
            // нет начислений
            if (this.informersService.isAL10()) { // у АЛ10 без начислений мы показывает экран "добавь данные"
              this.setData('AL10');
            } else {
              this.setData('NO_DEBT');
            }
          }
          this.yaMetricService.yaMetricInformerMain('show');
        } else {
          this.setData('ERROR');
          this.yaMetricService.yaMetricInformerMain('show');
        }

        if (errorCode === 0) {
          this.healthService.measureEnd('edinformerShort', 0, { utm_source: 'edinformerShort_ok' });
        } else {
          const errorMessage = response?.error?.message;
          this.healthService.measureEnd('edinformerShort', 1, { BrowserError: errorCode, ErrorMessage: errorMessage, utm_source: 'edinformerShort_no' });
        }
      },
      (error) => {
        this.setData('ERROR');
        this.yaMetricService.yaMetricInformerMain('show');
        this.healthService.measureEnd('edinformerShort', 1, { BrowserError: error.status, ErrorMessage: error.statusText, utm_source: 'edinformerShort_no' });
      });
  }

  public redirectAndSendYaMetric() {
    let type: string;
    switch (this.statusInformer) {
      case 'al10':
        type = 'profileAction';
        break;
      case 'no_debt':
        type = 'historyAction';
        break;
      case 'error':
        type = 'errorAction';
        break;
      case 'debt':
        type = 'action';
        break;
      case 'no_rights':
        type = 'noEnoughRights';
        break;
    }
    this.yaMetricService.yaMetricInformerMain(type, this.debtForYaMetric);
    if (this.loadService.config.viewType === 'PORTAL') {
      this.router.navigate(['/pay']);
    } else {
      location.href = `${this.loadService.config.betaUrl}pay`;
    }
  }

  public redirectToQuittance() {
    if (this.loadService.config.viewType === 'PORTAL') {
      this.router.navigate(['/pay/quittance']);
    } else {
      location.href = `${this.loadService.config.betaUrl}pay/quittance`;
    }
  }

  public redirectToRestrictions() {
    location.href = `${this.loadService.config.lkUrl}restrictions`;
  }

  private getRestrictions() {
    this.otherInformerLoading = true;
    this.informersService.getRestrictionsInfo().subscribe(state => {
      this.restrictionsState = state;
      this.showRestrictionsInformer = state !== 'NOT_EMBEDDED';
      this.otherInformerLoading = false;
      this.cd.detectChanges();
    });
  }
}
