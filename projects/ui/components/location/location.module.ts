import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from './location.component';
import { TranslatePipeModule } from '@epgu/ui/pipes';
import { ControlsModule } from '@epgu/ui/controls';
import { BaseModule } from '@epgu/ui/base';
import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [
        CommonModule,
        TranslatePipeModule,
        ControlsModule,
        BaseModule,
        FormsModule,
    ],
    declarations: [
        LocationComponent
    ],
    exports: [
        LocationComponent
    ]
})
export class LocationModule {
}
