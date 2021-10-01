import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonController } from '@epgu/ui/directives';
import { FooterService } from '@epgu/ui/services/footer';
import { FooterCmsComponent } from './footer-cms/footer-cms.component';

@Component({
  selector: 'lib-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

export class FooterComponent implements OnInit {

  @Input() public onlyCopyright = false;

  @ViewChild('footerCms', { read: ViewContainerRef, static: true }) private viewContainerRef;

  public hideCmsFooter: boolean;
  public hideFooter: boolean;

  constructor(
    private cfr: ComponentFactoryResolver,
    public translate: TranslateService,
    public footerService: FooterService,
    private router: Router
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
      .subscribe((event: any) => {
        this.hideFooter = this.hideCmsFooter = event.url.indexOf('/form') >= 0;
      });
  }

  public ngOnInit() {
    const cf = this.cfr.resolveComponentFactory(FooterCmsComponent);
    this.viewContainerRef.createComponent(cf, 0);
  }

}
