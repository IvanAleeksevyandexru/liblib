import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Self,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { ValidationHelper } from '@epgu/ui/services/validation-helper';
import { Validated } from '@epgu/ui/models/validation-show';
import { FileUploaderService } from '@epgu/ui/services/file-uploader';
import { v4 as uuidv4 } from 'uuid';
import { ValidationShowOn } from '@epgu/ui/models/common-enums';
import { LoadService } from '@epgu/ui/services/load';

import {
  FilesExtension,
  IFileUpload,
  IFileUploadConfig,
  FileUploadStorageConfig,
} from '@epgu/ui/models';
import { HelperService } from '@epgu/ui/services/helper';
import { takeUntil } from 'rxjs/operators';
import { CommonController } from '@epgu/ui/directives';
import { FileSizePipe } from '@epgu/ui/pipes';

@Component({
  selector: 'lib-file-drop-control',
  templateUrl: './file-drop-control.component.html',
  styleUrls: ['./file-drop-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileDropControlComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileDropControlComponent),
      multi: true,
    },
    FileSizePipe,
  ],
})
export class FileDropControlComponent
  extends CommonController
  implements OnInit, ControlValueAccessor, Validated, DoCheck
{
  @Input()
  public config: Partial<IFileUploadConfig>;

  @Input()
  public storageConfig?: FileUploadStorageConfig;

  @Input()
  public outsideValidators: ((filelist: FileList) => boolean | string)[] = [];
  @Input()
  public outsideAsyncValidators: ((
    filelist: FileList,
  ) => Promise<boolean | string>)[] = [];

  @ViewChild('fileInput', { static: false })
  public fileInput: ElementRef;
  @ViewChild('photoInput', { static: false })
  public photoInput: ElementRef;

  private defaultConfig: IFileUploadConfig = {
    maxFilesLength: 1,
    maxFileSize: 10485760,
    validationShowOn: ValidationShowOn.TOUCHED,
    hidePhoto: false,
    fileTypes: [],
    withoutMessages: false,
  };

  // tslint:disable-next-line: variable-name
  private _files: IFileUpload[] | null = null;
  public get files(): IFileUpload[] {
    return this._files?.filter(({ size }) => size > 0) ?? [];
  }
  public set files(files: IFileUpload[]) {
    this._files = files?.filter(({ size }) => size > 0) ?? [];
  }

  public invalidDisplayed: boolean;
  public errorMessage = '';
  public acceptedTypes = '';

  public invalid = false;
  public validationShowOn: ValidationShowOn | string | boolean | any =
    ValidationShowOn.TOUCHED;
  public onChanged: (FileList: IFileUpload[]) => void;
  public onTouched: () => void;

  public staticDomainLibAssetsPath =
    this.loadService.config.staticDomainLibAssetsPath;

  constructor(
    private fileUploaderService: FileUploaderService,
    private cdr: ChangeDetectorRef,
    private loadService: LoadService,
    @Self() private fileSizePipe: FileSizePipe,
  ) {
    super();
  }

  @HostListener('change', ['$event.target.files'])
  public async emitFiles(files: FileList) {
    this.onTouched();
    if (!this.files) {
      this.files = [];
    }
    this.errorMessage = '';
    const maxFilesSize = this.checkMaxFilesSize(files);
    const filesLength = this.checkFilesLength(files.length);
    const needUploadToServer = !!this.storageConfig;

    if (!maxFilesSize || !filesLength) {
      this.resetInputs();
      return false;
    }

    if (this.files?.length > this.config.maxFilesLength) {
      this.errorMessage =
        'Можно загрузить только ' +
        this.config.maxFilesLength +
        HelperService.pluralize(this.config.maxFilesLength, [
          'файл',
          'файла',
          'файлов',
        ]);
      return false;
    }

    if (this.outsideValidators?.length) {
      for (const fn of this.outsideValidators) {
        const result = fn(files);
        if (typeof result === 'string') {
          this.errorMessage = result;
          return false;
        }
      }
    }
    if (this.outsideAsyncValidators?.length) {
      for (const fn of this.outsideAsyncValidators) {
        const result = await fn(files);

        if (typeof result === 'string') {
          this.errorMessage = result;
          this.cdr.detectChanges();
          return false;
        }
      }
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const fileExist = this.checkFileExisting(files[i]);

      if (fileExist) {
        this.errorMessage = `Файл уже загружен: ${files[i].name}`;
      }

      if (files[i].size === 0) {
        this.errorMessage = `Не удалось загрузить файл ${files[i].name}. Файл не должен быть пустым`;
      }

      const checkType = this.checkFileTypes(files[i]);

      if (!fileExist && checkType && files[i].size > 0) {
        const name = decodeURI(encodeURIComponent(files[i].name));

        const file: IFileUpload = {
          mnemonic: this.getFileMnemonicByPrefix(
            this.storageConfig?.mnemonicPrefix,
          ),
          uploadInProcess: needUploadToServer,
          name,
          size: files[i].size,
          type: files[i].type,
          error: '',
          file: files[i],
          lastModified: files[i].lastModified,
        };
        this.files = [...this.files, file];
        this.cdr.detectChanges();
        if (needUploadToServer) {
          const formData = new FormData();
          formData.append('file', files[i]);
          formData.append('name', file.name);
          if (this.storageConfig?.objectId) {
            formData.append('objectType', '2');
            formData.append('objectId', this.storageConfig.objectId.toString());
          }
          formData.append('mnemonic', file.mnemonic);
          this.saveFileToServer(formData, file);
        }
      }
    }

    if (!needUploadToServer) {
      this.onChanged(this.files);
      this.check();
    }
    this.resetInputs();
  }

  public ngOnInit() {
    if (this.config) {
      this.config = { ...this.defaultConfig, ...this.config };
    } else {
      this.config = this.defaultConfig;
    }

    this.validationShowOn = this.config.validationShowOn;
    this.acceptedTypes = this.config.fileTypes?.map(t => '.' + t).join(',');
  }

  public ngDoCheck() {
    this.check();
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {
      touched: true,
    });
  }

  // CVA Start >
  public writeValue(outsideValue: null | []) {
    if (outsideValue?.length) {
      this.files = outsideValue;
    } else {
      this.files = null;
    }
    this.check();
    this.cdr.detectChanges();
  }

  public registerOnChange(fn: () => void) {
    this.onChanged = fn;
  }

  public registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    if (this.errorMessage || this.files?.some(file => file.error)) {
      this.cdr.markForCheck();
      return { fileUploadInvalid: true };
    }
    this.cdr.markForCheck();
    return null;
  }
  // CVA End <

  private saveFileToServer(formData: FormData, file: IFileUpload): void {
    const process = (f: IFileUpload, withError: boolean) => {
      if (withError) {
        f.error = 'Во время загрузки возникла ошибка';
      }
      f.uploadInProcess = false;
      this.onChanged(this.files);
      this.check();
      this.cdr.detectChanges();
    };

    this.fileUploaderService
      .saveFileToStorage(this.storageConfig?.storageServiceUrl, formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => {
          process(file, false);
        },
        () => {
          process(file, true);
        },
      );
  }

  public onFilesDropped(event: FileList) {
    this.emitFiles(event);
  }

  public checkFileExisting(file: File): IFileUpload {
    return this.files.find(existingFile => {
      return (
        existingFile.name === file.name &&
        existingFile.lastModified === file.lastModified &&
        existingFile.size === file.size
      );
    });
  }

  public checkFileTypes(file: File) {
    const extName = file.name.split('.').pop().toLowerCase() as FilesExtension;
    if (this.config.fileTypes.indexOf(extName) === -1) {
      this.errorMessage = `Расширение загружаемого файла ${extName} не входит в список разрешенных: ${this.config.fileTypes}`;
      return false;
    }
    return true;
  }

  public checkFilesLength(length: number): boolean {
    const filesLength = this.files?.length ?? 0;
    const newFilesLength = filesLength + length;

    if (newFilesLength > this.config.maxFilesLength) {
      this.errorMessage = `Максимальное количество файлов: ${this.config.maxFilesLength}`;
      return false;
    }

    return true;
  }

  public checkMaxFilesSize(files: FileList): boolean {
    if (this.config.maxFileSize && files?.length) {
      const filesToArray = Array.from(files);
      const currentSize = this.files?.reduce((sum, file) => {
        const fileSize = isNaN(file.size) ? 0 : file.size;
        return sum + fileSize;
      }, 0);
      const fullSize = filesToArray.reduce((sum, file) => {
        const fileSize = isNaN(file.size) ? 0 : file.size;
        return sum + fileSize;
      }, 0);
      if (currentSize + fullSize > this.config.maxFileSize) {
        this.errorMessage = `Нельзя загрузить ${
          filesToArray.length > 1 ? 'файлы' : 'файл'
        } размером более ${this.fileSizePipe.transform(
          this.config.maxFileSize,
        )}`;
        return false;
      }
    }
    return true;
  }

  public remove(index: number): void {
    const deleteProcess = (
      i: number,
      dFile: IFileUpload,
      withError: boolean,
    ) => {
      if (withError) {
        dFile.error = 'Во время удаления возникла ошибка';
      }
      dFile.uploadInProcess = false;
      this.files = this.files.filter((file, fileIndex) => fileIndex !== i);
      this.errorMessage = '';
      this.onChanged(this.files);
      this.check();
      this.cdr.detectChanges();
    };
    this.resetInputs();

    this.onTouched();
    const deletedFile = this.files[index];
    if (!!this.storageConfig && !deletedFile.error) {
      deletedFile.uploadInProcess = true;
      this.fileUploaderService
        .deleteFileFromStorage(this.storageConfig.storageServiceUrl, {
          mnemonic: this.files[index].mnemonic,
          objectId: this.storageConfig.objectId,
          objectTypeId: '2',
        })
        .pipe(takeUntil(this.destroyed$))
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

  public getFileMnemonicByPrefix(prefix: string): string {
    const uid = uuidv4 ? uuidv4() : '';
    const prefixStr = prefix || '';
    return prefixStr + uid;
  }

  private resetInputs(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }
}
