import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FooterCmsComponent } from './footer-cms/footer-cms.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'lib-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @ViewChild('footerCms', { read: ViewContainerRef, static: true }) private viewContainerRef;

  constructor(
    private cfr: ComponentFactoryResolver,
    public translate: TranslateService
  ) { }

  public ngOnInit() {
    const cf = this.cfr.resolveComponentFactory(FooterCmsComponent);
    this.viewContainerRef.createComponent(cf, 0);

  }

}
