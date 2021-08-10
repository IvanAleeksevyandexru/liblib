import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { FooterCmsComponent } from './footer-cms/footer-cms.component';
import { FooterCopyrightComponent } from './footer-copyright/footer-copyright.component';
import { ExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { AccordionModule } from '../accordion/accordion.module';
import { TranslateModule } from '../../pipes/translate/translate.module';


@NgModule({
  imports: [
    CommonModule,
    ExpansionPanelModule,
    AccordionModule,
    TranslateModule,
  ],
  declarations: [
    FooterCmsComponent,
    FooterComponent,
    FooterCopyrightComponent
  ],
  exports: [FooterComponent, FooterCmsComponent, FooterCopyrightComponent],
})
export class FooterModule {
}
