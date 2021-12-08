import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageMenuComponent } from './page-menu.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PageMenuComponent
  ],
  exports: [ PageMenuComponent ],
})
export class PageMenuModule { }
