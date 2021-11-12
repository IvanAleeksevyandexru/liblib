export interface IButton {
  /** Тип: кнопка, ссылка, с иконкой поиска.
   *  По умолчанию - кнопка(button)
   */
  type?: 'button' | 'anchor' | 'search' | 'new-search';
  /** Размер. По умолчанию - маленький('') */
  size?: 'md' | 'lg' | '';
  /** Цвет заливки:по умолчанию - синий */
  fontSize?: number | null;
  /** Дизейбл кнопки. По умолчанию активное. */
  color?: '' | 'white' | 'transparent';
  /** Ширина: 100% родительского контейнера,
   *  если не указан - размер ограничен шириной текста
   */
  width?: 'wide' | '';
  /** Высота, по умолчанию зависит от размера.
   * Если dynamic, то height: auto;
   */
  height?: 'dynamic' | '';
  /** Дополнительный размер-шрифта.
   *  Добавляет font-{{fontSize}} к <button>
   */
  disabled?: boolean;
  /** Внешняя ссылка при type = anchor */
  link?: string;
  /** Изменяет таргет при type = anchor. По умолчанию '_self' */
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Внутренняя ссылка при type = anchor.
   *  Устанавливается для [routerLink]
   */
  internalLink?: string;
  /** Троббер в виде трех точек,
   * необходимо использовать в связке с width - 'wide'
   */
  showLoader?: boolean;
  /** Тема отображения кнопки для нового дизайна */
  theme?: 'light' | 'light left-btn' | 'light right-btn' | '';
  /** Тип button. По умолчанию button */
  buttonType?: 'submit' | 'reset' | 'button';
}

export type ModalButtonType = IButton & {
  title: string;
  handler: (...args: any[]) => void;
  confirm: boolean;
};
