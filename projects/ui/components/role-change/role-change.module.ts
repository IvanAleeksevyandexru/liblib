import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleChangeComponent } from './role-change.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { FormsModule } from '@angular/forms';
import { PagingControlsModule } from '@epgu/ui/components/paging-controls';
import { HighlightModule } from '@epgu/ui/pipes';
import { ControlsModule } from '@epgu/ui/controls';


@NgModule({
    imports: [
        CommonModule,
        TranslatePipeModule,
        ControlsModule,
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
