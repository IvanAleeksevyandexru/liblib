import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { CookieService } from '../../services/cookie/cookie.service';

@Component({
  selector: 'lib-no-permission',
  templateUrl: './no-permission.component.html',
  styleUrls: ['./no-permission.component.scss']
})
export class NoPermissionComponent implements OnInit {

  @Input() public text: string;
  @Input() public button: string;

  constructor(
    private loadService: LoadService,
    private cookieService: CookieService
  ) { }

  public ngOnInit() {
  }

  public goToOffer() {
    const url = (window as any).location.href;
    this.cookieService.set('needOffer', 1);
    (window as any).location.href = `${this.loadService.config.esiaUrl}/profile/offer?go_back=${url}`;
  }
}
