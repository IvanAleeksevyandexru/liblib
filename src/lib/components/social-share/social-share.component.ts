import { Component, Input, OnInit } from '@angular/core';
import { SocialShareService } from '../../services/social-share/social-share.service';

@Component({
  selector: 'lib-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss']
})
export class SocialShareComponent implements OnInit {
  @Input() public url?: string;

  constructor(
    private socialShareService: SocialShareService
  ) { }

  public ngOnInit() {
  }

  public share(channel: 'vkontakte' | 'facebook' | 'odnoklassniki' | 'twitter') {
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
    }
  }
}
