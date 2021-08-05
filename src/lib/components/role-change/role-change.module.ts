import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleChangeComponent } from './role-change.component';
import { TranslateModule } from '../../pipes/translate/translate.module';
import { SearchBarModule } from 'epgu-lib/lib/components/search-bar';
import { FormsModule } from '@angular/forms';
import { PagingControlsModule } from 'epgu-lib/lib/components/paging-controls';
import { HighlightModule } from '../../pipes/highlight/highlight.module';


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
