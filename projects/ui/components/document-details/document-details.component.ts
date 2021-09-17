import { Component, HostListener, OnInit } from '@angular/core';
import { Modal } from '@epgu/ui/models';

@Component({
  selector: 'lib-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss']
})

@Modal()

export class DocumentDetailsComponent implements OnInit {
  public title: string;
  public items: { title: string, value: string }[];

  public destroy: () => {};

  @HostListener('document:keydown', ['$event']) public onKeydownComponent(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.destroy();
    }
  }

  constructor() { }

  public ngOnInit() { }

  public onCancel(): void {
    this.destroy();
  }
}
