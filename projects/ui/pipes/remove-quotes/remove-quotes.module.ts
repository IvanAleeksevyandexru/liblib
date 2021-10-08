import { NgModule } from '@angular/core';
import { RemoveQuotesPipe } from './remove-quotes.pipe';

@NgModule({
  imports: [],
  declarations: [
    RemoveQuotesPipe
  ],
  exports: [RemoveQuotesPipe],
})
export class RemoveQuotesModule {
}
