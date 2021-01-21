import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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

  @Input() public hideCmsFooter: boolean; // может задаваться с вызова компоненты или по роуту

  @ViewChild('footerCms', { read: ViewContainerRef, static: true }) private viewContainerRef;

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
        this.hideFooter = this.hideCmsFooter = event.url.indexOf('/form') >= 0;
      });
  }

  public ngOnInit() {
    const cf = this.cfr.resolveComponentFactory(FooterCmsComponent);
    this.viewContainerRef.createComponent(cf, 0);

  }

}
