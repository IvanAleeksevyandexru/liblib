import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion.component';
import { ExpansionPanelModule } from '../expansion-panel/expansion-panel.module';

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
