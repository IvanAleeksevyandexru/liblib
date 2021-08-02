import { LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TextMaskModule } from 'angular2-text-mask';
import { LibTranslateService } from './services/translate/translate.service';
import { EdsPinComponent } from './components/ds-widget/eds-pin/eds-pin.component';
import { EdsItemsComponent } from './components/ds-widget/eds-items/eds-items.component';
import { EdsLoaderComponent } from './components/ds-widget/eds-loader/eds-loader.component';
import { EdsErrorComponent } from './components/ds-widget/eds-error/eds-error.component';
import { GosbarService } from './services/gosbar/gosbar.service';
import { PsoService } from './services/pso/pso.service';
import { ConstantsService } from './services/constants/constants.service';
import { FocusManager } from './services/focus/focus.manager';
import { PositioningManager } from './services/positioning/positioning.manager';
import { DragDropManager } from './services/drag-drop/drag-drop.manager';
import { FooterCmsComponent } from './components/footer/footer-cms/footer-cms.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { LocationComponent } from './components/location/location.component';
import { RouterModule } from '@angular/router';
import { ToMoneyPipe } from './pipes/to-money/to-money.pipe';
import { DeclinePipe } from './pipes/decline/decline.pipe';
import { ConfirmActionComponent } from './components/confirm-action/confirm-action.component';
import { DocumentDetailsComponent } from './components/document-details-to-lk/document-details.component';
import { DadataModalComponent } from './components/dadata-modal/dadata-modal.component';
import { AddressSaveModalComponent } from './components/address-save-modal/address-save-modal.component';
import { FileExtPipe } from './pipes/file-ext/file-ext.pipe';
import { RemoveColonPipe } from './pipes/remove-colon/remove-colon.pipe';
import { ValidationService } from './validators/validation.service';
import { PluralizePipe } from './pipes/pluralize/pluralize.pipe';
import { HealthService } from './services/health/health.service';
import { NotifierService } from './services/notifier/notifier.service';
import { GibddDetailsComponent } from './components/gibdd-details-to-lk/gibdd-details.component';
import { SliderImagesModalComponent } from './components/image-slider/slider-images-modal/slider-images-modal.component';
import { CapitalLetterPipe } from './pipes/capital-letter/capital-letter.pipe';
import { LangWarnModalComponent } from './components/lang-warn-modal/lang-warn-modal.component';
import localeRu from '@angular/common/locales/ru';
import { Setting } from './models/setting';
import { MailDeliveryModalComponent } from './components/mail-delivery-modal-to-lk/mail-delivery-modal.component';
import { SocialLinksComponent } from './components/social-links/social-links.component';
import { CatalogTabsService } from './services/catalog-tabs/catalog-tabs.service';


registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    TextMaskModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    GosbarService,
    ConstantsService,
    ValidationService,
    FocusManager,
    PositioningManager,
    DragDropManager,
    PsoService,
    DeclinePipe,
    PluralizePipe,
    FileExtPipe,
    RemoveColonPipe,
    HealthService,
    ToMoneyPipe,
    CapitalLetterPipe,
    SocialLinksComponent,
    CatalogTabsService,
    {
      provide: LOCALE_ID,
      useValue: 'ru'
    }
  ],
  entryComponents: [
    // LocationComponent,
    // ConfirmActionComponent,
    // DocumentDetailsComponent,
    // DadataModalComponent,
    // AddressSaveModalComponent,
    // QuizComponent,
    // FooterCmsComponent,
    // EdsPinComponent,
    // EdsItemsComponent,
    // EdsLoaderComponent,
    // EdsErrorComponent,
    // GibddDetailsComponent,
    // SliderImagesModalComponent,
    // LangWarnModalComponent,
    // MailDeliveryModalComponent,
  ]
})
export class EpguLibModule {
  public static forRoot(setting?: Setting): ModuleWithProviders<EpguLibModule> {
    return {
      ngModule: EpguLibModule,
      // services that should stay and be exported as singletons, not instantiated second time for child app modules
      providers: [
        GosbarService,
        PsoService,
        ConstantsService,
        LibTranslateService,
        NotifierService,
        FocusManager,
        PositioningManager,
        DragDropManager,
        {
          provide: 'notifierSetting',
          useValue: setting ? setting.notifier : {}
        }
      ]
    };
  }

  public static forChild(): ModuleWithProviders<EpguLibModule> {
    return {
      ngModule: EpguLibModule,
      providers: [
        ConstantsService
      ]
    };
  }
}
