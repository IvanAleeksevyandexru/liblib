import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';

@Injectable()
export class AuthServiceStub {

  public login() {
    return EMPTY;
  }

  public logout() {
    return EMPTY;
  }
}
