import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { FooterService } from '@epgu/ui/services/footer';
import { MainFooter, MainFooterBlockLink } from '@epgu/ui/models';
import { YaMetricService } from '@epgu/ui/services/ya-metric';

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
    public loadService: LoadService,
    public footerService: FooterService,
    public yaMetric: YaMetricService
  ) {
  }

  public ngOnInit(): void {
  }

  public openLink(event: Event, link: MainFooterBlockLink): void {
    event.preventDefault();
    this.sendMetric(link);
  }

  public sendMetric(link: MainFooterBlockLink): void {
    this.yaMetric.callReachGoal('footer', ['footer', link.title], () => {
      if (link.target === '_blank') {
        window.open(link.url, '_blank', 'noopener noreferrer');
      } else {
        location.href = link.url;
      }
    });
  }
}
