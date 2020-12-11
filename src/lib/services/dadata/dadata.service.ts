import { Injectable } from '@angular/core';
import { LoadService } from '../load/load.service';
import { HttpClient } from '@angular/common/http';
import {
  Addresses,
  FormConfig,
  NormalizedAddressElement,
  NormalizedData,
  SuggestionsResponse
} from '../../models/dadata';
import { AutocompleteSuggestion, AutocompleteSuggestionProvider } from '../../models/dropdown.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConstantsService } from '../constants.service';

@Injectable()
export class DadataService implements AutocompleteSuggestionProvider {

  private lastHouseValue = '';
  private lastApartmentValue = '';
  private qcComplete = '';
  private unparsedPart = '';
  private simpleMode = false;
  private externalUrl = '';
  private hideLevels = [];
  public suggestionsLength = 0;
  public firstInSuggestion: Addresses = null;
  public searchComplete = new BehaviorSubject<boolean>(false);
  public canOpenFields = new BehaviorSubject<boolean>(false);
  public isOpenedFields = new BehaviorSubject<boolean>(false);
  public isWidgetVisible = new BehaviorSubject<boolean>(false);

  public kladrCode = '';

  public prefixes = {
    region: {
      abbr: 'обл.',
      shortType: ''
    },
    city: {
      abbr: 'г.',
      shortType: ''
    },
    district: {
      abbr: 'р-н.',
      shortType: ''
    },
    town: {
      abbr: 'пос.',
      shortType: ''
    },
    inCityDist: {
      abbr: 'тер.',
      shortType: ''
    },
    street: {
      abbr: 'ул.',
      shortType: ''
    },
    additionalArea: {
      abbr: 'доп. тер.',
      shortType: ''
    },
    additionalStreet: {
      abbr: 'доп. ул.',
      shortType: ''
    },
    house: {
      abbr: 'д.',
      shortType: ''
    },
    building1: {
      abbr: 'корп.',
      shortType: ''
    },
    building2: {
      abbr: 'стр.',
      shortType: ''
    },
    apartment: {
      abbr: 'кв.',
      shortType: ''
    },
    index: {
      abbr: 'инд.',
      shortType: ''
    },
    geoLat: {
      abbr: 'шир.',
      shortType: ''
    },
    geoLon: {
      abbr: 'долг.',
      shortType: ''
    }
  };

  public dependencyFields = this.constants.DADATA_DEPENDENCIES;
  public errorDependencyFields = this.constants.DADATA_ERROR_DEPENDENCIES;
  public levelMap = this.constants.DADATA_LEVEL_MAP;
  public excludeToDisableFields = [11, 12, 13, 14];
  public formConfig = null;
  public form: FormGroup;
  private sixthLevelData = '';

  public initFormConfig(isOrg: boolean): FormConfig {
    this.formConfig = new FormConfig(isOrg);
    if (isOrg) {
      this.prefixes.apartment.abbr = 'оф.'
    }
    return this.formConfig;
  }

  public get qc(): string {
    return this.qcComplete;
  }

  public set qc(value: string) {
    this.qcComplete = value;
  }

  public get unparsed(): string {
    return this.unparsedPart;
  }

  public set unparsed(value: string) {
    this.unparsedPart = value;
  }

  public set externalApiUrl(url: string) {
    this.externalUrl = url;
  }

  public get externalApiUrl(): string {
    return this.externalUrl;
  }

  public set hiddenLevels(levels: Array<string>) {
    this.hideLevels = levels;
  }

  public get hiddenLevels(): Array<string> {
    return this.hideLevels;
  }

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private fb: FormBuilder,
    private constants: ConstantsService
  ) {
  }

  public initForm(isSimpleMode: boolean): void {
    this.simpleMode = isSimpleMode;
    this.form = this.fb.group({
      region: new FormControl(''),
      city: new FormControl(''),
      district: new FormControl(''),
      town: new FormControl(''),
      inCityDist: new FormControl(''),
      street: new FormControl(''),
      additionalArea: new FormControl(''),
      additionalStreet: new FormControl(''),
      house: new FormControl(''),
      houseCheckbox: new FormControl(false),
      houseCheckboxClosed: new FormControl(false),
      building1: new FormControl(''),
      building2: new FormControl(''),
      apartment: new FormControl(''),
      apartmentCheckbox: new FormControl(false),
      apartmentCheckboxClosed: new FormControl(false),
      index: new FormControl('', [Validators.maxLength(6), Validators.minLength(6)]),
      geoLat: new FormControl(''),
      geoLon: new FormControl(''),
    });

    this.initCheckboxChange('house', this.lastHouseValue);
    this.initCheckboxChange('apartment', this.lastApartmentValue);
    this.hideLevelsByDefault();
  }

  private initCheckboxChange(checkboxName: string, field: string): void {
    this.form.get(checkboxName + 'Checkbox').valueChanges.subscribe((checked: boolean) => {
      const control = this.getFormControlByName(checkboxName);
      if (checked || checked === null) {
        field = control.value;
        control.setValue('');
        control.disable({onlySelf: true});
      } else {
        control.setValue(field);
        control.enable({onlySelf: true});
      }
      this.form.get(checkboxName + 'CheckboxClosed').setValue(checked, {emitEvent: false});
    });

    this.form.get(checkboxName + 'CheckboxClosed').valueChanges.subscribe((checked: boolean) => {
      this.form.get(checkboxName + 'Checkbox').setValue(checked);
    });
  }

  public search(query: string) {
    this.firstInSuggestion = null;
    this.resetSearchComplete(false);
    this.qc = '';
    const url = `${this.externalApiUrl ? this.externalApiUrl : this.loadService.config.nsiApiUrl}dadata/suggestions`;
    return this.http.get<SuggestionsResponse>(url, {
      params: {
        q: query
      }
    }).pipe(map(res => {
      this.suggestionsLength = res.suggestions.addresses.length;
      if (this.suggestionsLength) {
        this.firstInSuggestion = res.suggestions.addresses[0];
      } else {
        this.firstInSuggestion = null;
        this.qc = '6';
        this.isWidgetVisible.next(false);
      }
      return this.suggestionsLength ? res.suggestions.addresses.map((suggestion) => new AutocompleteSuggestion(suggestion.address, suggestion)) : []
    }));
  }

  public normalize(address: string): Observable<NormalizedData> {
    const url = `${this.externalApiUrl ? this.externalApiUrl : this.loadService.config.nsiApiUrl}dadata/normalize`;
    return this.http.get<NormalizedData>(url, {
      params: {
        q: address
      }
    });
  }

  public parseAddress(data: NormalizedData, onInitCall: boolean) {
    data.address.elements.forEach((elem, index, arr) => {
      let level = elem.level;
      let strData = elem.data;

      if (elem.level === 65) {
        level = 6;
        if (this.sixthLevelData) {
          strData += this.sixthLevelData;
        }
      }

      if (level === 6 && !this.sixthLevelData) {
        this.sixthLevelData = ` (${(elem.shortType ? elem.shortType + '. ' : '') + strData})`;
      }
      if (level === 11 && this.getFormControlByName('houseCheckbox').value) {
        this.getFormControlByName('houseCheckbox').setValue(false);
      }

      this.setPrefixes(elem, level);
      this.setValueByLevel(level, strData);
      this.setDisabledByLevel(level);
      this.setVisibilityByLevel(level);

      if (elem.kladrCode) {
        this.kladrCode = elem.kladrCode;
      }

      if (index === arr.length - 1) {

        const houseControl = this.getFormControlByName('house');
        const houseCheckbox = this.getFormControlByName('houseCheckbox');
        const apartmentControl = this.getFormControlByName('apartment');
        const apartmentCheckbox = this.getFormControlByName('apartmentCheckbox');

        if (houseControl.disabled || houseCheckbox.value) {
          houseControl.disable({onlySelf: true});
        } else {
          houseControl.enable({onlySelf: true});
        }

        if (!apartmentControl.value && (apartmentControl.disabled || apartmentCheckbox.value)) {
          apartmentControl.disable({onlySelf: true});
        } else {
          const val = apartmentControl.value;
          apartmentControl.enable({onlySelf: true});
          apartmentCheckbox.setValue(false);
          apartmentControl.setValue(val);
        }

        if (onInitCall) {
          if (!houseControl.value) {
            houseCheckbox.setValue(true);
          }
          if (!apartmentControl.value) {
            apartmentCheckbox.setValue(true);
          }
        }
        this.setErrorsByLevel(level);
        this.setValidByQcCompete(data.dadataQcComplete, data.unparsedParts);
      }
    });
    if (data.address.postIndex) {
      this.setValueByLevel(100, data.address.postIndex);
    }
    if (data.geo_lat && data.geo_lon) {
      this.form.patchValue({geoLat: data.geo_lat, geoLon: data.geo_lon});
    }
  }

  public getFormControlByLevel(level: number): FormControl {
    return this.form.get(this.levelMap[level]) as FormControl;
  }

  public getFormControlByName(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  public setValueByLevel(level: number, value: string): void {
    this.getFormControlByLevel(level).setValue(value);
  }

  public setDisabledByLevel(level: number): void {
    if (this.excludeToDisableFields.indexOf(level) === -1) {
      this.getFormControlByLevel(level).disable({onlySelf: true});
    }
  }

  public setPrefixes(elem: NormalizedAddressElement, level: number) {
    // Обновление префиксов, которые приходят от сервиса
    const prefix = this.prefixes[this.levelMap[level]];
    if (prefix) {
      prefix.abbr = elem.shortType + '.' || '';
      prefix.shortType = elem.shortType + '.' || '';
    } else {
      this.prefixes[this.levelMap[level]] = {
        shortType: elem.shortType + '.' || '',
        abbr: elem.shortType + '.' || ''
      };
    }
  }

  public setVisibilityByLevel(level: number) {
    const depFieldLevels = this.dependencyFields[level];
    if (depFieldLevels && depFieldLevels.length) {
      depFieldLevels.forEach((key) => {
        const humanityLvl = this.levelMap[key];
        this.formConfig[humanityLvl].visible = this.isElementHidden(humanityLvl) ? false : !!this.getFormControlByLevel(key).value;
      });
    }
  }

  public setValidByQcCompete(qc: string, unparsed: any): void {
    const houseCheckbox = this.getFormControlByName('houseCheckbox');
    const apartmentCheckbox = this.getFormControlByName('apartmentCheckbox');
    const apartment = this.getFormControlByName('apartment');
    const building1 = this.getFormControlByName('building1');
    const isOpenedFields = this.isOpenedFields.getValue();

    this.qc = qc;
    this.unparsed = unparsed;

    if (qc !== 'valid' && +qc <= 7) {
      this.canOpenFields.next(['1', '6', '7'].indexOf(qc) === -1);
    }

    if (qc === '4') {
      if (houseCheckbox.value || this.isElementHidden('house')) {
        if (!building1.value && isOpenedFields) {
          this.formConfig.building1.isInvalid = !building1.value;
        }
      }
    }
    if ((isOpenedFields && !apartment.value && !apartmentCheckbox.value && !this.isElementHidden('apartment')) && qc !== 'valid') {
      this.formConfig.apartment.isInvalid = true;
    }
  }

  public validateCheckboxes(): { [key: string]: boolean } {
    const openedFields = this.isOpenedFields.getValue();
    const houseCheckbox = this.getFormControlByName('houseCheckbox');
    const house = this.getFormControlByName('house');
    const apartmentCheckbox = this.getFormControlByName('apartmentCheckbox');
    const apartment = this.getFormControlByName('apartment');
    let houseCb = false;
    let apartmentCb = false;
    const houseHiddenByDefault = this.isElementHidden('house');
    const apartmentHiddenByDefault = this.isElementHidden('apartment');
    if ((houseCheckbox.value && apartmentCheckbox.value) || (houseHiddenByDefault && apartmentHiddenByDefault)) {
      this.isWidgetVisible.next(false);
    } else if (!openedFields) {
      this.isWidgetVisible.next(true);
      houseCb = !houseHiddenByDefault && (!house.value && !houseCheckbox.value);
      apartmentCb = !apartmentHiddenByDefault && (!apartmentCheckbox.value && !apartment.value);
    }
    return {houseCb, apartmentCb};
  }

  public setErrorsByLevel(level: number): void {
    const errorFields = this.errorDependencyFields[level];
    if (errorFields && errorFields.length) {
      errorFields.forEach((key) => {
        const controlConfig = this.formConfig[this.levelMap[key]];
        const control = this.getFormControlByLevel(key);
        const isHiddenLvl = this.isElementHidden(this.levelMap[key]);
        let isInvalid = false;
        switch (key) {
          // Район + если не заполнен Город
          // Город + если не заполнен Район
          case 3:
          case 4:
            isInvalid = !(this.getFormControlByLevel(3).value || this.getFormControlByLevel(4).value);
            break;
          // Нас пункт + если заполнен Район
          case 6:
            isInvalid = isHiddenLvl ? false :
              this.getFormControlByLevel(3).value ? !control.value : false;
            break;
          case 7:
            isInvalid = isHiddenLvl ? false :
              this.getFormControlByLevel(4).value ?
                (this.getFormControlByLevel(6).value ? false : !control.value) : false;
            break;
          case 11: {
            const houseCheckbox = this.form.get('houseCheckbox');
            isInvalid = isHiddenLvl || houseCheckbox.value ? false : !control.value;
            break;
          }
          case 14:
            const apartmentCheckbox = this.form.get('apartmentCheckbox');
            isInvalid = isHiddenLvl || apartmentCheckbox.value ? false : !control.value;
            break;
          case 12:
          case 13: {
            if (!this.simpleMode) {
              const houseCheckbox = this.form.get('houseCheckbox');
              if (houseCheckbox.value) {
                isInvalid = !(this.getFormControlByLevel(key === 13 ? 12 : 13).value || control.value);
              } else {
                isInvalid = false;
              }
            } else {
              isInvalid = false;
            }
            break;
          }
          default:
            isInvalid = !control.value;
        }
        controlConfig.isInvalid = isInvalid;
      });
    }
  }

  public resetForm(): void {
    this.unparsed = '';
    Object.keys(this.form.controls).forEach(control => {
      const formControl = this.form.get(control);
      if (['houseCheckbox', 'apartmentCheckbox', 'houseCheckboxClosed', 'apartmentCheckboxClosed'].indexOf(control) === -1) {
        formControl.setValue('');
        formControl.enable({onlySelf: true});
      }

    });
    Object.keys(this.formConfig).forEach(key => {
      this.formConfig[key].visible = true;
    });
    this.hideLevelsByDefault();
  }

  public isElementHidden(name): boolean {
    return this.hiddenLevels.includes(name);
  }

  private hideLevelsByDefault(): void {
    this.hiddenLevels.forEach(key => {
      this.formConfig[key].visible = false;
    });
  }

  public resetSearchComplete(value: boolean): void {
    this.searchComplete.next(value);
  }

}
