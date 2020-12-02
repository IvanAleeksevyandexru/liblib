import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { DisclaimerInterface } from '../../models/disclaimer.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisclaimerService {

  private config = this.loadService.config;
  private region = this.loadService.attributes.selectedRegion;
  private urlDisclaimer = `${this.config.cmsUrl}disclaimers/`;
  private urlDisclaimerV2 = `${this.config.cmsUrlV2}disclaimers/`;
  public disclaimersMain: BehaviorSubject<DisclaimerInterface[]> = new BehaviorSubject<DisclaimerInterface[]>([]);
  public disclaimersMainPage: BehaviorSubject<DisclaimerInterface[]> = new BehaviorSubject<DisclaimerInterface[]>([]);
  public disclaimersAdditional: BehaviorSubject<DisclaimerInterface[]> = new BehaviorSubject<DisclaimerInterface[]>([]);

  constructor(private http: HttpClient, private loadService: LoadService) {
  }

  public clearDisclaimers(type: string): void {
    if (type === 'main') {
      this.disclaimersMain.next([]);
    } else if (type === 'additional') {
      this.disclaimersAdditional.next(null);
    } else { // 'all'
      this.disclaimersMain.next([]);
      this.disclaimersMainPage.next([]);
      this.disclaimersAdditional.next(null);
    }
  }

  public getMainPageDisclaimers(): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}page`, {
      withCredentials: true,
      params: {
        region: this.region,
        page: 'main_v2',
        _: Math.random().toString(),

      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersMainPage.next(data);
    });
  }

  public getMainDisclaimers(): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}epgu`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersMain.next(data);
    });
  }

  public getPassportDisclaimers(orgId: number, passportId: number): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}structure/${orgId}/passport/${passportId}`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getServiceDisclaimers(passCode: number, epguCode: number): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}passport/${passCode}/${epguCode}`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getServiceDisclaimersApi(orgId: number, passportId: number, targetId: number, isBooking: string): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}structure/${orgId}/passport/${passportId}/target/${targetId}`, {
      withCredentials: true,
      params: {
        bookingMnemonic: isBooking,
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getPaymentDisclaimers(): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}ipsh`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getStructureDisclaimers(structureId: number): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}structure/${structureId}`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getGepsDisclaimers(): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}geps`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getFosDisclaimers(): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}fos`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public getLandingPayDisclaimers(): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimer}pay`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  // notification-setup or mail-delivery
  public getLkNotificationDisclaimers(page: string): void {
    this.http.get<DisclaimerInterface[]>(`${this.urlDisclaimerV2 + page}`, {
      withCredentials: true,
      params: {
        _: Math.random().toString()
      }
    }).subscribe((data: DisclaimerInterface[]) => {
      this.disclaimersAdditional.next(data);
    });
  }

  public checkSubscriptionDisclaimers(id: number, email: string): Observable<null | ErrorEvent> {
    return this.http.get<null | ErrorEvent>(`${this.config.notificationApiUrl}subscribe/disclaimer/${id}`, {
      withCredentials: true,
      params: {
        email,
        _: Math.random().toString()
      }
    });
  }

  public sendSubscriptionDisclaimers(data: object): Observable<null | ErrorEvent> {
    return this.http.post<null | ErrorEvent>(`${this.config.notificationApiUrl}subscribe/disclaimer/`, data, {
      withCredentials: true
    });
  }

}
