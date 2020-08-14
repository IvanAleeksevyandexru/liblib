import { Injectable } from '@angular/core';
import { UserTypeParams } from '../models/user-type-params';
import { of } from 'rxjs';

@Injectable()
export class LoadServiceStub {

  private params: any = {
    data: {
      user: {
        authorized: false,
        typeParams: new UserTypeParams(''),
        person: {
          person: {},
          docs: []
        }
      }
    },
    config: {
      lkUrl: '/',
      confirmBy: {}
    },
    attrs: {}
  };

  public get config(): any {
    return this.params.config;
  }

  public get attributes(): any {
    return this.params.attrs;
  }

  public set user(data: any) {
    this.params.data.user = data;
  }

  public get user(): any {
    return this.params.data.user;
  }

  public get avatar() {
    return of({
      url: ''
    });
  }
}
