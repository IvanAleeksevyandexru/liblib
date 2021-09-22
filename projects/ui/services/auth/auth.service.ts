import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }

  public login() {
    return this.http.get<any>('/node-api/login', {
      withCredentials:  true,
      params: {
        redirectUrl: location.href
      }
    });
  }

  public logout() {
    return this.http.get<any>('/node-api/logout', {
      withCredentials:  true,
      params: {
        redirectUrl: location.href
      }
    });
  }
}
