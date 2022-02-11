import { FilesExtension } from './file-link';
import { ValidationShowOn } from '@epgu/ui/models/common-enums';

export interface IFileUpload {
  size: number;
  type: string;
  lastModified: number;
  name: string;
  error: string;
  mnemonic: string;
  uploadInProcess: boolean;
  file: File;
}

export interface IFileUploadConfig {
  /** Максимальное кол-во файлов. */
  maxFilesLength: number;
  /** Максимальный размер в байтах.
   * @example 10 Mb => 5 * 1024 * 1024 = 10485760
   */
  maxFileSize: number;
  validationShowOn: ValidationShowOn;
  /** Скрыть возможность добавления фото. */
  hidePhoto: boolean;
  /** Перечисление типов файлов.
   * @example png,jpg,svg
   */
  fileTypes: FilesExtension[];
  /** Скрыть все сообщения(подсказки и ошибки). */
  withoutMessages: boolean;
}

export interface FileUploadStorageConfig {
  /** Адрес хранилища для загрузки файлов. */
  storageServiceUrl: string;
  /** Префикс мнемоники.
   *  @example mnemonic = uploadMnemonicPrefix + uid
   */
  mnemonicPrefix?: string;
  objectId: number;
}
