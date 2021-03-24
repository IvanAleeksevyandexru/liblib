import { LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TextMaskModule } from 'angular2-text-mask';
import { LibTranslateService } from './services/translate/translate.service';
import { EdsPinComponent } from './components/ds-widget/eds-pin/eds-pin.component';
import { EdsItemComponent } from './components/ds-widget/eds-item/eds-item.component';
import { EdsItemsComponent } from './components/ds-widget/eds-items/eds-items.component';
import { EdsLoaderComponent } from './components/ds-widget/eds-loader/eds-loader.component';
import { EdsErrorComponent } from './components/ds-widget/eds-error/eds-error.component';
import { ModalPlaceholderComponent } from './components/modal-placeholder/modal-placeholder.component';
import { GosbarService } from './services/gosbar/gosbar.service';
import { PsoService } from './services/pso/pso.service';
import { ConstantsService } from './services/constants.service';
import { FocusManager } from './services/focus/focus.manager';
import { PositioningManager } from './services/positioning/positioning.manager';
import { DragDropManager } from './services/drag-drop/drag-drop.manager';
import { GridComponent } from './components/grid/grid.component';
import { LoginComponent } from './components/login/login.component';
import { LogoComponent } from './components/logo/logo.component';
import { MenuComponent } from './components/menu/menu.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { CounterComponent } from './components/counter/counter.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './components/footer/footer.component';
import { FooterCmsComponent } from './components/footer/footer-cms/footer-cms.component';
import { FooterCopyrightComponent } from './components/footer/footer-copyright/footer-copyright.component';
import { ModalSearchComponent } from './components/modal-search/modal-search.component';
import { SliderBannerComponent } from './components/banner-slider/banner-slider.component';
import { StaticBannerComponent } from './components/banner-static/banner-static.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { NotifierComponent } from './components/notifier/notifier.component';
import { PageMenuComponent } from './components/page-menu/page-menu.component';
import { ActionsMenuComponent } from './components/actions-menu/actions-menu.component';
import { ButtonComponent } from './components/button/button.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ThrobberComponent } from './components/throbber/throbber.component';
import { PlainInputComponent } from './components/plain-input/plain-input.component';
import { StandardInputComponent } from './components/standard-input/standard-input.component';
import { MultilineInputComponent } from './components/multiline-input/multiline-input.component';
import { NoPermissionComponent } from './components/no-permission/no-permission.component';
import { BaseMaskedInputComponent } from './components/base-masked-input/base-masked-input.component';
import { StandardMaskedInputComponent } from './components/standard-masked-input/standard-masked-input.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { MonthYearSelectComponent } from './components/month-year-select/month-year-select.component';
import { MonthPickerComponent } from './components/month-picker/month-picker.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { DropdownSimpleComponent } from './components/dropdown-simple/dropdown-simple.component';
import { LookupComponent } from './components/lookup/lookup.component';
import { MultiLookupComponent } from './components/multi-lookup/multi-lookup.component';
import { FilteredListComponent } from './components/filtered-list/filtered-list.component';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { RangeSelectorComponent } from './components/range-selector/range-selector.component';
import { RangeFieldComponent } from './components/range-field/range-field.component';
import { RoleChangeComponent } from './components/role-change/role-change.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { RadioComponent } from './components/radio/radio.component';
import { PagingControlsComponent } from './components/paging-controls/paging-controls.component';
import { VirtualScrollComponent } from './components/virtual-scroll/virtual-scroll.component';
import { InvalidResultsTipComponent } from './components/invalid-results-tip/invalid-results-tip.component';
import { LightHeaderComponent } from './components/light-header/light-header.component';
import { ValidationMessageComponent } from './components/validation-message/validation-message.component';
import { QuestionHelpTipComponent } from './components/question-help-tip/question-help-tip.component';
import { HiddenTooltipComponent } from './components/hidden-tooltip/hidden-tooltip.component';
import { ClickOutsideDirective } from './directives/click-outside/click-out.directive';
import { StopClickPropagationDirective } from './directives/stop-click-propagation/stop-click-propagation.directive';
import { StopScreenScrollDirective } from './directives/stop-screen-scroll/stop-screen-scroll.directive';
import { YaMetricDirective } from './directives/ya-metric/ya-metric.directive';
import { OnlyNumbersDirective } from './directives/only-numbers/only-numbers.directive';
import { DragAndDropDirective} from './directives/drag-and-drop/drag-and-drop.directive';
import { VirtualForOfDirective } from './directives/virtual-for-of/virtual-for-of.directive';
import { LimitNumberPipe } from './pipes/limit-number/limit-number.pipe';
import { FormatPhonePipe } from './pipes/format-phone/format-phone.pipe';
import { FormatTimePipe } from './pipes/format-time/format-time.pipe';
import { ReplacePipe } from './pipes/replace/replace.pipe';
import { SafeHtmlPipe } from './pipes/safe-html/safe-html.pipe';
import { LocationComponent } from './components/location/location.component';
import { GosbarComponent } from './components/gosbar/gosbar.component';
import { RouterModule } from '@angular/router';
import { TabsAsideComponent } from './components/tabs-aside/tabs-aside.component';
import { FeedsComponent } from './components/feeds/feeds.component';
import { HighlightPipe } from './pipes/highlight/highlight.pipe';
import { RemoveTagsPipe } from './pipes/remove-tags/remove-tags.pipe';
import { TimeToEventPipe } from './pipes/time-to-event/time-to-event.pipe';
import { TimeLeftPipe } from './pipes/time-left/time-left.pipe';
import { ToMoneyPipe } from './pipes/to-money/to-money.pipe';
import { AppTranslatePipe, LibTranslatePipe } from './pipes/translate/translate.pipe';
import { EqueueComponent } from './components/equeue/equeue.component';
import { FeedsHeaderComponent } from './components/feeds-header/feeds-header.component';
import { CaptchaComponent } from './components/captcha/captcha.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { RemoveQuotesPipe } from './pipes/remove-quotes/remove-quotes.pipe';
import { SnippetsComponent } from './components/snippets/snippets.component';
import { LimitStringPipe } from './pipes/limit-string/limit-string.pipe';
import { DeclinePipe } from './pipes/decline/decline.pipe';
import { ConfirmActionComponent } from './components/confirm-action/confirm-action.component';
import { DocumentDetailsComponent } from './components/document-details/document-details.component';
import { FeedsGepsComponent } from './components/feeds-geps/feeds-geps.component';
import { DepartmentComponent } from './components/department/department.component';
import { SocialShareComponent } from './components/social-share/social-share.component';
import { FeedIconComponent } from './components/feed-icon/feed-icon.component';
import { DisclaimerElkComponent } from './components/disclaimer-elk/disclaimer-elk.component';
import { IntegrationBaseComponent } from './components/integration-base/integration-base.component';
import { MapComponent } from './components/map/map.component';
import { DadataWidgetComponent } from './components/dadata-widget/dadata-widget.component';
import { DadataModalComponent } from './components/dadata-modal/dadata-modal.component';
import { DisclaimerComponent } from './components/disclaimers/disclaimers.component';
import { InformerComponent } from './components/informer/informer.component';
import { ThrobberHexagonComponent } from './components/throbber-hexagon/throbber-hexagon.component';
import { AddressSaveModalComponent } from './components/address-save-modal/address-save-modal.component';
import { BetaUrlPipe } from './pipes/beta-url/beta-url.pipe';
import { ConvertSizePipe } from './pipes/convert-size/convert-size.pipe';
import { FileExtPipe } from './pipes/file-ext/file-ext.pipe';
import { RemoveColonPipe } from './pipes/remove-colon/remove-colon.pipe';
import { FileSizePipe } from './pipes/file-size/file-size.pipe';
import { SubstPipe } from './pipes/subst/subst.pipe';
import { PipedMessagePipe } from './pipes/piped-message/piped-message.pipe';
import { TimeToEventGepsPipe } from './pipes/time-to-event-geps/time-to-event-geps.pipe';
import { ValidationService } from './validators/validation.service';
import { PluralizePipe } from './pipes/pluralize/pluralize.pipe';
import { ToRomanPipe } from './pipes/to-roman/to-roman.pipe';
import { HealthService } from './services/health/health.service';
import { NotifierService } from './services/notifier/notifier.service';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { GibddDetailsComponent } from './components/gibdd-details/gibdd-details.component';
import { ImageSliderComponent  } from './components/image-slider/image-slider.component';
import { SliderImagesModalComponent } from './components/slider-images-modal/slider-images-modal.component';
import { AccordionComponent } from './components/accordion/accordion.component';
import { ExpansionPanelComponent } from './components/expansion-panel/expansion-panel.component';
import { ExpansionPanelHeaderComponent } from './components/expansion-panel/expansion-panel-header/expansion-panel-header.component';
import { TabsLightComponent } from './components/tabs-light/tabs-light.component';
import { TabsScrollingComponent } from './components/tabs-scrolling/tabs-scrolling.component';
import { CapitalLetterPipe } from './pipes/capital-letter/capital-letter.pipe';
import { LangWarnModalComponent } from './components/lang-warn-modal/lang-warn-modal.component';
import { PsoComponent } from './components/pso/pso.component';
import { DynamicFormatterPipe } from './pipes/dynamic-formatter/dynamic-formatter.pipe';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { Setting } from './models/setting';
import { MailDeliveryModalComponent } from './components/mail-delivery-modal/mail-delivery-modal.component';
import { LocationSelectComponent } from './components/location-select/location-select.component';
import { HeaderComponent } from './components/header/header.component';
import { SearchSputnikComponent } from './components/search-sputnik/search-sputnik.component';
import { FrameComponent } from './components/frame/frame.component';
import { MenuCatalogComponent } from './components/menu-catalog/menu-catalog.component';
import { MenuCatalogSimpleComponent } from './components/menu-catalog-simple/menu-catalog-simple.component';
import { SmallFooterComponent } from './components/small-footer/small-footer.component';
import { SocialLinksComponent } from './components/social-links/social-links.component';
import { ButtonForInputComponent } from './components/button-for-input/button-for-input.component';
import { LanguageSelectComponent } from './components/language-select/language-select.component';
import { RoundLoaderComponent } from './components/round-loader/round-loader.component';
import { SliderComponent } from './components/slider/slider.component';
import { CatalogTabsService } from './services/catalog-tabs/catalog-tabs.service';
import { CatalogTabsComponent } from './components/catalog-tabs/catalog-tabs.component';
import { CatalogTabsListComponent } from './components/catalog-tabs-list/catalog-tabs-list.component';
import { CatalogTabItemComponent } from './components/catalog-tab-item/catalog-tab-item.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';


registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    GridComponent,
    LoginComponent,
    LogoComponent,
    MenuComponent,
    UserMenuComponent,
    CounterComponent,
    BreadcrumbsComponent,
    DisclaimerComponent,
    InformerComponent,
    ThrobberHexagonComponent,
    FooterComponent,
    FooterCmsComponent,
    FooterCopyrightComponent,
    ModalSearchComponent,
    SearchSputnikComponent,
    ConfirmActionComponent,
    DocumentDetailsComponent,
    SliderBannerComponent,
    StaticBannerComponent,
    QuizComponent,
    NotifierComponent,
    PageMenuComponent,
    TabsComponent,
    TabsAsideComponent,
    ActionsMenuComponent,
    ButtonComponent,
    LoaderComponent,
    ThrobberComponent,
    PlainInputComponent,
    StandardInputComponent,
    MultilineInputComponent,
    NoPermissionComponent,
    BaseMaskedInputComponent,
    StandardMaskedInputComponent,
    DatePickerComponent,
    MonthYearSelectComponent,
    MonthPickerComponent,
    DropdownComponent,
    DropdownSimpleComponent,
    LookupComponent,
    MultiLookupComponent,
    FilteredListComponent,
    AutocompleteComponent,
    SearchBarComponent,
    RangeSelectorComponent,
    RangeFieldComponent,
    RoleChangeComponent,
    CheckboxComponent,
    RadioComponent,
    PagingControlsComponent,
    VirtualScrollComponent,
    InvalidResultsTipComponent,
    LightHeaderComponent,
    ValidationMessageComponent,
    QuestionHelpTipComponent,
    HiddenTooltipComponent,
    LocationComponent,
    EdsPinComponent,
    EdsItemComponent,
    EdsItemsComponent,
    EdsLoaderComponent,
    EdsErrorComponent,
    GibddDetailsComponent,
    ImageSliderComponent,
    SliderImagesModalComponent,
    ClickOutsideDirective,
    StopClickPropagationDirective,
    StopScreenScrollDirective,
    YaMetricDirective,
    OnlyNumbersDirective,
    DragAndDropDirective,
    VirtualForOfDirective,
    LimitNumberPipe,
    FormatPhonePipe,
    FormatTimePipe,
    ReplacePipe,
    SafeHtmlPipe,
    GosbarComponent,
    ModalPlaceholderComponent,
    FeedsComponent,
    FeedsGepsComponent,
    HighlightPipe,
    RemoveTagsPipe,
    TimeToEventPipe,
    TimeToEventGepsPipe,
    TimeLeftPipe,
    ToMoneyPipe,
    LibTranslatePipe,
    AppTranslatePipe,
    EqueueComponent,
    FeedsHeaderComponent,
    BackButtonComponent,
    RemoveQuotesPipe,
    ConvertSizePipe,
    SnippetsComponent,
    LimitStringPipe,
    DeclinePipe,
    SubstPipe,
    PipedMessagePipe,
    FeedsHeaderComponent,
    CaptchaComponent,
    DepartmentComponent,
    SocialShareComponent,
    FeedIconComponent,
    DisclaimerElkComponent,
    IntegrationBaseComponent,
    MapComponent,
    CaptchaComponent,
    DadataWidgetComponent,
    DadataModalComponent,
    AddressSaveModalComponent,
    ErrorPageComponent,
    BetaUrlPipe,
    FileExtPipe,
    RemoveColonPipe,
    FileSizePipe,
    PluralizePipe,
    ToRomanPipe,
    AccordionComponent,
    ExpansionPanelComponent,
    ExpansionPanelHeaderComponent,
    TabsLightComponent,
    TabsScrollingComponent,
    CapitalLetterPipe,
    LangWarnModalComponent,
    PsoComponent,
    DynamicFormatterPipe,
    MailDeliveryModalComponent,
    LocationSelectComponent,
    HeaderComponent,
    FrameComponent,
    MenuCatalogComponent,
    MenuCatalogSimpleComponent,
    SmallFooterComponent,
    SocialLinksComponent,
    ButtonForInputComponent,
    LanguageSelectComponent,
    RoundLoaderComponent,
    SliderComponent,
    CatalogTabsComponent,
    CatalogTabsListComponent,
    CatalogTabItemComponent,
    UserRolesComponent
  ],
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
    CommonModule,
    GridComponent,
    LoginComponent,
    LogoComponent,
    MenuComponent,
    UserMenuComponent,
    CounterComponent,
    BreadcrumbsComponent,
    DisclaimerComponent,
    InformerComponent,
    ThrobberHexagonComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    FooterCmsComponent,
    FooterCopyrightComponent,
    ModalSearchComponent,
    SearchSputnikComponent,
    ConfirmActionComponent,
    DocumentDetailsComponent,
    SliderBannerComponent,
    StaticBannerComponent,
    QuizComponent,
    NotifierComponent,
    PageMenuComponent,
    TabsComponent,
    TabsAsideComponent,
    ActionsMenuComponent,
    ButtonComponent,
    LoaderComponent,
    ThrobberComponent,
    PlainInputComponent,
    StandardInputComponent,
    MultilineInputComponent,
    NoPermissionComponent,
    BaseMaskedInputComponent,
    StandardMaskedInputComponent,
    DropdownComponent,
    DropdownSimpleComponent,
    LookupComponent,
    MultiLookupComponent,
    FilteredListComponent,
    AutocompleteComponent,
    SearchBarComponent,
    RangeSelectorComponent,
    RangeFieldComponent,
    RoleChangeComponent,
    CheckboxComponent,
    RadioComponent,
    MonthYearSelectComponent,
    MonthPickerComponent,
    DatePickerComponent,
    LocationComponent,
    PagingControlsComponent,
    VirtualScrollComponent,
    InvalidResultsTipComponent,
    LightHeaderComponent,
    ValidationMessageComponent,
    QuestionHelpTipComponent,
    HiddenTooltipComponent,
    GibddDetailsComponent,
    ImageSliderComponent,
    SliderImagesModalComponent,
    ClickOutsideDirective,
    StopClickPropagationDirective,
    StopScreenScrollDirective,
    YaMetricDirective,
    OnlyNumbersDirective,
    DragAndDropDirective,
    VirtualForOfDirective,
    LimitNumberPipe,
    FormatPhonePipe,
    FormatTimePipe,
    ReplacePipe,
    ToMoneyPipe,
    SafeHtmlPipe,
    DeclinePipe,
    SubstPipe,
    PipedMessagePipe,
    HighlightPipe,
    RemoveTagsPipe,
    ConvertSizePipe,
    GosbarComponent,
    ModalPlaceholderComponent,
    FeedsComponent,
    EqueueComponent,
    FeedsHeaderComponent,
    FeedsGepsComponent,
    BackButtonComponent,
    SnippetsComponent,
    FeedsHeaderComponent,
    CaptchaComponent,
    DepartmentComponent,
    SocialShareComponent,
    FeedIconComponent,
    DisclaimerElkComponent,
    IntegrationBaseComponent,
    MapComponent,
    CaptchaComponent,
    DadataWidgetComponent,
    ErrorPageComponent,
    BetaUrlPipe,
    FileExtPipe,
    RemoveColonPipe,
    FileSizePipe,
    TimeToEventPipe,
    TimeToEventGepsPipe,
    LimitStringPipe,
    PluralizePipe,
    ToRomanPipe,
    AddressSaveModalComponent,
    AccordionComponent,
    ExpansionPanelComponent,
    ExpansionPanelHeaderComponent,
    TabsLightComponent,
    TabsScrollingComponent,
    CapitalLetterPipe,
    LangWarnModalComponent,
    PsoComponent,
    RemoveQuotesPipe,
    TimeLeftPipe,
    RemoveTagsPipe,
    DynamicFormatterPipe,
    MailDeliveryModalComponent,
    LocationSelectComponent,
    HeaderComponent,
    FrameComponent,
    MenuCatalogComponent,
    ButtonForInputComponent,
    LanguageSelectComponent,
    RoundLoaderComponent,
    SliderComponent,
    MenuCatalogSimpleComponent,
    SmallFooterComponent,
    CatalogTabsComponent,
    CatalogTabsListComponent,
    CatalogTabItemComponent,
    UserRolesComponent
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
    ModalSearchComponent,
    LocationComponent,
    ConfirmActionComponent,
    DocumentDetailsComponent,
    DadataModalComponent,
    AddressSaveModalComponent,
    QuizComponent,
    FooterCmsComponent,
    EdsPinComponent,
    EdsItemsComponent,
    EdsLoaderComponent,
    EdsErrorComponent,
    GibddDetailsComponent,
    SliderImagesModalComponent,
    LangWarnModalComponent,
    MailDeliveryModalComponent,
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
