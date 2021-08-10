import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtmlModule } from '@epgu/ui/pipes/safe-html';
import { SearchBarComponent } from './search-bar.component';
// import { ButtonModule } from '../button/button.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SafeHtmlModule,
    // ButtonModule
  ],
  declarations: [
    SearchBarComponent
  ],
  exports: [ SearchBarComponent ],
})
export class SearchBarModule { }
