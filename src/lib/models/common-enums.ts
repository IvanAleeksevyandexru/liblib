// транслитерация текста / контента
export enum Translation {
  NONE = 'none', // отсутствует
  APP = 'app', // исппользовать переводы приложения-клиента
  LIB = 'lib' // использовать встроенные переводы из ассетов либы
}

// показ валидации на компоненте (если есть ошибка)
export enum ValidationShowOn {
  IMMEDIATE = 'immediate', // немедленно
  NEVER = 'never',  // не показывать
  TOUCHED = 'touched',  // показывать если touched
  TOUCHED_UNFOCUSED = 'touched_unfocused' // показывать если touched и не редактируется
}

// выравнивание выпадашек если не совпадает с шириной инпута
export enum Align {
  LEFT = 'left',  // по левой границе инпута
  RIGHT = 'right', // по правой границе инпута
  ADJUST = 'adjust' // адаптировать контент и растянуть/сжать
}

// направление диалогов по знаку вопроса
export enum TipDirection {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top', // вверх и вправо
  BOTTOM = 'bottom',
  TOP_LEFT = 'top-left', // вверх и влево, над полем чтобы не уходить за край под моб
  BOTTOM_LEFT = 'bottom-left'
}

// способ исправления некорректной введенной руками даты
export enum BrokenDateFixStrategy {
  NONE = 'none',  // игнорировать, попытаться закоммитить с ошибкой
  RESET = 'reset', // сбросить
  RESTORE = 'restore' // восстановить предыдущее
}

// родное свойство autocomplete input элемента (расширенное)
export enum InputAutocomplete {
  OFF = 'off',
  ON = 'on',
  PASSWORD = 'password',
  ONE_TIME_CODE = 'one-time-code'
}

// способ исправления неконсистентного текста (не соответствующего модели) на лукапе
export enum InconsistentReaction {
  IGNORE = 'ignore', // игнорировать
  RESET = 'reset', // сбросить итем
  RESTORE = 'restore' // восстановить текст в соответствии с моделью
}





