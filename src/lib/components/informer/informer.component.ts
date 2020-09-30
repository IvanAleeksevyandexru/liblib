import { Component, Input, OnInit } from '@angular/core';
import { InformersService } from '../../services/informers/informers.service';
import { DataInformer,
  InformerShortInterface,
  TypeDebt,
  WordsOfDebt,
  TypeIcons,
  DebtYaMetricInterface,
  TypeDataOfInformers,
  TypeStatus
} from '../../models/informer.model';
import { DeclinePipe } from '../../pipes/decline/decline.pipe';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { LoadService } from '../../services/load/load.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'lib-informer',
  templateUrl: './informer.component.html',
  styleUrls: ['./informer.component.scss']
})
export class InformerComponent implements OnInit {

  // отображение в сжатом состоянии
  @Input() public isMini = false;

  public statusInformer: TypeStatus = 'load';
  public dataInformer = new DataInformer();

  private links = {
    al10: '/profile/personal',
    no_debt: `${this.loadService.config.betaUrl}pay?tab=toPay`,
    error: `${this.loadService.config.betaUrl}pay?tab=toPay`,
    debt: `${this.loadService.config.betaUrl}pay?tab=toPay`,
    no_rights: '/help/faq/yuridicheskim_licam/2761'
  };
  private debtForYaMetric: DebtYaMetricInterface = {};

  constructor(
    private informersService: InformersService,
    private declinePipe: DeclinePipe,
    private yaMetricService: YaMetricService,
    private loadService: LoadService,
    private router: Router,
    private profileService: ProfileService,
  ) {
  }

  public ngOnInit() {
    if (['L', 'B'].includes(this.loadService.user.type)) {
      this.checkRights();
    } else {
      this.getInformerShortData();
    }
  }

  private setData(type: TypeDataOfInformers) {
    this.dataInformer.title = `INFORMER.${type}.TITLE`;
    this.dataInformer.icon = TypeIcons[type];
    this.dataInformer.button = `INFORMER.${type}.BUTTON`;

    this.statusInformer = type.toLowerCase() as TypeStatus;
  }

  private checkRights(): void {
    const rights = this.informersService.checkRightsForLAndB();

    if (rights) {
      this.getInformerShortData();
    } else {
      if (this.loadService.user.type === 'L' && this.loadService.user.autorityId) {
        this.profileService.getDelegatedRights().subscribe(
          (data) => {
            const rightsEnabled = data && data.authorities && data.authorities.some((elem) => {
              return elem.mnemonic === 'INFORMER';
            });
            if (rightsEnabled) {
              this.getInformerShortData();
            } else {
              this.setData('NO_RIGHTS');
            }
          },
          () => {
            this.setData('NO_RIGHTS');
          }
        );
      } else {
        this.setData('NO_RIGHTS');
      }
    }
  }

  private getWorld(debtCount: Array<string>): string[] {
    if (debtCount.length === 1) {
      return WordsOfDebt[debtCount[0]].split('|');
    } else {
      return WordsOfDebt.ALL.split('|');
    }
  }

  private setExtraDebtData(res): void {
    // цена без скидки
    if (res.originalAmount && res.originalAmount !== 0) {
      this.dataInformer.price = res.originalAmount;
    }
    // цена со скидкой или просто цена
    this.dataInformer.priceDiscount = res.amount;

    this.dataInformer.button = 'INFORMER.DEBT.BUTTON';
    this.statusInformer = 'debt';
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
      },
      (error) => {
        this.setData('ERROR');
        this.yaMetricService.yaMetricInformerMain('show');
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

    if (['al10', 'no_rights'].includes(this.statusInformer)) {
      this.router.navigate([this.links[this.statusInformer]]);
    } else {
      location.href = this.links[this.statusInformer];
    }
  }
}
