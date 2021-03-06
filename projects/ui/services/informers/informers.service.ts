import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import { Observable, of, throwError } from 'rxjs';
import { InformerShortInterface, RestrictionsModel, RestrictionsState } from '@epgu/ui/models';
import { User } from '@epgu/ui/models/user';
import { catchError, switchMap } from 'rxjs/operators';

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
    '03': {
      link: this.loadService.config.betaUrl + '/pay?categories=fine'
    },
    '05': {
      link: this.loadService.config.betaUrl + '/pay?categories=fns',
      text: 'Вам начисляются пени'
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

  public getRestrictionsInfo(): Observable<RestrictionsState> {
    return this.http.get<RestrictionsModel>(`${this.loadService.config.fsspApiUrl}restrictions/informer`, {
      withCredentials: true,
      observe: 'response',
      params: {
        _: Math.random().toString()
      }
    }).pipe(
      switchMap(response => {
        if (response.status === 200) {
          const state: RestrictionsState = response.body.hasRestrictions ? 'YES' : 'NO';
          return of(state);
        } else if (response.status === 204) {
          return of('NOT_EMBEDDED' as RestrictionsState);
        }
        return throwError(response);
      }),
      catchError(error => {
        return of('ERROR' as RestrictionsState);
      })
    );
  }
}

