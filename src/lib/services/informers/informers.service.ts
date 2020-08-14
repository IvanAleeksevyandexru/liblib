import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { Observable } from 'rxjs';
import { InformerShortInterface } from '../../models/informer.model';

@Injectable({
  providedIn: 'root'
})
export class InformersService {

  constructor(private http: HttpClient,
              private loadService: LoadService,
  ) {

  }

  public isAL10(): boolean {
    return this.loadService.user.assuranceLevel === 'AL10';
  }

  // сюды пихать остальные проверки на ЮЛ/ИП и проч

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
