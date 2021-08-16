import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpansionPanelComponent } from './expansion-panel.component'
import { ExpansionPanelHeaderModule } from '../expansion-panel-header';

@NgModule({
  imports: [
    CommonModule,
    ExpansionPanelHeaderModule
  ],
  declarations: [
    ExpansionPanelComponent
  ],
  exports: [
    ExpansionPanelComponent
  ],
})
export class ExpansionPanelModule { }
