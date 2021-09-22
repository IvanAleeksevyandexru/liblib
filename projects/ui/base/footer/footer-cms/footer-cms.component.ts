import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';

@Component({
  selector: 'lib-footer-cms',
  templateUrl: './footer-cms.component.html',
  styleUrls: ['./footer-cms.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterCmsComponent implements OnInit {

  public config = this.loadService.config;

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit() {

  }

}
