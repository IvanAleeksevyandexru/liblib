import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotifierService } from '@epgu/ui/services/notifier';
import { NotifierComponent } from './notifier.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { NotifierSetting } from '@epgu/ui/models/notifier';

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
  public static forRoot(setting?: NotifierSetting): ModuleWithProviders<NotifierModule> {
    return {
      ngModule: NotifierModule,
      // services that should stay and be exported as singletons, not instantiated second time for child app modules
      providers: [
        NotifierService,
        {
          provide: 'notifierSetting',
          useValue: setting ? setting : {}
        }
      ]
    };
  }
}
