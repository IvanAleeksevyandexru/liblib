import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MainPageService } from '../../../services/main-page/main-page.service';
import { LoadService } from '../../../services/load/load.service';

@Component({
  selector: 'lib-footer-cms',
  templateUrl: './footer-cms.component.html',
  styleUrls: ['./footer-cms.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterCmsComponent implements OnInit {

  public config = this.loadService.config;

  constructor(
    public mainPage: MainPageService,
    public loadService: LoadService
  ) {
  }

  public ngOnInit() {

  }

}
