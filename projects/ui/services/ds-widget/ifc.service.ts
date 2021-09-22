import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import { DsWidget } from './ds.widget';
import { DsCheckPluginData, DsChallengeData, DsSignResult } from '@epgu/ui/models';

type CallbackFunction = (...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class IfcService {

  public version = '2.0.3.1';

  constructor(private http: HttpClient,
              private dsWidget: DsWidget,
              private loadService: LoadService) {
  }

  public checkPlugin() {
    return new Promise((resolve, reject) => {
      this.dsWidget.checkPlugin(resolve, reject, this.version);
    });
  }

  public sign(data) {
    return new Promise((resolve, reject) => {
      this.dsWidget.selectAndSign(data, resolve, reject);
    });
  }

  public signJsonXml(json, xml) {
    return new Promise((resolve, reject) => {
      this.dsWidget.selectAndSignJsonXml(json, xml, resolve, reject);
    });
  }

  public checkPluginAndSign(callback: CallbackFunction, callbackErr?: CallbackFunction): void {

    const apiResult: any = {};
    this.checkPlugin().then((success: DsCheckPluginData) => {

      this.http.get(this.loadService.config.esiaUrl + '/profile/rs/prns/usrcfm/ds-challenge')
        .subscribe((data: DsChallengeData) => {
          apiResult.__challenge = data.challenge;
          this.sign(data.challenge).then((response: DsSignResult) => {

            apiResult.__signature = response.sign;
            apiResult.__certificate = response.certificate;
            if (callback && typeof (callback) === 'function') {
              callback(apiResult);
            }

          }, err => {
            // Как вариант : не установлены сертификаты!!!
          });
        });
    }, err => {
      // Нет плагина!!!
      if (callbackErr && typeof (callbackErr) === 'function') {
        callbackErr(err);
      }
    });
  }
}
