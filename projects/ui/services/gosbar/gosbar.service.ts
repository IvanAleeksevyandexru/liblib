import { Injectable, NgModuleRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import { CookieService } from '@epgu/ui/services/cookie';
import { ModalService } from '@epgu/ui/services/modal';
import { LocationComponent } from '@epgu/ui/components/location';
import { LocationService } from '@epgu/ui/services/location';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SharedService } from '@epgu/ui/services/shared';

@Injectable({
  providedIn: 'root'
})

export class GosbarService {
  public config = this.loadService.config;
  public geoPin = false;
  public asyncLoad = false;
  public langs = [];
  private gosbarManager: any;

  private selectedLang = new BehaviorSubject<string>(null);
  public selectedLang$ = this.selectedLang.asObservable();

  private isLoading = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.isLoading.asObservable();

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
    private zone: NgZone,
    private locationService: LocationService,
    private translateService: TranslateService,
    private router: Router,
    public  cookieService: CookieService,
    private sharedService: SharedService
  ) {
    this.getLocation();
  }

  private setRegionFailName(manager) {
    this.translateService.get('LOCATION.FAIL').subscribe((res: string) => {
      if (manager) {
        manager.setLocationLabel(res);
      }
    });
  }

  private getLocation(manager?) {

    const onError = (err) => {
        this.locationService.userSelectedRegionCode = '00000000000';
        this.setRegionFailName(manager);
        console.error(`DetectRegion fail ${err}`);
    };

    this.locationService.detectRegion().subscribe((regionData) => {
      if (regionData && regionData.code === '00000000000') {
        this.setRegionFailName(manager);
        this.popupLocation();
      } else if (regionData) {

        if (manager) {
          manager.setLocationLabel(regionData.name);
        }

        this.sharedService.send('regionData', regionData);

        this.locationService.userSelectedRegionCode = regionData.code;
        this.locationService.userSelectedRegionName = regionData.name;
        this.locationService.userSelectedRegionPath = regionData.path;
        this.locationService.userSelectedRegionCodes = regionData.codes;
      } else {
        onError('empty response');
      }
    }, (err) => {
      this.sharedService.send('regionData', null);
      onError(err);
    });

    if (this.config.gosbarWarningTextEnabled) {
      this.hideGosbarErrorText();
    }
  }

  public initGosbar() {
    if ((window as any).Gosbar) {
      this.selectedLang.next(this.cookieService.get('userSelectedLanguage') || 'ru');
      (window as any).Gosbar.init({
        cssOrigin: this.config.gosbarUrlStatic,
        catalogOrigin: this.config.gosbarUrlStatic,
        disableSearch: true,
        cssFixed: false,
        isWarningText: this.config.gosbarWarningTextEnabled || false,
        picker: this.selectedLang.value === 'ru' ? this.getPickerConfig() : [],
        language: this.config.viewType !== 'PARTNERS' ? this.getLangConfig() : false
      }).then((manager) => {
          (window as any).zoneImpl = this.zone;
          this.gosbarManager = manager;
          manager.displayLocationButton();
          manager.onLocationLabelClick = () => {
            (window as any).zoneImpl.run(() => {
              this.popupLocation();
            });
          };
          this.getLocation(manager);
          this.isLoading.next(false);
        }, () => {
          this.unAvailableGosbar();
        }
      );
    } else {
      this.unAvailableGosbar();
    }
  }

  public getLangConfig() {
    const config = this.config;
    const router = this.router;
    const curLang = this.selectedLang;
    const cookieService = this.cookieService;
    const updateGosbar = this.updateGosbar;
    this.langs = this.config.allowedLangs;
    this.langs.unshift(this.langs.splice(
      this.langs.indexOf(this.selectedLang.value), 1
      )[0]
    );
    return {
      visible: this.langs,
      onChange(lang) {
        (window as any).zoneImpl.run(() => {
          cookieService.set('userSelectedLanguage', lang);
          if (config.viewType === 'LK' || config.viewType === 'MAP' && lang !== 'ru') {
            location.href = config.betaUrl + 'foreign-citizen?lang=' + lang;
            return;
          }
          if (config.viewType === 'PAYMENT') {
            updateGosbar(lang);
            return;
          }
          if (lang !== 'ru') {
            router.navigate(['/foreign-citizen'], {queryParams: {lang}});
          } else {
            router.navigate(['/'], {queryParams: {lang}});
          }
        });
      }
    };
  }

  public getPickerConfig() {
    const betaUrl = this.loadService.config.betaUrl;
    const config = [
      {
        text: '?????? ??????????????',
        url: '/',
        userType: 'P',
        onItemSelect: () => {
          window.location.href = betaUrl;
        }
      },
      {
        text: '?????? ?????????????????????? ??????',
        url: '/legal-entity',
        userType: 'L',
        onItemSelect: () => {
          window.location.href = `${betaUrl}legal-entity`;
        }
      },
      {
        text: '?????? ????????????????????????????????',
        url: '/entrepreneur',
        userType: 'B',
        onItemSelect: () => {
          window.location.href = `${betaUrl}entrepreneur`;
        }
      },
      {
        text: '?????? ?????????????????????? ??????????????',
        url: '/foreign-citizen',
        userType: 'F',
        onItemSelect: () => {
          window.location.href = `${betaUrl}foreign-citizen`;
        }
      }
    ];

    const partnersPickerConfig =  {
      text: '?????? ??????????????????',
      url: this.config.partnersUrl,
      userType: 'PA',
      onItemSelect: () => {
        window.location = this.config.partnersUrl;
      }
    }

    if (this.config.viewType === 'PARTNERS') {
      config.unshift(partnersPickerConfig);
    } else if (this.config.partnersUrl) {
      config.push(partnersPickerConfig);
    }
    return config;
  }

  public popupLocation() {
    this.modalService.popupInject(LocationComponent, this.moduleRef);
  }

  public unAvailableGosbar = () => {
    this.geoPin = true;
    this.asyncLoad = true;
    this.isLoading.next(false);
    // TODO: ?????? ?????????? ???? geopin ?????????????? this.popupLocation();
  }

  private hideGosbarErrorText() {
    if (window.matchMedia('(max-width: 1140px)').matches) {
      const iframe = document.getElementsByTagName('IFRAME')[0] as any;
      const error = iframe ? iframe.contentDocument.getElementById('warningText') : null;
      if (error) {
        error.style.display = 'none';
      }
    }
  }

  public updateGosbar = (lang: string) => {
    this.selectedLang.next(lang);
    this.gosbarManager.updateConfig({
      picker: lang === 'ru' ? this.getPickerConfig() : [],
      language: this.config.viewType !== 'PARTNERS' ? this.getLangConfig() : false
    });
  }
}
