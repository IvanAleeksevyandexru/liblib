import { Injectable } from '@angular/core';
import { LoadService } from '../load/load.service';
import { AccessesT } from '../../models/accesses.model';

@Injectable({
  providedIn: 'root'
})
export class AccessesService {

  private user = this.loadService.user;
  private groupsOfAccess = this.user.person && this.user.person.org && this.user.person.org.fts;

  constructor(
    private loadService: LoadService,
  ) { }

  public getAccessTech(): boolean {
    const groups = this.user.person && this.user.person.groups;
    const groupTech = groups && groups.find((item) => {
      return item.grp_id === 'TECH_CONSOLE';
    });

    return !!groupTech;
  }

  public getAccess(type: AccessesT): boolean {
    if (!this.groupsOfAccess) {
      return false;
    }

    return this.groupsOfAccess.includes(type);
  }
}