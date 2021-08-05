import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtmlModule } from '../../pipes/safe-html/safe-html.module';
import { SearchBarComponent } from './search-bar.component';
import { ButtonModule } from '@epgu/epgu-lib/lib/components/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SafeHtmlModule,
    ButtonModule
  ],
  declarations: [
    SearchBarComponent
  ],
  exports: [ SearchBarComponent ],
})
export class SearchBarModule { }
