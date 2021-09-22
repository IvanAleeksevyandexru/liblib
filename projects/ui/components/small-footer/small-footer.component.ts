import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { MainFooter } from '@epgu/ui/models';

@Component({
  selector: 'lib-small-footer',
  templateUrl: './small-footer.component.html',
  styleUrls: ['./small-footer.component.scss']
})
export class SmallFooterComponent implements OnInit {

  @Input() public footer: MainFooter;

  public config = this.loadService.config;
  public staticDomainLibAssetsPath = this.loadService.config.staticDomainLibAssetsPath;
  public applications = {
    android: {
      url: this.config.appStores.googlePlay,
      icon: `${this.staticDomainLibAssetsPath}svg/mp-buttons/googleplay-white.svg`,
      iconHover: `${this.staticDomainLibAssetsPath}svg/mp-buttons/googleplay-white-hover.svg`,
      name: 'Google Play'
    },
    ios: {
      url: this.config.appStores.appStore,
      icon: `${this.staticDomainLibAssetsPath}svg/mp-buttons/appstore-white.svg`,
      iconHover: `${this.staticDomainLibAssetsPath}svg/mp-buttons/appstore-white-hover.svg`,
      name: 'App Store'
    },
    huawei: {
      url: this.config.appStores.appGallery,
      name: 'App Gallery'
    },
  };

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
  }

}
