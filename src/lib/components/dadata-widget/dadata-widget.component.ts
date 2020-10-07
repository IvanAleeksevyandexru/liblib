import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  NgModuleRef,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { DadataService } from '../../services/dadata/dadata.service';
import { DadataResult, NormalizedData } from '../../models/dadata';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ConstantsService } from '../../services/constants.service';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { ModalService } from '../../services/modal/modal.service';
import { DadataModalComponent } from '../dadata-modal/dadata-modal.component';
import { CommonController } from '../../common/common-controller';
import { ValidationService } from '../../validators/validation.service';
import { BehaviorSubject } from 'rxjs';
import { Validated, ValidationShowOn } from "../../models/validation-show";
import { ValidationHelper } from "../../services/validation-helper/validation.helper";

@Component({
  selector: 'lib-dadata-widget',
  templateUrl: './dadata-widget.component.html',
  styleUrls: ['./dadata-widget.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DadataWidgetComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DadataWidgetComponent),
      multi: true,
    },
    DadataService
  ]
})
export class DadataWidgetComponent extends CommonController implements AfterViewInit, OnInit, ControlValueAccessor, Validated {

  @Input() public label = '';
  @Input() public specifyTitle = ''; // код трансляции для ссылки открытия формы
  @Input() public disabled?: boolean;
  @Input() public initValue?: string;
  @Input() public simpleMode = false; // отключение обязательности полей корпус и строение, если нет дома
  @Input() public normalizeOnInit = true;
  @Input() public externalApiUrl?: string;
  @Input() public clearable = true;
  // массив скрытых уровней, которые не будут заполняться ни в скрытом, ни в развернутом виде
  // каждое значение - строка - значения из константы DADATA_LEVEL_MAP
  @Input() public hideLevels?: Array<string> = [];
  @Input() public hideHouseCheckbox = false;
  @Input() public hideApartmentCheckbox = false;
  @Input() public enabledMap = false;
  @Input() public queryMinSymbolsCount = 3;
  @Input() public validateOnSpecify = true;
  @Input() public addrStrExcluded = this.constants.DADATA_ADDRSTR_EXCLUDED_FIELDS;
  @Input() public debounceTime = 100;

  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;

  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();

  public errorCodes: Array<string> = [];
  public query = '';
  public lastQuery = '';
  public blurCall = false;
  public validationSkip = false;
  // Массив полей, по которым строится полный адрес
  public controlNames: string[];
  // Поля, которые исключаются из формы для построения полного адреса
  public excluded = this.constants.DADATA_EXCLUDED_FIELDS;
  public fullAddrStrExcluded = this.constants.DADATA_FULLADDRSTR_EXCLUDED_FIELDS;
  // Массив с широтой и долготой для яндекс карты
  public center = [];
  public stateShowMap = false;
  // проверка на множественные вызовы
  public normalizeInProcess = false;
  private query$ = new BehaviorSubject('');

  public touched = false;

  // Валидация ответа от сервера
  private validateTypes = [{
    errCode: 'DADATA.NEED_REGION',
    level: 1,
    otherCase: false,
    checkLvl: 'region'
  }, {
    errCode: 'DADATA.WRONG_TOWN',
    level: 2,
    otherCase: false,
    checkLvl: 'town'
  }, {
    errCode: 'DADATA.WRONG_TOWN_OTHER_CASE',
    level: 2,
    otherCase: true,
    checkLvl: 'town'
  }, {
    errCode: 'DADATA.WRONG_STREET',
    level: 3,
    otherCase: false,
    checkLvl: 'street'
  }, {
    errCode: 'DADATA.WRONG_STREET_OTHER_CASE',
    level: 3,
    otherCase: true,
    checkLvl: 'street'
  }, {
    errCode: 'DADATA.WRONG_ADDRESS',
    level: 6,
    otherCase: false
  }, {
    errCode: 'DADATA.WRONG_COUNTRY',
    level: 7,
    otherCase: false
  }];
  private messagesByQc = ['DADATA.NEED_REGION', 'DADATA.NEED_CITY', 'DADATA.NEED_DISTRICT', 'DADATA.NEED_TOWN',
    'DADATA.NEED_IN_CITY_DIST', 'DADATA.NEED_STREET', 'DADATA.NEED_ADDITIONAL_AREA', 'DADATA.NEED_ADDITIONAL_STREET',
    'DADATA.NEED_HOUSE', 'DADATA.NEED_HOUSE_OTHER_CASE', 'DADATA.NEED_BUILDING1', 'DADATA.NEED_BUILDING2',
    'DADATA.NEED_APARTMENT', 'DADATA.NEED_APARTMENT_OTHER_CASE', 'DADATA.NEED_INDEX'];

  // Объект отображения двух чекбоксов в закрытом состоянии
  public widgetItemsVisibility: { [key: string]: boolean } = {};
  public form: FormGroup;
  // Объект, который отвечает за видимость и валидность полей
  public formConfig = this.dadataService.formConfig;
  public canOpenFields = this.dadataService.canOpenFields;
  public isOpenedFields = this.dadataService.isOpenedFields;
  @ViewChild('autocomplete', {static: false}) public autocomplete: AutocompleteComponent;

  private normalizedData: NormalizedData;
  private onTouchedCallback: () => void;
  private onValidationCallback: () => void;
  private addressStr = '';

  private commit(value: DadataResult) {
  }

  constructor(
    public dadataService: DadataService,
    private cd: ChangeDetectorRef,
    private constants: ConstantsService,
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
    public validations: ValidationService
  ) {
    super();
  }

  public ngOnInit() {
    if (this.externalApiUrl) {
      this.dadataService.externalApiUrl = this.externalApiUrl;
    }
    if (this.hideLevels) {
      this.dadataService.hiddenLevels = this.hideLevels;
    }
    this.init();
  }

  private init(): void {

    this.dadataService.initForm(this.simpleMode);

    this.form = this.dadataService.form;

    this.controlNames = Object.keys(this.form.controls).filter(key => this.excluded.indexOf(key) === -1);

    // не убирать debounceTime! агрегирует множественные изменения полей формы в единое событие!
    this.form.valueChanges.pipe(
        debounceTime(this.debounceTime),
        takeUntil(this.destroyed$)
      ).subscribe((res) => {
      const changes = this.form.getRawValue();
      const dadataQc = this.normalizedData ? this.normalizedData.dadataQc : '0';
      let fullAddress = '';
      this.addressStr = '';
      this.controlNames.forEach((control, keyIndex) => {
        const isIndex = control === 'index';
        if (changes[control] && !this.dadataService.isElementHidden(control)) {
          if (!isIndex) {
            const ctrlField = this.dadataService.prefixes[control];
            const tmpStr = (keyIndex > 0 ? ', ' : '') + (changes[control] ?
              (ctrlField.shortType || ctrlField.abbr) + ' ' + changes[control] : '');
            if (!this.fullAddrStrExcluded.includes(control)) {
              fullAddress += tmpStr;
            }
            if (!this.addrStrExcluded.includes(control)) {
              this.addressStr += tmpStr;
            }
          } else {
            fullAddress = changes[control] + ', ' + fullAddress;
          }
        }
      });
      this.lastQuery = this.query;
      this.query = fullAddress;
      if (fullAddress) {
        if (this.validationSkip) {
          this.errorCodes = [];
          this.validationSkip = false;
        } else {
          this.revalidate();
        }
        this.widgetItemsVisibility = this.dadataService.validateCheckboxes();
        if (dadataQc === '0' && !this.errorCodes.length) {
            this.autocomplete.cancelSearchAndClose();
        }
        const commitValue: DadataResult = {
          ...this.form.getRawValue(),
          fullAddress,
          addressStr: this.addressStr,
          lat: this.normalizedData.geo_lat,
          lng: this.normalizedData.geo_lon,
          fiasCode: this.normalizedData.address.fiasCode,
          okato: this.normalizedData.okato,
          hasErrors: this.errorCodes.length
        };
        this.commit(commitValue);
        this.normalizeInProcess = false;
      } else {
        this.errorCodes = [];
        this.widgetItemsVisibility = {};
        this.commit(null);
        this.normalizeInProcess = false;
      }
      if (this.blurCall && !this.isOpenedFields.getValue() && (dadataQc === '1' || dadataQc === '2') && this.normalizedData.fiasLevel !== '-1'
        && !this.externalApiUrl) {
        this.showWrongAddressDialog();
      }
    });
  }

  public openDadataFields(validateAfter = false): void {
    this.isOpenedFields.next(true);
    this.canOpenFields.next(true);
    if (!this.normalizedData) {
      this.normalizeFullAddress(this.query, true).then(() => {
        if (validateAfter) {
          this.revalidate();
        }
      });
    } else {
      if (validateAfter) {
        this.revalidate();
      }
    }
    this.autocomplete.cancelSearchAndClose();
  }

  public showWrongAddressDialog() {
    const fullAddress = this.query;
    this.modalService.popupInject(DadataModalComponent, this.moduleRef, {
      successAddress: fullAddress,
      currentAddress: this.lastQuery,
      saveHandler: () => {
        this.normalizeFullAddress(fullAddress);
      },
      returnHandler: () => {
        this.openDadataFields(false);
      }
    }, true);
  }

  public closeDadataFields() {
    this.isOpenedFields.next(false);
  }

  public toggleDadataFields() {
    const isOpened = this.isOpenedFields.getValue();
    if (isOpened) {
      this.closeDadataFields();
    } else {
      this.openDadataFields(true);
    }
  }

  public normalizeFullAddress(fullAddress: string, suppressValidation = false, onInitCall = false, blurCall = false): Promise<any> {
    if (fullAddress && !this.normalizeInProcess) {
      this.form.markAsTouched();
      // используем промис, т.к. в противном случае без сабскрайбера не вызывается сервис
      this.normalizeInProcess = true;
      return this.dadataService.normalize(fullAddress).toPromise().then(res => {
        if (res) {
          this.normalizedData = res;
          if (res.address && res.address.elements && res.address.elements.length) {
            this.blurCall = blurCall;
            this.dadataService.resetForm();
            this.dadataService.parseAddress(res, onInitCall);
            // onChange triggering guaranteed
            this.validationSkip = suppressValidation;
          }
        }
        return res;
      });
    } else {
      return Promise.resolve();
    }
  }

  public onClearHandler(): void {
    this.widgetItemsVisibility = {};
    this.form.reset();
    this.errorCodes = [];
    this.canOpenFields.next(false);
    this.updateCanOpenFields('');
    for (const key of Object.keys(this.form.controls)) {
      this.form.get(key).enable({onlySelf: true});
    }
  }

  public updateCanOpenFields(value: string): void {
    this.closeDadataFields();
    if (!value) {
      this.form.reset();
    }
    this.query$.next(value);
  }

  private revalidate() {
    this.dadataService.setErrorsByLevel(1);
    this.errorCodes = this.getErrorMessageCodes();
  }

  private getErrorMessageCodes(): Array<string> {
    const errorMessageCodes = [];
    // ошибка по уровню нормализации
    const errorByQc = this.validateTypes.find(type => {
      return type.checkLvl && this.dadataService.isElementHidden(type.checkLvl) ? false :
        type.level === +this.dadataService.qc && type.otherCase === !!this.dadataService.unparsed;
    });
    if (errorByQc && !this.isOpenedFields.getValue()) {
      errorMessageCodes.push(errorByQc.errCode);
    } else {
      // ошибки полей
      for (const c in this.formConfig) {
        if (this.formConfig[c].isInvalid && this.formConfig[c].visible) {
          errorMessageCodes.push(this.dadataService.unparsed ? this.formConfig[c].code + '_OTHER_CASE' : this.formConfig[c].code);
        }
      }
    }
    return errorMessageCodes;
  }

  public registerOnChange(fn: any): void {
    this.commit = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.isOpenedFields.next(false);
    }
  }

  public writeValue(obj: any): void {
    this.query = typeof obj === 'string' ? obj : '';
    if (this.initValue) {
      this.query = this.initValue;
    }
    if (this.query) {
      this.canOpenFields.next(true);
      if (this.normalizeOnInit) {
        this.normalizeFullAddress(this.query, true, this.normalizeOnInit);
      }
    }
    this.check();
  }

  public registerOnValidatorChange(fn: () => void): void {
    this.onValidationCallback = fn;
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    if (this.form.invalid || this.errorCodes.length || !this.query || !this.normalizedData) {
      if (this.normalizeOnInit && !this.normalizedData) {
        this.normalizeFullAddress(this.query, true);
      }
      if (this.errorCodes.length) {
        return {incorrect: true}
      }
      return undefined;
    }
    return undefined;
  }

  public handleFocus() {
    this.onTouchedCallback && this.onTouchedCallback();
    this.check();
    this.focus.emit();
  }

  public handleBlur() {
    this.blur.emit();
  }

  public ngAfterViewInit() {
    this.query$.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      if (value) {
        this.normalizeFullAddress(value, false);
      }
    });
  }

  public setCoordinatesMap() {
    this.center = [this.form.get('geoLon').value, this.form.get('geoLat').value];
  }

  public showMap(e: any) {
    e.preventDefault();
    this.setCoordinatesMap();
    this.stateShowMap = !this.stateShowMap;
  }

  public putCursorAtEnd() {
    const input = this.autocomplete.searchBar.inputElement.nativeElement;

    if (input.setSelectionRange) {
      const len = input.value.length * 2;
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(len, len);
      }, 1000)
    } else {
      input.value = input.value;
    }
  }

  public check() {
    ValidationHelper.checkValidation(this, {touched: true});
  }
}
