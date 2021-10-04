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

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
  }

}
