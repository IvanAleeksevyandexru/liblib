import { Pipe, PipeTransform } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Pipe({
  name: 'betaUrl'
})
export class BetaUrlPipe implements PipeTransform {

  private isLk = (this.loadService.attributes.appContext || this.loadService.config.viewType) === 'LK';

  constructor(
    private loadService: LoadService
  ) {
  }

  public transform(url: string): string {
    const newUrl = url ? url.replace(/^\//, '') : '';
    return (this.isLk ? this.loadService.config.betaUrl : '/') + newUrl.replace(/^\//, '');
  }

}
