import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion.component';
import { ExpansionPanelModule } from '../expansion-panel';

@NgModule({
  imports: [
    CommonModule,
    ExpansionPanelModule
  ],
  declarations: [
    AccordionComponent
  ],
  exports: [ AccordionComponent ],
})
export class AccordionModule { }
