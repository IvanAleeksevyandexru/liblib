export interface FileLink {
  objectId: number | string;
  objectTypeId: number | string;
  mnemonic: string;
}

export interface File {
  text: string;
  typeOfFile?: FilesExtension; // Тип файла, по которому картинка подхватится
  weight?: string; // Вес файла в формате: 1.4 Мб
  actions?: FileActions[]; // Действия с файлом
}

export interface FileActions {
  title: string; // Название действия
  link: string; // Ссылка
  target?: '_self' | '_blank' | '_parent' | '_top'; // По умолчанию _blank
}

export type FilesExtension = 'xls' | 'csv' | // таблицы
  'png' | 'jpg' | 'pcx' | 'bmp' | 'tif' | 'gif' | // изображения
  'key' | 'pps' | 'ppt' | // презентации
  'pdf' | // PDF
  'rar' | 'zip' | // архивы
  'doc' | 'txt' | 'rtf' | // тексты
  'flv' | 'mp4' | 'avi' | 'mkv' | 'mov' | 'mpg' | // видео
  'sig' | 'xml' | // прочее
  'x_x' | '***'; // ошибка | неизвестное
