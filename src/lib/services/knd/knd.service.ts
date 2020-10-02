import { Injectable } from '@angular/core';
import { LoadService } from '../load/load.service';
import { InformersService } from '../informers/informers.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { KndInterface } from '../../models/knd.model';

@Injectable({
  providedIn: 'root'
})
export class KndService {

  public readonly config = this.loadService.config;

  constructor(
    private loadService: LoadService,
    private informerService: InformersService,
    private http: HttpClient,
  ) { }

  public canSeeKnd(): boolean {
    return this.config.kndInformerShow && this.config.kndEnabled && this.informerService.checkRightsForLAndB();
  }

  public getDataKnd(): Observable<KndInterface> {
    return this.http.get<KndInterface>(
      `${this.loadService.config.lkApiUrlV2}procuracy/informers/knd/counters`,
      {
        params: {
          type: 'short',
          _: Math.random().toString(),
        },
        withCredentials: true,
      }
    );
  }

}
