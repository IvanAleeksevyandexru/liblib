import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from '@epgu/ui/services/constants';
import { LoadService } from '@epgu/ui/services/load';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public config = this.loadService.config;
  public user: any = this.loadService.user;
  private delegatedRightsData;

  constructor(
    private constants: ConstantsService,
    public loadService: LoadService,
    private http: HttpClient,
  ) {
  }

  public getDelegatedRights(ignoreConfig?: boolean) {
    if (!this.user.orgType || !this.user.authorityId || (!this.config.delegationEnabled && !ignoreConfig)) {
      return of({});
    }
    if (this.delegatedRightsData) {
      return of(this.delegatedRightsData);
    }
    return this.http.get(`${this.config.lkApiUrl}users/data/authority/${this.user.authorityId}`, {withCredentials: true}).pipe(
      switchMap(data => {
        this.delegatedRightsData = data;
        return of(this.delegatedRightsData);
      })
    );
  }
}
