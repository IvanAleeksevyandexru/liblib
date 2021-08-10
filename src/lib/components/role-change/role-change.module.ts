import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleChangeComponent } from './role-change.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { FormsModule } from '@angular/forms';
import { PagingControlsModule } from '../paging-controls/paging-controls.module';
import { HighlightModule } from '../../pipes/highlight/highlight.module';
import { SearchBarModule } from '../search-bar/search-bar.module';


@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        SearchBarModule,
        FormsModule,
        PagingControlsModule,
        HighlightModule,
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
