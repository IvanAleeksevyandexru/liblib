import { Component, Input, OnInit } from '@angular/core';
import { SocialShareService } from '../../services/social-share/social-share.service';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss']
})
export class SocialShareComponent implements OnInit {
  @Input() public url?: string;
  @Input() public isNewDesign = false;
  @Input() public isNewDesignDisabled = true;
  @Input() public staticDomainLibAssetsPath = this.loadService.config.staticDomainLibAssetsPath;

  constructor(
    private socialShareService: SocialShareService,
    private loadService: LoadService
  ) { }

  public ngOnInit() {
  }

  public share(channel: 'vkontakte' | 'facebook' | 'odnoklassniki' | 'twitter' | 'telegram') {
    if (this.isNewDesign && this.isNewDesignDisabled) {
      return;
    }
    const location = (window as any).location.href;

    switch (channel) {
      case 'vkontakte':
        this.socialShareService.vkontakte(this.url || location);
        break;
      case 'facebook':
        this.socialShareService.facebook(this.url || location);
        break;
      case 'odnoklassniki':
        this.socialShareService.odnoklassniki(this.url || location);
        break;
      case 'twitter':
        this.socialShareService.twitter(this.url || location);
        break;
      case 'telegram':
        this.socialShareService.telegram(this.url || location);
        break;
    }
  }
}
