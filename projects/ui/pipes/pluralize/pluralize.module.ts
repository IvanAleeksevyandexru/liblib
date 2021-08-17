import { NgModule } from '@angular/core';
import { PluralizePipe } from './pluralize.pipe';

@NgModule({
  imports: [],
  declarations: [
    PluralizePipe
  ],
  exports: [PluralizePipe],
  providers: [ PluralizePipe ]
})
export class PluralizeModule {
}
