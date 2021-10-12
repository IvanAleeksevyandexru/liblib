import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-button',
  templateUrl: 'button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit, AfterViewChecked {
  @Input() public type: 'button' | 'anchor' | 'search' | 'new-search' = 'button'; // тип: кнопка, ссылка, с иконкой поиска
  @Input() public size: 'md' | 'lg' | '' = ''; // размер: средний, большой; если не указан - размер минимальный
  @Input() public fontSize: number | null; // размер-шрифта
  @Input() public color: 'white' | 'transparent' | '' = ''; // цвет: белый; если не указан - синий
  @Input() public width: 'wide' | '' = ''; // размер: 100% родительского контейнера, если не указан - размер ограничен шириной текста
  @Input() public height: 'dynamic' | '' = '';
  @Input() public disabled = false; // состояние: по умолчанию - активное
  @Input() public link = ''; // внешняя ссылка
  @Input() public target = ''; // присвоить _blank, что бы внешняя ссылка открылась в новом окне
  @Input() public internalLink = ''; // внутренняя ссылка, которая попадёт в атрибут routerLink
  @Input() public showLoader = false; // троббер в виде трех точек, необходимо использовать в связке с width - 'wide'
  @Input() public theme: 'light' | 'light left-btn' | 'light right-btn' | '' = ''; // тема отображения кнопки для нового дизайна
  @Input() public buttonType: 'submit' | 'reset' | 'button' = 'button';

  @ViewChild('contentData', {static: false}) content: ElementRef;

  public active = false;
  public smallPaddings = false;

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }

  public ngOnInit() {

  }

  public ngAfterViewChecked() {
    if (this.content?.nativeElement && !this.smallPaddings) {
      this.smallPaddings = this.content.nativeElement.innerHTML.length > 16;
      this.cd.detectChanges();
    }
  }

  public onClick(event: Event): void {
    if (this.disabled || this.showLoader) {
      event.stopPropagation();
    }
  }

  public setActive(active: boolean) {
    this.active = active;
  }

}