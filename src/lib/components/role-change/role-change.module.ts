import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleChangeComponent } from './role-change.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { FormsModule } from '@angular/forms';
import { PagingControlsModule } from '../paging-controls/paging-controls.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SearchBarModule,
    FormsModule,
    PagingControlsModule,
  ],
  declarations: [
    RoleChangeComponent
  ],
  exports: [
    RoleChangeComponent
  ],
})
export class RoleChangeModule {
}
