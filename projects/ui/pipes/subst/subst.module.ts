import { NgModule } from '@angular/core';
import { SubstPipe } from './subst.pipe';

@NgModule({
  imports: [],
  declarations: [
    SubstPipe
  ],
  exports: [ SubstPipe ],
})
export class SubstModule { }
