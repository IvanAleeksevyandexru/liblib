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
  // типы файлов строка через , без пробелов
  // png,jpg
  @Input() public fileTypes = '';
  @Input() public maxLength = 0;
  // в байтах максимальный размер
  // 5Mb = 10485760 = 5 * 1024 * 1024
  @Input() public maxFileSize = 0;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;

  public invalidDisplayed: boolean;
  public onChange: (FileList) => void;
  public files: File[] | null = null;
  public touched = false;
  public fileTypesArray: string[];
  public errorMessage = '';


  @HostListener('change', ['$event.target.files']) public emitFiles( event: FileList ) {
    this.touched = true;
    if (!this.files) {
      this.files = [];
    }
    this.errorMessage = '';
    console.log('$event.target.files', event);
    const maxFilesSize = this.checkMaxFilesSize(event);
    const filesLength = this.checkFilesLength(event.length);
    if (!maxFilesSize || !filesLength) {
      return false;
    }
    for (let i = 0; i < event.length; i++) {
      const existingFile = this.findFile(event[i]);
      const checkType = this.checkFileTypes(event[i]);
      if (!existingFile && checkType) {
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
    if (this.fileTypes) {
      this.fileTypesArray = this.fileTypes.split(',');
    }
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

  public checkFileTypes(file) {
    let result = true;
    const nameArr = file.name.split('.');
    const fileType = nameArr[nameArr.length - 1];
    if (this.fileTypes) {
      if (this.fileTypesArray.indexOf(fileType) < 0) {
        this.errorMessage = `Расширение загружаемого файла не входит в список разрешенных: ${file.name}`;
        result = false;
      }
    }
    return result;
  }

  public checkFilesLength(length) {
    if (this.maxLength) {
      return length <= this.maxLength;
    }
    return true;
  }

  public checkMaxFilesSize(files: FileList) {
    if (this.maxFileSize && files && files.length) {
      const filesToArray = Array.from(files);
      const currentSize = this.files.reduce((sum, file) => {
        const fileSize = isNaN(file.size) ? 0 : file.size;
        return sum + fileSize;
      }, 0);
      const fullSize = filesToArray.reduce((sum, file) => {
        const fileSize = isNaN(file.size) ? 0 : file.size;
        return sum + fileSize;
      }, 0);
      if (currentSize + fullSize > this.maxFileSize) {
        this.errorMessage = `Максимальный размер файлов превышает ${this.sizeInMB(this.maxFileSize)}`;
        return false;
      }
    }
    return true;
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
