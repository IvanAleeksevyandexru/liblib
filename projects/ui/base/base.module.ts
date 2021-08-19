import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion/accordion.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from './button/button.component';
import { CaptchaComponent } from './captcha/captcha.component';
import { CounterComponent } from './counter/counter.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { ExpansionPanelComponent } from './expansion-panel/expansion-panel.component';
import { ExpansionPanelHeaderComponent } from './expansion-panel-header/expansion-panel-header.component';
import { FileExtensionIconComponent } from './file-extension-icon/file-extension-icon.component';
import { FooterCopyrightComponent } from './footer/footer-copyright/footer-copyright.component';
import { FooterComponent } from './footer/footer.component';
import { FooterCmsComponent } from './footer/footer-cms/footer-cms.component';
import { LanguageSelectComponent } from './language-select/language-select.component';
import { LoaderComponent } from './loader/loader.component';
import { LogoComponent } from './logo/logo.component';
import { MapComponent } from './map/map.component';
import { ModalPlaceholderComponent } from './modal-placeholder/modal-placeholder.component';
import { QuestionHelpTipComponent } from './question-help-tip/question-help-tip.component';
import { RoundLoaderComponent } from './round-loader/round-loader.component';
import { ThrobberComponent } from './throbber/throbber.component';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { LimitNumberModule, PipedMessageModule, TranslatePipeModule } from '@epgu/ui/pipes';
import { ClickOutsideModule, StopClickPropagationModule } from '@epgu/ui/directives';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AccordionComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    CaptchaComponent,
    CounterComponent,
    ErrorPageComponent,
    ExpansionPanelComponent,
    ExpansionPanelHeaderComponent,
    FileExtensionIconComponent,
    FooterCopyrightComponent,
    FooterComponent,
    FooterCmsComponent,
    LanguageSelectComponent,
    LoaderComponent,
    LogoComponent,
    MapComponent,
    ModalPlaceholderComponent,
    QuestionHelpTipComponent,
    RoundLoaderComponent,
    ThrobberComponent,
    UserRolesComponent
  ],
  imports: [
    CommonModule,
    TranslatePipeModule,
    LimitNumberModule,
    ClickOutsideModule,
    RouterModule,
    StopClickPropagationModule,
    PipedMessageModule
  ],
  exports: [
    AccordionComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    CaptchaComponent,
    CounterComponent,
    ErrorPageComponent,
    ExpansionPanelComponent,
    ExpansionPanelHeaderComponent,
    FileExtensionIconComponent,
    FooterCopyrightComponent,
    FooterComponent,
    FooterCmsComponent,
    LanguageSelectComponent,
    LoaderComponent,
    LogoComponent,
    MapComponent,
    ModalPlaceholderComponent,
    QuestionHelpTipComponent,
    RoundLoaderComponent,
    ThrobberComponent,
    UserRolesComponent
  ],
  entryComponents: [
    FooterCmsComponent
  ]
})
export class BaseModule { }
