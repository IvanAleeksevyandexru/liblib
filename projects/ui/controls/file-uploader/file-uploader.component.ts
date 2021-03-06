import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  forwardRef,
  Host,
  HostListener,
  Input,
  OnInit,
  Optional,
  SkipSelf, ViewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors
} from '@angular/forms';
import { ValidationHelper } from '@epgu/ui/services/validation-helper';
import { Validated } from '@epgu/ui/models/validation-show';
import { FileUploaderService } from '@epgu/ui/services/file-uploader';
import { v4 as uuidv4 } from 'uuid';
import { ValidationShowOn } from '@epgu/ui/models/common-enums';


const FILE_TYPES = ['png', 'jpg', 'jpeg', 'bmp', 'tif', 'gif', 'key', 'ppt', 'pdf', 'rar', 'zip', 'doc', 'txt', 'rtf', 'flv', 'mov', 'mpg', 'sig', 'xml'];

export interface FileUpload {
  size: number;
  type: string;
  lastModified: number;
  name: string;
  error: string;
  mnemonic: string;
  uploadInProcess: boolean;
  file: File;
}
/** @deprecated Кандидат на удаление. Использовать FileDropControlComponent(lib-file-drop-control) */
@Component({
  selector: 'lib-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploaderComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileUploaderComponent),
      multi: true,
    },
  ]
})
export class FileUploaderComponent implements OnInit, ControlValueAccessor, Validated, DoCheck {
  public get files(): FileUpload[] | null {
    return this.filesValue?.filter(({size}) => size > 0);
  }

  public set files(files: FileUpload[] | null) {
    this.filesValue = files?.filter(({size}) => size > 0);
  }

  constructor(private host: ElementRef<HTMLInputElement>,
              private fileUploaderService: FileUploaderService,
              private cd: ChangeDetectorRef,
              @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {
  }

  public control: AbstractControl;
  @Input() public formControlName?: string;
  @Input() public multiple?: boolean;
  @Input() public invalid = false;
  // типы файлов строка через , без пробелов
  // png,jpg
  @Input() public fileTypes?: string;
  @Input() public maxFilesLength?: number;
  // в байтах максимальный размер
  // 5Mb = 10485760 = 5 * 1024 * 1024
  @Input() public maxFileSize?: number;
  @Input() public orderId?: number;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public storageServiceUrl = '';
  @Input() public uploadMnemonicPrefix = '';
  @Input() public hidePhoto: boolean;

  @ViewChild('fileInput', {static: false}) public fileInput: ElementRef;
  @ViewChild('photoInput', {static: false}) public photoInput: ElementRef;

  public invalidDisplayed: boolean;
  public onChange: (FileList) => void;
  public touched = false;
  public fileTypesArray: string[];
  public errorMessage = '';

  private filesValue: FileUpload[] | null = null;
  private commit(value: any) {}


  @HostListener('change', ['$event.target.files']) public emitFiles( event: FileList ) {
    this.touched = true;
    if (!this.files) {
      this.files = [];
    }
    this.errorMessage = '';
    const maxFilesSize = this.checkMaxFilesSize(event);
    const filesLength = this.checkFilesLength(event.length);
    const needUploadToServer = this.storageServiceUrl && !!this.orderId;

    if (!maxFilesSize || !filesLength) {
      this.fileInput.nativeElement.value = '';
      this.photoInput.nativeElement.value = '';
      return false;
    }

    if (!this.multiple && this.files && this.files.length) {
      this.errorMessage = 'Нельзя загрузить больше одного файла';
      return false;
    }

    for (let i = 0; i < event.length; i++) {
      const existingFile = this.findFile(event[i]);
      if (existingFile) {
        this.errorMessage = `Файл уже загружен: ${  event[i].name}`;
      }

      if (event[i].size === 0) {
        this.errorMessage = `Не удалось загрузить файл ${  event[i].name  }. Файл не должен быть пустым`;
      }

      const checkType = this.checkFileTypes(event[i]);
      if (!existingFile && checkType && event[i].size > 0) {
        const name = unescape(encodeURIComponent(event[i].name));
        const file: FileUpload = {
          mnemonic: this.getFileMnemonicByPrefix(this.uploadMnemonicPrefix),
          uploadInProcess: needUploadToServer,
          name: event[i].name,
          size: event[i].size,
          type: event[i].type,
          error: '',
          file: event[i],
          lastModified: event[i].lastModified
        };
        this.files = [...this.files, file];

        if (needUploadToServer) {
          const formData = new FormData();
          formData.append('file', event[i]);
          formData.append('name', file.name);
          if (this.orderId) {
            formData.append('objectType', '2');
            formData.append('objectId', this.orderId.toString());
          }
          formData.append('mnemonic', file.mnemonic);
          this.saveFileToServer(formData, this.files[this.files.length - 1]);
        }
      }
    }

    if (!needUploadToServer) {
      this.commit(this.files);
      this.check();
    }
    this.fileInput.nativeElement.value = '';
    this.photoInput.nativeElement.value = '';
  }

  private saveFileToServer(formData: FormData, file: FileUpload): void {
    const process =  (f: FileUpload, withError: boolean) => {
      if (withError) {
        f.error = 'Во время загрузки возникла ошибка';
      }
      f.uploadInProcess = false;
      this.commit(this.files);
      this.check();
      this.cd.detectChanges();
    };

    this.fileUploaderService.saveFileToStorage(this.storageServiceUrl, formData).subscribe(() => {
      process(file, false);
    }, err => {
      process(file, true);
    });
  }

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    if (this.fileTypes) {
      this.fileTypesArray = this.fileTypes.toLowerCase().split(',');
    }
  }

  private findFile(file): FileUpload {
    return this.files.find(existingFile => {
      return (
        existingFile.name         === file.name &&
        existingFile.lastModified === file.lastModified &&
        existingFile.size         === file.size
        // existingFile.type         === file.type
      );
    });
  }

  public writeValue( value: null | [] ) {
    this.host.nativeElement.value = '';
    if (value?.length) {
      this.files = value;
    } else {
      this.files = null;
    }
    this.check();
    this.cd.detectChanges();
  }

  public registerOnChange( fn: () => void ) {
    this.commit = fn;
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
    const fileType = nameArr[nameArr.length - 1].toLowerCase();
    if (this.fileTypes) {
      if (this.fileTypesArray.indexOf(fileType) < 0) {
        this.errorMessage = `Расширение загружаемого файла не входит в список разрешенных: ${file.name}`;
        result = false;
      }
    }
    return result;
  }

  public checkFilesLength(length) {
    const filesLength = this.files ? this.files.length : 0;
    const newFilesLength = filesLength + length;

    const multipleCondition = this.multiple ? this.maxFilesLength : 1;

    if (this.maxFilesLength || !this.multiple) {
      if ((newFilesLength > multipleCondition)) {
        this.errorMessage = `Максимальное количество файлов: ${multipleCondition}`;
        return false;
      }
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
        this.errorMessage = `Не удалось загрузить файл. Размер файла не должен превышать ${this.formatBytes(this.maxFileSize)}`;
        return false;
      }
    }
    return true;
  }

  public remove(index: number): void {
    const deleteProcess = (i: number, dFile: FileUpload, withError: boolean) => {
      if (withError) {
        dFile.error = 'Во время удаления возникла ошибка';
      }
      dFile.uploadInProcess = false;
      this.files = this.files.filter((file, fileIndex) => fileIndex !== i);
      this.commit(this.files);
      this.check();
      this.cd.detectChanges();
    };

    this.fileInput.nativeElement.value = '';
    this.photoInput.nativeElement.value = '';
    this.touched = true;
    const deletedFile = this.files[index];

    if (this.storageServiceUrl && this.orderId && !deletedFile.error) {
      deletedFile.uploadInProcess = true;
      this.fileUploaderService
        .deleteFileFromStorage(this.storageServiceUrl, {
          objectId: this.orderId.toString(),
          objectTypeId: '2',
          mnemonic: deletedFile.mnemonic,
        })
        .subscribe(
          () => {
            deleteProcess(index, deletedFile, false);
          },
          () => {
            deleteProcess(index, deletedFile, true);
          },
        );
    } else {
      deleteProcess(index, deletedFile, false);
    }
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    if (this.errorMessage || this.files?.some(file => file.error)) {
      return {fileUploadInvalid: true};
    }
    return null;
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {touched: true});
  }

  public formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0 б';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))  } ${  sizes[i]}`;
  }

  public getFileMnemonicByPrefix(prefix) {
    const uid = uuidv4 ? uuidv4() : '';
    const prefixStr = prefix || '';
    return prefixStr + uid;
  }
}

