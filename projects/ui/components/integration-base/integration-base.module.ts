import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationBaseComponent } from './integration-base.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    IntegrationBaseComponent
  ],
  exports: [ IntegrationBaseComponent ],
})
export class IntegrationBaseModule { }
