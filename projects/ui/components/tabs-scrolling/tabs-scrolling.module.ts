import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { TabsScrollingComponent } from './tabs-scrolling.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
  imports: [
    CommonModule,
    TranslatePipeModule,
    BaseModule,
    PerfectScrollbarModule
  ],
  declarations: [
    TabsScrollingComponent
  ],
  exports: [ TabsScrollingComponent ],
})
export class TabsScrollingModule { }
