import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FooterCmsComponent } from './footer-cms/footer-cms.component';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'lib-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @ViewChild('footerCms', { read: ViewContainerRef, static: true }) private viewContainerRef;

  public hideCmsFooter: boolean;
  public hideFooter: boolean;

  constructor(
    private cfr: ComponentFactoryResolver,
    public translate: TranslateService,
    private router: Router
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
      .subscribe((event: any) => {
        if (event.url.indexOf('/form') !== -1) {
          this.hideFooter = this.hideCmsFooter = true;
        }
      });
  }

  public ngOnInit() {
    const cf = this.cfr.resolveComponentFactory(FooterCmsComponent);
    this.viewContainerRef.createComponent(cf, 0);

  }

}
