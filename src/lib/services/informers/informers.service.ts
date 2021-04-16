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

  public isAL10(): boolean {
    return this.loadService.user.assuranceLevel === 'AL10';
  }

  public hints = {
    '03': {
      'link': this.loadService.config.oplataUrl + '/pay?categories=fine'
    },
    '05': {
      'link': this.loadService.config.oplataUrl + '/pay?categories=fns',
      'text': 'Вам начисляются пени'
    }
  };

  public words = {
    'платеж': ['платеж', 'платежей', 'платежа'],
    'задолженность': ['задолженность', 'задолженностей', 'задолженности'],
    'штраф': ['штраф', 'штрафов', 'штрафа'],
    'счет': ['счёт', 'счетов', 'счёта'],
    'госпошлина': ['госпошлина', 'госпошлин', 'госпошлины'],
    'начисление': ['начисление', 'начислений', 'начисления'],
    'выбран': ['Выбран', 'Выбрано', 'Выбрано'],
    'выбрана': ['Выбрана', 'Выбрано', 'Выбрано'],
    'выбрано': ['Выбрано', 'Выбрано', 'Выбрано'],
    'судебная': ['судебная', 'судебных', 'судебных'],
    'налоговая': ['налоговая', 'налоговых', 'налоговых'],
    'судебная задолженность': ['судебная задолженность', 'судебных задолженностей', 'судебных задолженности'],
    'налоговая задолженность': ['налоговая задолженность', 'налоговых задолженностей', 'налоговых задолженности'],
    'день': ['день', 'дней', 'дня'],
    'остался': ['Остался', 'Осталось', 'Осталось'],
    'транспортное средство': ['транспортное средство', 'транспортных средств', 'транспортных средства'],
    'случай': ['случай', 'случаев', 'случая'],
    'смерть': ['смерть', 'смертей', 'смерти']
  };

  public wordsGender = {
    'Выставлен': {
      'stateDuty': 'Выставлена',
      'fns': 'Выставлена',
      'account': 'Выставлен'
    }
  };

  public getWord(count, word): string {
    if (!word) return '';
    if (!this.words[word]) return word;

    var rest10 = count % 10;
    var rest100 = count % 100;
    if (11 <= rest100 && rest100 <= 14) {
      return this.words[word][1]
    } else if (1 < rest10 && rest10 < 5) {
      return this.words[word][2]
    } else if (5 <= rest10 && rest10 <= 9 || rest10 == 0) {
      return this.words[word][1]
    }
    return this.words[word][0]
  }

  public getWordByGender(gender, word): string {
    return this.wordsGender[word][gender];
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
