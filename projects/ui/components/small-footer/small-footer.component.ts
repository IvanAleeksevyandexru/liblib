import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { MainFooter, MainFooterBlockLink } from '@epgu/ui/models';

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

  public getTarget(link: MainFooterBlockLink): string {
    return link.needReload ? '_self' : link.newTab ? '_blank' : null;
  }

}
