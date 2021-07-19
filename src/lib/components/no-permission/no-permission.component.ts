import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services';
import { CookieService } from '../../services';

@Component({
  selector: 'lib-no-permission',
  templateUrl: './no-permission.component.html',
  styleUrls: ['./no-permission.component.scss']
})
export class NoPermissionComponent implements OnInit {

  @Input() public text: string;
  @Input() public button: string;

  public staticDomainLibAssetsPath: string = this.loadService.config.staticDomainLibAssetsPath;

  constructor(
    private cookieService: CookieService,
    public loadService: LoadService,
  ) { }

  public ngOnInit() {
  }

  public goToOffer() {
    const url = (window as any).location.href;
    this.cookieService.set('needOffer', 1);
    (window as any).location.href = `${this.loadService.config.esiaUrl}/profile/offer?go_back=${url}`;
  }
}
