import { Component, DoCheck, ElementRef, Host, HostListener, Input, OnInit, Optional, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationHelper } from '../../services/validation-helper/validation.helper';
import { Validated, ValidationShowOn } from '../../models/validation-show';

const FILE_TYPES = ['png', 'jpg', 'bmp', 'tif', 'gif', 'key', 'ppt', 'pdf', 'rar', 'zip', 'doc', 'txt', 'rtf', 'flv', 'mov', 'mpg', 'sig', 'xml'];

@Component({
  selector: 'lib-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploaderComponent,
      multi: true
    }
  ]
})
export class FileUploaderComponent implements OnInit, ControlValueAccessor, Validated, DoCheck {

  public control: AbstractControl;
  @Input() public formControlName?: string;
  @Input() public multiple?: boolean;
  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;

  public invalidDisplayed: boolean;
  public onChange: (FileList) => void;
  public files: File[] | null = null;
  public touched = false;


  @HostListener('change', ['$event.target.files']) public emitFiles( event: FileList ) {
    this.touched = true;
    if (!this.files) {
      this.files = [];
    }

    for (let i = 0; i < event.length; i++) {
      const existingFile = this.findFile(event[i]);
      if (!existingFile) {
        this.files.push(event[i]);
      }
    }

    this.onChange(this.files);
    this.check();
  }

  constructor(private host: ElementRef<HTMLInputElement>,
              @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {
  }

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
  }

  private findFile(file): File {
    return this.files.find(existingFile => {
      return (
        existingFile.name         === file.name &&
        existingFile.lastModified === file.lastModified &&
        existingFile.size         === file.size &&
        existingFile.type         === file.type
      );
    });
  }

  public writeValue( value: null ) {
    // clear file input
    this.host.nativeElement.value = '';
    this.files = null;
  }

  public registerOnChange( fn: () => void ) {
    this.onChange = fn;
  }

  public registerOnTouched( fn: () => void ) {
  }

  public ngDoCheck() {
    if (this.control) {
      this.touched = this.control.touched;
    }
    this.check();
  }

  public onFilesDropped(event: FileList) {
    this.emitFiles(event);
  }

  public sizeInMB(size: number): string {
    return (size / (1024 * 1024)).toFixed(2) + ' Мб';
  }

  public extension(fileName: string): string {
    const nameArr = fileName.split('.');
    const ext = nameArr[nameArr.length - 1].toLowerCase();

    if (FILE_TYPES.indexOf(ext) < 0) {
      return 'err';
    }
    return ext;
  }

  public remove(index: number): void {
    this.touched = true;
    this.files.splice(index, 1);

    this.onChange(this.files);
    this.check();
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {touched: true});
  }
}
