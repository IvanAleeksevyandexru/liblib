import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';

@Directive({
  selector: '[libYaMetric]'
})
export class YaMetricDirective {

  // параметры метрики
  @Input() public libYaMetric: { [key: string]: any } = {};
  // урл перехода после отправки метрики
  @Input() public libYaMetricSendAndPass: string;
  // задержка может быть нужна для того чтобы другие клик-обработчики
  // отработали и изменили состояние параметров метрики если оно от них зависит
  @Input() public libYaMetricDelay: number;

  constructor(
    private yaMetricService: YaMetricService, private router: Router) {
  }

  @HostListener('click', ['$event'])
  public onClick(event: Event) {
    event.preventDefault();
    if (this.yaMetricService && this.libYaMetric) {
      const sendMetric = () => {
        this.yaMetricService.callReachGoalParamsAsMap(this.libYaMetric).then(() => {
          if (this.libYaMetricSendAndPass) {
            const url = this.libYaMetricSendAndPass || '/';
            const currentHost = window.location.protocol + '//' + window.location.host;
            const urlInternal = url.startsWith('/') || url.startsWith(currentHost);
            if (urlInternal) {
              this.router.navigate([url]);
            } else {
              window.location.href = url;
            }
          }
        });
      };
      if (this.libYaMetricDelay) {
        setTimeout(sendMetric, this.libYaMetricDelay);
      } else {
        sendMetric();
      }
    }
  }
}
