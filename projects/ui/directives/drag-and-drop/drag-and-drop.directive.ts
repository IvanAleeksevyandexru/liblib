import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[libDragAndDrop]'
})
export class DragAndDropDirective {

  @HostBinding('class.fileover') public filesOver: boolean;
  @Output() public filesDropped = new EventEmitter<any>();

  @HostListener('dragover', ['$event']) public onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    this.filesOver = true;
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    this.filesOver = false;
  }

  @HostListener('drop', ['$event']) public onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    this.filesOver = false;
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      this.filesDropped.emit(files);
    }
  }

  constructor() { }

}
