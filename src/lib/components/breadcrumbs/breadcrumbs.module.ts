import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { BreadcrumbsComponent } from './breadcrumbs.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [
    BreadcrumbsComponent
  ],
  exports: [ BreadcrumbsComponent ],
})
export class BreadcrumbsModule { }
