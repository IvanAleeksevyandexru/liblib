import { Component, OnInit } from '@angular/core';
import { InformersService } from '../../../services/informers/informers.service';
import { DataInformer, InformerShortInterface, TypeDebt, WordsOfDebt, TypeIcons, DebtYaMetricInterface } from '../../../models/informer.model';
import { DeclinePipe } from '../../../pipes/decline/decline.pipe';
import { YaMetricService } from '../../../services/ya-metric/ya-metric.service';
import { LoadService } from '../../../services/load/load.service';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-informer-main',
  templateUrl: './informer-main.component.html',
  styleUrls: ['./informer-main.component.scss']
})
export class InformerMainComponent implements OnInit {

  public statusInformer: 'error' | 'load' | 'debt' | 'no-debt' | 'al10' = 'load';
  public dataInformer = new DataInformer();

  private links = {
    al10: `/profile/personal`,
    'no-debt': `${this.loadService.config.betaUrl}pay?tab=toPay`,
    error: `${this.loadService.config.betaUrl}pay?tab=toPay`,
    debt: `${this.loadService.config.betaUrl}pay?tab=toPay`
  };
  private debtForYaMetric: DebtYaMetricInterface = {};

  constructor(private informersService: InformersService,
              private declinePipe: DeclinePipe,
              private yaMetricService: YaMetricService,
              private loadService: LoadService,
              private router: Router,
  ) {
  }

  public ngOnInit() {
    this.getInformerShortData();
  }

  private setData(type: 'ERROR' | 'NO_DEBT' | 'AL10') {
    this.dataInformer.title = `INFORMER_MAIN.${type}.TITLE`;
    this.dataInformer.icon = TypeIcons[type];
    this.dataInformer.button = `INFORMER_MAIN.${type}.BUTTON`;
  }

  private getWorld(debtCount) {
    if (debtCount.length === 1) {
      return WordsOfDebt[debtCount[0]].split('|');
    } else {
      return WordsOfDebt.ALL.split('|');
    }
  }

  private getInformerShortData() {
    this.informersService.getDataInformer().subscribe(
      (response: InformerShortInterface) => {
        if (response.result) {
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
            this.dataInformer.docs = this.declinePipe.transform(res.total, this.getWorld(debtCount));
            // цена без скидки
            if (res.originalAmount && res.originalAmount !== 0) {
              this.dataInformer.price = res.originalAmount;
            }
            // цена со скидкой или просто цена
            this.dataInformer.priceDiscount = res.amount;
            // инфа для метрики
            this.debtForYaMetric.counter = res.total;

            this.dataInformer.button = 'INFORMER_MAIN.DEBT.BUTTON';
            this.statusInformer = 'debt';
          } else {
            // нет начислений
            if (this.informersService.isAL10()) { // у АЛ10 без начислений мы показывает экран "добавь данные"
              this.setData('AL10');
              this.statusInformer = 'al10';
            } else {
              this.setData('NO_DEBT');
              this.statusInformer = 'no-debt';
            }
          }
          this.yaMetricService.yaMetricInformerMain('show');
        } else {
          this.setData('ERROR');
          this.statusInformer = 'error';
          this.yaMetricService.yaMetricInformerMain('show');
          console.log('getInformerShortData - error ' + response.error);
        }
      },
      (error) => {
        this.setData('ERROR');
        this.statusInformer = 'error';
        this.yaMetricService.yaMetricInformerMain('show');
        console.log('getInformerShortData - error ' + error);
      });
  }

  public redirectAndSendYaMetric() {
    let type: string;
    switch (this.statusInformer) {
      case 'al10':
        type = 'profileAction';
        break;
      case 'no-debt':
        type = 'historyAction';
        break;
      case 'error':
        type = 'errorAction';
        break;
      case 'debt':
        type = 'action';
        break;
    }
    this.yaMetricService.yaMetricInformerMain(type, this.debtForYaMetric);

    if (this.statusInformer === 'al10') {
      this.router.navigate([this.links[this.statusInformer]]);
    } else {
      location.href = this.links[this.statusInformer];
    }
  }
}
