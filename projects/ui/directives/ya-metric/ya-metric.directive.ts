import { Directive, HostListener, Input } from '@angular/core';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { HelperService } from '@epgu/ui/services/helper';

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
    private yaMetricService: YaMetricService, private helperService: HelperService) {
  }

  @HostListener('click', ['$event'])
  public onClick(event: Event) {
    event.preventDefault();
    if (this.yaMetricService && this.libYaMetric) {
      const sendMetric = () => {
        this.yaMetricService.callReachGoalParamsAsMap(this.libYaMetric).then(() => {
          if (this.libYaMetricSendAndPass) {
            const targetBlank = ((event.target as HTMLElement).getAttribute('target') || '').toLowerCase() === '_blank';
            this.helperService.navigate(this.libYaMetricSendAndPass || '/', targetBlank);
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
