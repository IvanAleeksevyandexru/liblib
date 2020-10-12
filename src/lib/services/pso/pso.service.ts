import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../load/load.service';
import { catchError, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PageResponseModel, PsoInitializationData } from '../../models/pso.model';
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class PsoService {

  private isLoaded = false;
  private loading = false;
  public pso: any;

  private isPlaced = new BehaviorSubject<boolean>(false);
  public isPlaced$ = this.isPlaced.asObservable();

  constructor(
    public loadService: LoadService,
    private http: HttpClient,
  ) {
  }

  private loadWidget(successCallback, failCallback): void {
    const scriptBlock = document.createElement('script');
    scriptBlock.src = this.loadService.config.psoDomain + '/sspwidget/bootstrap?ref=' + encodeURIComponent(window.location.href);
    scriptBlock.type = 'text/javascript';
    scriptBlock.async = true;
    document.head.appendChild(scriptBlock);

    scriptBlock.onload = () => {
      if (typeof window.PSO !== 'undefined' && window.PSO.loading) {
        window.PSO.loading.then(successCallback).catch(failCallback);
      } else {
        failCallback();
      }
    };
  }

  public loadAndRunPso(): void {
    if (this.isLoaded || this.loading) {
      return;
    }
    this.loading = true;
    this.loadWidget(this.runPso, this.initializationFailed);
  }

  public updatePsoState(): void {
    if (this.isPsoRequired()) {
      if (this.isLoaded) {
        this.showWidget();
        this.updatePsoEnvironment();
      } else {
        this.loadAndRunPso();
      }
    } else {
      this.hideWidget();
    }
  }

  private runPso = (): void => {
    this.loading = false;
    this.isLoaded = true;
    this.prepareWidgetInitializationData().subscribe(widgetData => {
      if (typeof window.PSO !== 'undefined' && window.PSO.init) {
        try {
          window.PSO.init(() => {
            this.pso = window.PSO;
            this.isPlaced.next(true);
          }, widgetData);
        } catch (e) {
          this.initializationFailed();
        }
      } else {
        this.initializationFailed();
      }
    }, () => {
      this.initializationFailed();
    });
  }

  private initializationFailed = (): void => {
    this.loading = false;
    this.isLoaded = false;
    console.warn('PSO widget loading or initialization failed');
  }

  private prepareWidgetInitializationData(): Observable<PsoInitializationData> {
    const commonPageMethodParams = {
      authenticated: this.loadService.user.authorized,
      userID: this.loadService.user.userId || '',
      link: window.location.href,
      userSelectedRegion: this.loadService.attributes.selectedRegion || '00000000000',
      isInfomat: false,
      tz: new Date().getTimezoneOffset(),
      isMobileView: false
    };

    const parseInitializationData = (res: PageResponseModel) => {
      return {
        url: window.location.href,
        data: res && res.data,
        token: res && res.token,
        userType: this.loadService.user.userType
      };
    };

    return this.http.post<PageResponseModel>(`${this.loadService.config.cmsUrl}page`, commonPageMethodParams, {withCredentials: true}).pipe(
      switchMap((data: PageResponseModel) => {
        return of(parseInitializationData(data));
      }),
      catchError(error => {
        if (this.loadService.user.authorized) {
          return throwError('failed to acquire user token');
        } else {
          return of({url: window.location.href, data: '', token: ''});
        }
      })
    );
  }

  public isPsoRequired(): boolean {
    let isRequired = true;
    const path = window.location.pathname;
    const legalPages = ['/search', '/foreign-citizen', '/entrepreneur', '/legal-entity'];
    const config = this.loadService.config;
    const device = this.loadService.attributes.deviceType;
    if (path === '/' && (config.excludePsoFromMain || !this.loadService.user.authorized || this.loadService.user.isKid)) {
      isRequired = false;
    }
    if (legalPages.includes(path)) {
      isRequired = false;
    }
    if (path.indexOf('/pay/quittance') !== -1) {
      isRequired = false;
    }
    if (path.indexOf('/superservices') !== -1) {
      isRequired = false;
    }
    if (config.showPsoOnlyForAuthorized && !this.loadService.user.authorized) {
      isRequired = false;
    }
    if (!config.psoDomain) {
      isRequired = false;
    }
    if (['PARTNERS', 'MAP'].includes(config.viewType)) {
      isRequired = false;
    }
    if (config.allowedPsoPages && config.allowedPsoPages.indexOf('all') === -1 &&
      config.allowedPsoPages.split(',').indexOf(path.split('/')[1]) === -1) {
      isRequired = false;
    }
    if (!config.enableDevicesPso && (device === 'mob' || device === 'tab')) {
      isRequired = false;
    }
    if (!document.getElementById('pso-widget-container')) {
      isRequired = false;
    }
    if (config.webViewMode) {
      isRequired = false;
    }

    return isRequired;
  }

  public isPsoLoaded(): boolean {
    return this.isLoaded;
  }

  public updatePsoEnvironment(): void {
    this.prepareWidgetInitializationData().subscribe((widgetData) => {
      if (this.pso !== 'undefined' && this.pso.updatePsoEnvironmentData) {
        this.pso.updatePsoEnvironmentData(widgetData);
      }
    }, this.initializationFailed);
  }

  public hideWidget(): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.hideWidget) {
      this.pso.widget.hideWidget();
    }
  }

  public showWidget(): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.showWidget) {
      this.pso.widget.showWidget();
    }
  }

  public minimizeWidget(): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.minimizeWidget) {
      this.pso.widget.minimizeWidget();
    }
  }

  public maximizeWidget(): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.maximizeWidget) {
      this.pso.widget.maximizeWidget();
    }
  }

  public toggleWidget(): void {
    // switches (inverts) minified/maximized state
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.toggleWidget) {
      this.pso.widget.toggleWidget();
    }
  }

  public openChatTab(): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.openChatTab) {
      this.pso.widget.openChatTab();
    }
  }

  public openHelpTab(): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.openHelpTab) {
      this.pso.widget.openHelpTab();
    }
  }

  public openWidgetAndGotoChat(): void {
    this.showWidget();
    this.openChatTab();
  }

  public initWidgetChannel(path): void {
    const event = new CustomEvent('initWidgetChannel', {
      detail: {path}
    });
    window.dispatchEvent(event);
  }

  public notifyLocationChanged(newLocation, oldLocation, newState): void {
    if (typeof this.pso !== 'undefined' && this.pso.widget && this.pso.widget.notifyLocationChanged) {
      this.pso.widget.notifyLocationChanged(newLocation, oldLocation, newState);
    }
  }

  public reinitPlacement(): void {
    this.isPlaced.next(true);
  }
}
