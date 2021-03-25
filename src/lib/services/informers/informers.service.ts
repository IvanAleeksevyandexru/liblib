import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Observable } from 'rxjs';
import { InformerShortInterface } from '../../models/informer.model';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class InformersService {

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
  ) {
  }

  public hints = {
    '00': {
      link: this.loadService.config.lkUrl + 'docs',
      text: 'Укажите <span class=\'blue\'>больше данных</span> для поиска начислений'
    },
    '01': {
      link: this.loadService.config.oplataUrl + '/pay?categories=stateDuty',
      text: 'Оплатите <span class=\'blue\'>пошлину по вашему заявлению</span>'
    },
    '02': {
      link: this.loadService.config.oplataUrl + '/pay?categories=stateDuty',
      textWithDay: 'на <span class=\'blue\'>оплату госпошлины</span>'
    },
    '03': {
      link: this.loadService.config.oplataUrl + '/pay?categories=fine',
      textWithDay: ' на <span class=\'blue\'>оплату со скидкой 50%</span>'
    },
    '04': {
      link: this.loadService.config.oplataUrl + '/pay?categories=fine',
      textWithDay: ' на <span class=\'blue\'>оплату штрафа</span>'
    },
    '05': {
      link: this.loadService.config.oplataUrl + '/pay?categories=fns',
      text: 'Заплатите <span class=\'blue\'>налоги</span>, на них начисляются пени'
    }
  };

  public isAL10(): boolean {
    return this.loadService.user.assuranceLevel === 'AL10';
  }

  public checkRightsForLAndB(): boolean {
    const user: User = this.loadService.user;

    const isChief = user.person && user.person.person && user.person.person.chief;
    const groups = user.person && user.person.groups;
    const correctGroup = !!groups && groups.some(item => ['ESIA', 'PGU'].includes(item.itSystem) && item.grp_id === 'ORG_ADMIN');

    return (isChief || correctGroup) && user.authorized && !user.branchOid;
  }

  public getDataInformer(): Observable<InformerShortInterface | ErrorEvent> {
    return this.http.get<InformerShortInterface | ErrorEvent>(
      `${this.loadService.config.ipshApi}informer/fetch/`, {
        withCredentials: true,
        params: {
          short: 'true',
          _: Math.random().toString()
        }
      }
    );
  }

}
