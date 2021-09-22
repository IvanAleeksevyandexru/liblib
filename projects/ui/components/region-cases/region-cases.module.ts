import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionCasesComponent } from './region-cases.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RegionCasesComponent
  ],
  exports: [
    RegionCasesComponent
  ],
})
export class RegionCasesModule {
}
