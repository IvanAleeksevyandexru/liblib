import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { FooterService } from '@epgu/ui/services/footer';
import { MainFooter, MainFooterBlockLink } from '@epgu/ui/models';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { HelperService } from '@epgu/ui/services/helper';

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
    if (HelperService.isMpWebView()) {
      this.footerService.setVisible(false);
    }
  }

  public openLink(event: Event, link: MainFooterBlockLink): void {
    event.preventDefault();
    this.sendMetric(link);
  }

  public sendMetric(link: MainFooterBlockLink): void {
    const yaParams = {
      footer: [link.title]
    }

    if (this.loadService.config.isYaMetricEnabled) {
      this.yaMetric.callReachGoal('footer', yaParams, () => {
        setTimeout(() => {
          if (link.target === '_blank') {
            window.open(link.url, '_blank', 'noopener noreferrer');
          } else {
            location.href = link.url;
          }
        }, 300);
      });
    } else {
      if (link.target === '_blank') {
        window.open(link.url, '_blank', 'noopener noreferrer');
      } else {
        location.href = link.url;
      }
    } 
  }
}
