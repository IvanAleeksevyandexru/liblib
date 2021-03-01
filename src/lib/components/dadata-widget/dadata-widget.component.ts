import {
  AfterViewInit,
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
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, take, takeUntil } from 'rxjs/operators';
import { ConstantsService } from '../../services/constants.service';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors, Validators,
} from '@angular/forms';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { ModalService } from '../../services/modal/modal.service';
import { DadataModalComponent } from '../dadata-modal/dadata-modal.component';
import { CommonController } from '../../common/common-controller';
import { ValidationService } from '../../validators/validation.service';
import { BehaviorSubject } from 'rxjs';
import { Validated, ValidationShowOn } from "../../models/validation-show";
import { ValidationHelper } from "../../services/validation-helper/validation.helper";
import { ListItem, ListItemConverter } from "../../models/dropdown.model";

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
  // код трансляции для ссылки открытия формы
  @Input() public specifyTitle = '';
  @Input() public disabled?: boolean;
  @Input() public initValue?: string;
  // отключение обязательности полей корпус и строение, если нет дома
  @Input() public simpleMode = false;
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
  // флаг для отображения другой ошибки для поля квартира
  @Input() public isOrg = false;

  @Input() public invalid = false;
  @Input() public validationShowOn: ValidationShowOn | string | boolean | any = ValidationShowOn.TOUCHED;

  @Input() public skipStreetFias: string[] = ['ec44c0ee-bf24-41c8-9e1c-76136ab05cbf'];
  // выпадающий список список со странами
  @Input() public countries: Array<ListItem | any> = [];
  // предзаполненное значение
  @Input() public defaultCountry: { id: string, [key: string]: any };
  // для преобразования countries из any в ListItem
  @Input() public converter?: ListItemConverter;

  @Output() public focus = new EventEmitter<any>();
  @Output() public blur = new EventEmitter<any>();

  public errorCodes: Array<string> = [];
  public query = '';
  public historyQuery = '';
  public lastQuery = '';
  public needReplaceQuery = false;
  public blurCall = false;
  public validationSkip = false;

  // для onBlur нормализации отменяет показ списка саджестов
  public disableOpening = false;

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
  public formConfig = null;
  public canOpenFields = this.dadataService.canOpenFields;
  public isOpenedFields = this.dadataService.isOpenedFields;
  public indexMask = this.validations.masks.index;
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

    if (this.skipStreetFias.length) {
      this.dadataService.skipStreetFias = this.skipStreetFias;
    }
    this.init();
  }

  private init(): void {

    this.formConfig = this.dadataService.initFormConfig(this.isOrg);

    const withCountries = this.countries.length > 0;
    this.dadataService.initForm(this.simpleMode, withCountries);

    this.form = this.dadataService.form;

    if (withCountries && this.defaultCountry) {
      const country = this.form.get('country');
      country.valueChanges.subscribe(value => {
        let validators = [Validators.maxLength(6), Validators.minLength(6)];
        this.indexMask = this.validations.masks.index;
        if (value?.id !== this.defaultCountry?.id) {
          validators = [Validators.minLength(1)];
          this.indexMask = null;
          this.dadataService.resetForm();
          this.errorCodes = [];
          this.needReplaceQuery = false;
          this.query = '';
          this.canOpenFields.next(true);
        }
        this.form.get('index').setValidators(validators)
      });
      country.setValue(this.defaultCountry)
    }

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
      this.controlNames
        .filter(item => item !== 'country')
        .forEach((control, keyIndex) => {
          const isIndex = control === 'index';
          if (changes[control] && !this.dadataService.isElementHidden(control)) {
            if (!isIndex) {
              const ctrlField = this.dadataService.prefixes[control];
              const tmpStr = ((keyIndex > 0 && fullAddress) ? ', ' : '') + (changes[control] ?
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
      this.query = fullAddress;
      if (fullAddress) {
        if (this.validationSkip) {
          this.errorCodes = [];
          this.validationSkip = false;
        } else {
          this.revalidate();
        }
        this.lastQuery = this.query;
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
          hasErrors: this.errorCodes.length,
          kladrCode: this.dadataService.kladrCode,
          regionCode: (this.dadataService.kladrCode && this.dadataService.kladrCode.substring(0, 2)) || ''
        };
        this.dadataService.addKladrToCommitValue(commitValue, this.normalizedData.address.elements)
        this.normalizeInProcess = false;
        this.commit(commitValue);
      } else {
        this.errorCodes = [];
        this.widgetItemsVisibility = {};
        this.normalizeInProcess = false;
        this.commit(null);
      }
      if (this.blurCall && !this.isOpenedFields.getValue() && (dadataQc === '1' || dadataQc === '2') && this.normalizedData.fiasLevel !== '-1' && !this.externalApiUrl) {
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
    if (!this.normalizeInProcess) {
      this.widgetItemsVisibility = this.dadataService.validateCheckboxes();
    }
  }

  public toggleDadataFields() {
    const isOpened = this.isOpenedFields.getValue();
    if (isOpened) {
      this.closeDadataFields();
    } else {
      this.openDadataFields(true);
    }
  }

  public normalizeFullAddress(fullAddress: string,
                              suppressValidation = false,
                              onInitCall = false,
                              blurCall = false,
                              selectAddress = false): Promise<any> {
    const success = (res) => {
      if (res) {
        this.normalizedData = res;
        if (res.address && res.address.elements && res.address.elements.length) {
          this.needReplaceQuery = this.dadataService.suggestionsLength === 1 || blurCall || onInitCall;
          this.blurCall = blurCall;
          this.dadataService.resetForm();
          this.dadataService.parseAddress(res, onInitCall, this.hideHouseCheckbox, this.hideApartmentCheckbox);
          // onChange triggering guaranteed
          if (selectAddress) {
            this.validationSkip = false;
          } else {
            this.validationSkip = !this.needReplaceQuery || suppressValidation
          }
        }
      }
    }
    if (fullAddress && !this.normalizeInProcess) {
      this.form.markAsTouched();
      // используем промис, т.к. в противном случае без сабскрайбера не вызывается сервис
      this.normalizeInProcess = true;
      this.commit(null);
      let query = fullAddress;
      if (blurCall) {
        this.disableOpening = true;
        this.dadataService.searchComplete.pipe(filter(res => !!res), take(1),
          switchMap(data => {
            query = this.dadataService.firstInSuggestion ? this.dadataService.firstInSuggestion.address : query;
            return this.dadataService.normalize(query).pipe(
              take(1),
              finalize(() => this.disableOpening = false));
          }))
          .subscribe(res => {
            success(res);
            return res;
          }, error => {
            this.normalizeInProcess = false;
          });
        return Promise.resolve()
      }
      return this.dadataService.normalize(query).toPromise().then(res => {
        success(res);
        return res;
      }, err => {
        this.normalizeInProcess = false;
      });
    } else {
      return Promise.resolve();
    }
  }

  public onClearHandler(): void {
    this.widgetItemsVisibility = {};
    this.form.reset();
    this.errorCodes = [];
    this.needReplaceQuery = false;
    this.query = '';
    this.canOpenFields.next(false);
    this.changeQueryHandler('');
    for (const key of Object.keys(this.form.controls)) {
      this.form.get(key).enable({onlySelf: true});
    }
  }

  public changeQueryHandler(value: string): void {
    this.dadataService.resetSearchComplete(false);
    if (this.isOpenedFields.getValue()) {
      this.closeDadataFields();
    }
    if (!value) {
      this.form.reset();
      this.canOpenFields.next(false);
    }
    if (this.countries?.length && this.defaultCountry) {
      this.form.get('country').setValue(this.defaultCountry);
    }
    this.query$.next(value);
  }

  private revalidate() {
    const needSkipStreet = this.normalizedData ?
      !!this.normalizedData.address.elements.find(item => item.level === 4 && this.skipStreetFias.includes(item.fiasCode)) : false;
    this.dadataService.setErrorsByLevel(1, needSkipStreet);
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
          if (c === 'apartment') {
            errorMessageCodes.push(this.formConfig[c].code);
          } else {
            errorMessageCodes.push(this.dadataService.unparsed ? this.formConfig[c].code + '_OTHER_CASE' : this.formConfig[c].code);
          }
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
    if (this.normalizeInProcess) {
      return {inProcess: true};
    }
    if (this.form.invalid || this.errorCodes.length || !this.query || !this.normalizedData) {
      if (this.normalizeOnInit && !this.normalizedData) {
        this.normalizeFullAddress(this.query, true);
      }
      if (this.errorCodes.length || this.form.invalid) {
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
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      this.errorCodes = [];
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
