import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Modal } from '../../models/modal-container';
import { LocationService } from '../../services/location/location.service';
import { Region } from '../../models/location';
import { CookieService } from '../../services/cookie/cookie.service';
import { ListItem } from '../../models/dropdown.model';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})

@Modal()

export class LocationComponent implements OnInit, OnDestroy {
  public radioValue: string;
  public defaultLocation: string;
  public defaultLocationCode: string;
  public receivedLocation: any;
  public regionCode: string;
  public errorMessage: string;
  public destroy: () => void;
  public searching = false;
  public showAutoDetect = false;

  public searchProvider = this.locationService.getSearchRegionProvider();
  public searchItem: ListItem;

  private frame = document.getElementsByTagName('iframe')[0];

  @HostListener('document:keydown', ['$event'])
  public onKeydownComponent(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.destroy();
    }
  }

  @HostListener('document:click', ['$event'])
  public onClickOut(event: any) {
    if (event.target.classList.contains('modal-overlay') || event.target.classList.contains('container')) {
      this.destroy();
    }
  }

  constructor(private locationService: LocationService,
              private cookieService: CookieService,
              private loadService: LoadService) {
  }

  public ngOnInit() {
    if (this.frame) {
      this.frame.classList.add('hide', 'show-md', 'show-lg');
    }

    if (navigator.geolocation) {
      this.showAutoDetect = true;
    }

    this.setDefaultRegion();
  }

  private setDefaultRegion() {
    this.defaultLocationCode = this.cookieService.get('userSelectedRegion') || this.loadService.attributes.selectedRegion;
    if (this.defaultLocationCode === '00000000000' || this.defaultLocationCode === 'undefined') {
      this.defaultLocation = this.locationService.defaultRegion.path;
      this.regionCode = this.defaultLocationCode;
    } else {
      this.defaultLocation = this.locationService.userSelectedRegionPath;
      this.regionCode = this.locationService.userSelectedRegionCode;
    }
  }

  public onRadioChange() {
    switch (this.radioValue) {
      case 'current':
        this.regionCode = '';
        this.errorMessage = '';

        this.regionCode = this.defaultLocationCode;
        break;

      case 'auto':
        if (navigator.geolocation) {
          this.errorMessage = '';
          this.regionCode = '';
          this.searching = true;
          navigator.geolocation.getCurrentPosition((position => {
            const query: any = {};
            query.latitude = position && position.coords.latitude || 0;
            query.longitude = position && position.coords.longitude || 0;
            query.needIpDetect = !this.locationService.firstTimeShow;
            query.platform = 'EPGUV3_DESK';
            query._ = Math.random();
            this.locationService.getCurrentLocation(query).subscribe((data: Region) => {
              this.searching = false;
              if (data && data.path) {
                this.receivedLocation = data.path;
                this.regionCode = data.code;
              } else {
                this.errorMessage = 'LOCATION.AUTO-SELECT-ERROR';
              }
            }, () => {
              this.errorMessage = 'LOCATION.AUTO-SELECT-ERROR';
            });
          }), () => {
            this.errorMessage = 'LOCATION.AUTO-SELECT-ERROR';
          });
        }
        break;

      case 'manual':
        this.regionCode = '';
        this.errorMessage = '';
        break;
    }
  }

  public onSave() {
    const onClearRegion = () => {
      this.destroy();
      window.location.reload();
    };
    if (this.radioValue === 'manual') {
      this.regionCode = `${this.searchItem.id}`;
    }
    this.cookieService.set('userSelectedRegion', this.regionCode);
    this.locationService.clearRegion().subscribe(() => {
      onClearRegion();
    }, () => {
      onClearRegion();
    });
  }

  public onClose() {
    this.locationService.firstTimeShow = false;
    this.destroy();
  }

  public ngOnDestroy() {
    if (this.frame) {
      this.frame.classList.remove('hide', 'show-md', 'show-lg');
    }
  }
}
