import {
  Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, OnDestroy, DoCheck,
  SimpleChanges, forwardRef, ElementRef, ViewChild, ChangeDetectorRef, Optional, Host, SkipSelf } from '@angular/core';
import { ControlValueAccessor, ControlContainer, AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Focusable, FocusManager } from "../../services/focus/focus.manager";
import { Validated, ValidationShowOn } from "../../models/validation-show";
import { Width } from "../../models/width-height";
import { ConstantsService } from "../../services/constants.service";
import { SearchSyncControl } from "../../models/common-enums";
import { HelperService } from "../../services/helper/helper.service";
import { ValidationHelper } from "../../services/validation-helper/validation.helper";


class ScheduledSearch {
  public constructor(query: string, token: number) {
    this.query = query;
    this.token = token;
  }
  public query: string;
  public token: number;
}

@Component({
  selector: 'lib-search-bar',
  templateUrl: 'search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchBarComponent),
    multi: true
  }]
})
export class SearchBarComponent
  implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy, ControlValueAccessor, Focusable, Validated {

  constructor(
    private changeDetector: ChangeDetectorRef,
    protected focusManager: FocusManager,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  // name привязывается к аттрибуту, чтобы привязать контрол к форме используйте formControlName
  @Input() public id?: string;
  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public contextClass?: string;  // класс-маркер разметки для deep стилей
  @Input() public maxlength?: string | number;
  @Input() public placeholder?: string;
  @Input() public tabIndex?: string | number;
  @Input() public readOnly = false;
  @Input() public disabled = false;
  @Input() public invalid = false;

  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;
  @Input() public width?: Width | string;
  @Input() public clearable = true;  // разрешает очистить поле если есть значение
  @Input() public showStaticContent = false; // разрешает показывать ng-content вместо инпута пока он не активен. активируется кликом
  @Input() public forceShowStaticContent = false; // форсирует показ ng-content-а независимо от активности инпут-поля

  @Input() public searching = false; // статус поиска (управляется снаружи), логический параметр определяющий фазу и состояние
  @Input() public suggestion: string; // строка "продолжения" фразы, если показана, то enter будет приводить к (suggestionSelected)
  @Input() public showMagnifyingGlass = true;
  @Input() public showSearching = true; // позволяет отключать показ крутилки если он не желателен, чисто стилистический параметр
  @Input() public queryTimeout = ConstantsService.DEFAULT_QUERY_DEBOUNCE;
  @Input() public queryMinSymbolsCount = 1;
  // должен ли поиск запускаться по программному изменению модели (несмотря на searchOnlyIfFocused)
  @Input() public searchOnProgrammaticChange = true;
  // контроль переполнения поиска, как обрабатывать новый запрос поиска если текущий еще в процессе
  @Input() public searchSyncControl: SearchSyncControl = SearchSyncControl.LAST_STANDING;
  // алиас для searchSyncControl = SearchSyncControl.PARALLEL, если задан true, то перекрывает searchSyncControl
  @Input() public parallelSearch = false;
  // разрешает запускать поиск только если новое значение отличается от предыдущего
  @Input() public searchUniqueOnly = false;
  // запрещает запускать новый поиск (по debounceTime вводу) если контрол уже потерял фокус
  @Input() public searchOnlyIfFocused = false;
  // запускать ли поиск по получению фокуса
  @Input() public searchOnFocus = false;
  // позволяет отменить срабатывание поиска по ентеру и иконке, только по текстовому вводу
  @Input() public searchByForcing = true;
  // позволяет отменить срабатывание поиска по текстовому вводу, только по ентеру и иконке
  @Input() public searchByTextInput = !HelperService.isTouchDevice();

  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();
  @Output() public newSearch = new EventEmitter<string>();
  @Output() public forcedSearch = new EventEmitter<any>();
  @Output() public cleared = new EventEmitter<void>();
  @Output() public suggestionSelected = new EventEmitter<string>();
  @ViewChild('input', {static: false}) public inputElement: ElementRef<HTMLInputElement>;

  public focused = false;
  public touched = false;
  public query = '';
  public invalidDisplayed = false;
  public control: AbstractControl;
  private lastEmitted = '';
  private suppressSearching = false;
  private insureSearchActiveToken = 0;
  private queryDebounce = new Subject<ScheduledSearch>();
  private querySubscription = this.refreshDebouncedSubscription();
  private searchQueue: Array<string> = [];
  private forcedSearchPrevent = false;

  private onTouchedCallback: () => void;
  protected commit(value: string) {}

  public ngOnInit() {
    this.control = this.controlContainer && this.formControlName ? this.controlContainer.control.get(this.formControlName) : null;
    if (!this.id) {
      this.id = 'search-input-' + Math.random().toString(16).slice(2);
    }
  }

  public ngAfterViewInit() {
    this.focusManager.register(this);
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'queryTimeout': {
          this.querySubscription = this.refreshDebouncedSubscription();
          break;
        }
        case 'searching': {
          if (this.searching === false && this.searchQueue.length) {
            this.dequeueUntilSearching();
          }
          break;
        }
      }
    }
    this.check();
  }

  public ngDoCheck() {
    if (this.control) {
      this.touched = this.control.touched;
    }
    this.check();
  }

  public ngOnDestroy() {
    this.focusManager.unregister(this);
  }

  public updateQuery(value: string) {
    this.query = value;
    this.suggestion = null;
    this.commit(this.query);
    if (this.searchByTextInput) {
      this.queryDebounce.next(new ScheduledSearch(value, this.insureSearchActiveToken));
    }
    this.check();
  }

  public blockInputIfNeeded(e: Event) {
    if (this.isBlocked()) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }

  public clearSearch(e: Event) {
    this.suggestion = null;
    if (!this.disabled && !this.isBlocked()) {
      this.returnFocus();
      this.query = '';
      this.commit(this.query);
      this.searchValueSkipUnconditional(this.query);
    }
    e.stopPropagation();
    this.cleared.emit();
    this.check();
  }

  // вызывается только внутри компонента
  public runOrPostponeSearch(query: string, forcedWithKey = false, forcedWithMagnifyingGlass = false) {
    if (forcedWithMagnifyingGlass) {
      this.returnFocus();
    }
    if (this.disabled || this.isBlocked() || this.searchOnlyIfFocused && !this.focused) {
      this.cancelSearch();
      return;
    } else if (this.suggestion && forcedWithKey) {
      this.query = query = query + this.suggestion;
      this.suggestionSelected.emit(query);
      this.suggestion = null;
      this.commit(this.query);
    } else {
      this.forcedSearchPrevent = false;
      if (forcedWithKey || forcedWithMagnifyingGlass) {
        this.forcedSearch.emit({query, byEnter: forcedWithKey});
        if (!this.searchByForcing) {
          this.cancelSearch();
          return;
        }
      }
      if (!this.forcedSearchPrevent) {
        this.searchValueSkipUnconditional(query);
      }
    }
  }

  public cancelSearch() {
    this.searchQueue = [];
    this.insureSearchActiveToken = ++this.insureSearchActiveToken % 1000;
    this.forcedSearchPrevent = true;
  }

  public selectSuggestion() {
    if (this.suggestion) {
      this.suggestionSelected.emit(this.query + this.suggestion);
    }
  }

  // вызывается внутри компонента И когда модель изменена программно снаружи
  public searchValueSkipUnconditional(value: string) {
    if (value && this.queryMinSymbolsCount && value.length < this.queryMinSymbolsCount) {
      return;
    } else if (this.searchUniqueOnly && value === this.lastEmitted) {
      return;
    }
    const parallelSearchAllowed = this.parallelSearch || this.searchSyncControl === SearchSyncControl.PARALLEL;
    if (this.searching && !parallelSearchAllowed) {
      this.pushInQueue(value);
    } else {
      this.lastEmitted = value;
      this.newSearch.emit(value);
    }
  }

  // возвращает true если элемент поставлен в очередь и его исполнение отложено, false иначе
  public pushInQueue(search: string) {
    // сюда мы никогда не попадаем с SearchSyncControl.PARALLEL
    if (this.searchSyncControl === SearchSyncControl.QUEUE) {
      this.searchQueue.push(search);
    } else if (this.searchSyncControl === SearchSyncControl.LAST_STANDING) {
      this.searchQueue = [search];
    } else if (this.searchSyncControl === SearchSyncControl.BLOCK) {
      // маловероятная ситуация программного изменения значения в BLOCK режиме во время поиска
      this.searchQueue = [search];
    }
  }

  public dequeueUntilSearching() {
    if (this.searchQueue.length) {
      if (this.searching) {
        return;  // ждем уведомления от ngOnChanges
      } else {
        const search = this.searchQueue.shift();
        if (search !== undefined) {
          this.searchValueSkipUnconditional(search);
          setTimeout(() => {
            // сделано асинхронным чтобы внешний обработчик поиска мог нормально запушить изменение searching флага
            this.dequeueUntilSearching();
          });
        }
      }
    }
  }

  public writeValue(value: string) {
    const prevValue = this.query;
    this.query = value || '';
    this.suggestion = null;
    if (value !== prevValue && this.searchOnProgrammaticChange) {
      this.searchValueSkipUnconditional(value || '');
    }
    this.check();
    this.changeDetector.detectChanges();
  }

  public notifyFocusEvent(e: Event) {
    this.focusManager.notifyFocusMayChanged(this, e.type === 'focus');
  }

  public handleBlur() {
    this.focused = false;
    this.suggestion = null;
    this.check();
    this.blur.emit();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.searchOnFocus && !this.suppressSearching) {
      this.searchValueSkipUnconditional(this.query);
    }
    this.check();
    this.focus.emit();
  }

  public returnFocus(e?: Event) {
    if (this.inputElement && this.inputElement.nativeElement && (!e || e.target !== this.inputElement.nativeElement)) {
      this.suppressSearching = true;
      this.setFocus();
      this.suppressSearching = false;
    }
  }

  public setFocus() {
    this.inputElement.nativeElement.focus();
    HelperService.resetSelection(this.inputElement.nativeElement);
    this.focusManager.notifyFocusMayChanged(this, true);
  }

  public setTouched(touched: boolean) {
    this.touched = touched;
  }

  public registerOnChange(fn: any): void {
    this.commit = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.check();
    this.changeDetector.detectChanges();
  }

  public check() {
    this.invalidDisplayed = ValidationHelper.checkValidation(this, {empty: !!this.query});
  }

  private isBlocked() {
    return this.searching && this.searchSyncControl === SearchSyncControl.BLOCK;
  }

  private refreshDebouncedSubscription() {
    if (!this.queryDebounce) {
      return;
    }
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
    return this.queryDebounce.pipe(debounceTime(this.queryTimeout)).subscribe((search: ScheduledSearch) => {
      if (search.token === this.insureSearchActiveToken && this.searchByTextInput) {
        this.runOrPostponeSearch(search.query);
      }
    });
  }

}
