import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangWarnModalComponent } from './lang-warn-modal.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { BaseModule } from '@epgu/ui/base';


@NgModule({
    imports: [
        CommonModule,
        TranslatePipeModule,
        BaseModule,
    ],
    declarations: [
        LangWarnModalComponent
    ],
    exports: [LangWarnModalComponent]
})
export class LangWarnModalModule {
}
