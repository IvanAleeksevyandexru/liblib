import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Observable } from 'rxjs';
import { InformerShortInterface } from '../../models/informer.model';
import { User } from '../../models/user';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root'
})
export class InformersService {

  constructor(private http: HttpClient,
              private loadService: LoadService,
              private profileService: ProfileService,
  ) {

  }

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

  public checkDelegationForL(): boolean {
    if (this.loadService.user.autorityId) {
      return !!this.profileService.getDelegatedRights().subscribe(
        (data) => {
          return !!(data && data.authorities && data.authorities.some((elem) => {
            return elem.mnemonic === 'INFORMER';
          }));
        },
        () => {
          return false;
        }
      );
    } else {
      return false;
    }
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
