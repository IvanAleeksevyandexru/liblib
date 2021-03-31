import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { MainFooter } from '../../models/main-page.model';
import { MainPageService } from '../../services/main-page/main-page.service';

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
