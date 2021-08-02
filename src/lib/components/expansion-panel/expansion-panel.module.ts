import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpansionPanelHeaderModule } from '../expansion-panel-header/expansion-panel-header.module';
import { ExpansionPanelComponent } from './expansion-panel.component';

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
