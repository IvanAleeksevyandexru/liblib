import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleChangeComponent } from './role-change.component';
import { TranslateModule } from '@epgu/ui/pipes';
import { FormsModule } from '@angular/forms';
import { PagingControlsModule } from '@epgu/ui/components/paging-controls';
import { HighlightModule } from '@epgu/ui/pipes';
import { SearchBarModule } from '@epgu/ui/controls';


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
