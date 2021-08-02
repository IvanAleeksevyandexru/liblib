import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Setting } from '../../models/setting';
import { NotifierService } from '../../services/notifier/notifier.service';
import { NotifierComponent } from './notifier.component';
import { TranslateModule } from '../../pipes/translate/translate.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: [
    NotifierComponent
  ],
  exports: [
    NotifierComponent
  ],
})
export class NotifierModule {
  public static forRoot(setting?: Setting): ModuleWithProviders<NotifierModule> {
    return {
      ngModule: NotifierModule,
      // services that should stay and be exported as singletons, not instantiated second time for child app modules
      providers: [
        NotifierService,
        {
          provide: 'notifierSetting',
          useValue: setting ? setting.notifier : {}
        }
      ]
    };
  }
}
