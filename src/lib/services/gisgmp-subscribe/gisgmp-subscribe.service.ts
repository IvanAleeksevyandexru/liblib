import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GisgmpSubscribeService {

  constructor(
    private http: HttpClient,
    private loadService: LoadService
  ) { }

  public subscribe(email: string, fkSmevVersion: number, type: string, requestId?: string, uin?: string): Observable<any> {
     if (fkSmevVersion === 3) {
      let params = new HttpParams()
        .append('type', type)
        .append('requestId', requestId)
        .append('email', email);

      if (uin) {
        params = params.append('uin', uin);
      }

      return this.http.post(
        `${this.loadService.config.gosuslugiUrl}/api/pay/subscriptions/v1/subscribe`,
        {},
        {withCredentials: true, params});
    } else {
      const body = this.prepareRequest({ emailSend: true, email, uin });
      return this.http.post(`${this.loadService.config.sfUrl}delayed/wsapi`, body, {withCredentials: true});
    }
  }

  private prepareRequest(params) {
    const request = {
      submitComponent: 'GisGmp.FormStep1.Panel1.button',
      submitEventNumber: '0',
      submitEvent: 'submit',
      userSelectedRegion: '00000000000',
      form: {
        mnemonic: 'uin_noparsed',
        content: {}
      },
      context: {
        context: {
          groovy: {
            Script: 'groovy.uinCallGisGmp',
          },
        },
      },
    };
    const prefix = 'GisGmp.FormStep1.Panel1.';

    Object.keys(params).forEach((key) => {
      const value = params[key];
      request.form.content[prefix + key] = { value };
    });

    request.form.content[prefix + 'useFailoverCache'] = { value: true };
    return {
      type: 'javaServiceTask',
      serviceName: 'formProcessing',
      methodName: 'process',
      parameter: JSON.stringify(request),
    };
  }
}
