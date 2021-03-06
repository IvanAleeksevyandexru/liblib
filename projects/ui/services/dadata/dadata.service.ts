import { Injectable } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { HttpClient } from '@angular/common/http';
import {
  Addresses, DadataResult,
  FormConfig, HouseAndApartmentManipulations,
  NormalizedAddressElement,
  NormalizedData,
  SuggestionsResponse
} from '@epgu/ui/models';
import { AutocompleteSuggestion, AutocompleteSuggestionProvider } from '@epgu/ui/models/dropdown';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConstantsService } from '@epgu/ui/services/constants';

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
  public firstInSuggestion = new BehaviorSubject<Addresses>(null);
  public searchComplete = new BehaviorSubject<boolean>(false);
  public canOpenFields = new BehaviorSubject<boolean>(false);
  public isOpenedFields = new BehaviorSubject<boolean>(false);
  public isWidgetVisible = new BehaviorSubject<boolean>(false);
  public addLatinValidator = false;

  public kladrCode = '';

  public prefixes = {
    region: {
      abbr: 'обл.',
      shortType: '', type: ''
    },
    city: {
      abbr: 'г.',
      shortType: '', type: ''
    },
    district: {
      abbr: 'р-н.',
      shortType: '', type: ''
    },
    town: {
      abbr: 'пос.',
      shortType: '', type: ''
    },
    inCityDist: {
      abbr: 'тер.',
      shortType: '', type: ''
    },
    street: {
      abbr: 'ул.',
      shortType: '', type: ''
    },
    additionalArea: {
      abbr: 'доп. тер.',
      shortType: '', type: ''
    },
    additionalStreet: {
      abbr: 'доп. ул.',
      shortType: '', type: ''
    },
    house: {
      abbr: 'д.',
      shortType: '', type: ''
    },
    building1: {
      abbr: 'корп.',
      shortType: '', type: ''
    },
    building2: {
      abbr: 'стр.',
      shortType: '', type: ''
    },
    apartment: {
      abbr: 'кв.',
      shortType: '', type: ''
    },
    index: {
      abbr: 'инд.',
      shortType: '', type: ''
    },
    geoLat: {
      abbr: 'шир.',
      shortType: '', type: ''
    },
    geoLon: {
      abbr: 'долг.',
      shortType: '', type: ''
    }
  };

  public skipStreetFias: string[] = [];

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

  public initForm(isSimpleMode: boolean, withCountries: boolean): void {
    this.simpleMode = isSimpleMode;
    const validation = [Validators.pattern('(^([-А-Яа-яёЁ0-9,.();№N\'_+<>\\\\/"\\sIVX]+)$)|(^$)')];
    this.form = this.fb.group({
      region: new FormControl('', validation),
      city: new FormControl('', validation),
      district: new FormControl('', validation),
      town: new FormControl('', validation),
      inCityDist: new FormControl('', validation),
      street: new FormControl('', validation),
      additionalArea: new FormControl('', validation),
      additionalStreet: new FormControl('', validation),
      house: new FormControl('', validation),
      houseCheckbox: new FormControl(false),
      houseCheckboxClosed: new FormControl(false),
      building1: new FormControl('', validation),
      building2: new FormControl('', validation),
      apartment: new FormControl('', validation),
      apartmentCheckbox: new FormControl(false),
      apartmentCheckboxClosed: new FormControl(false),
      index: new FormControl('', [Validators.maxLength(6), Validators.minLength(6)]),
      geoLat: new FormControl(''),
      geoLon: new FormControl(''),
    });

    if (withCountries) {
      this.form.addControl('country', new FormControl(''))
    }

    this.initCheckboxChange('house', this.lastHouseValue);
    this.initCheckboxChange('apartment', this.lastApartmentValue);
    this.hideLevelsByDefault();
  }

  public updateValidationPattern(addLatinValidator: boolean): void {
    this.addLatinValidator = addLatinValidator;
    const patternValidator = `А-Яа-яёЁ${addLatinValidator ? 'A-Za-z' : ''}`
    const validation = [Validators.pattern(`(^([-${patternValidator}0-9,.();№N\'_+<>\\\\/"\\sIVX]+)$)|(^$)`)];
    const controls = ['region',
      'city',
      'district',
      'town',
      'inCityDist',
      'street',
      'additionalArea',
      'additionalStreet',
      'house',
      'building1',
      'building2',
      'apartment'];
    controls.forEach(controlName => this.form.get(controlName).setValidators(validation));
    this.form.updateValueAndValidity();
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
    this.firstInSuggestion.next(null);
    this.resetSearchComplete(false);
    this.qc = '';
    const url = `${this.externalApiUrl ? this.externalApiUrl : this.loadService.config.nsiApiUrl}dadata/suggestions`;
    return this.http.get<SuggestionsResponse>(url, {
      withCredentials: true,
      params: {
        q: query
      }
    }).pipe(map(res => {
      this.suggestionsLength = res.suggestions.addresses.length;
      if (this.suggestionsLength) {
        this.firstInSuggestion.next(res.suggestions.addresses[0]);
      } else {
        this.firstInSuggestion.next(null);
        this.qc = '6';
        this.isWidgetVisible.next(false);
      }
      return this.suggestionsLength ? res.suggestions.addresses.map((suggestion) => new AutocompleteSuggestion(suggestion.address, suggestion)) : []
    }));
  }

  public normalize(address: string): Observable<NormalizedData> {
    const url = `${this.externalApiUrl ? this.externalApiUrl : this.loadService.config.nsiApiUrl}dadata/normalize`;
    return this.http.get<NormalizedData>(url, {
      withCredentials: true,
      params: {
        q: address
      }
    });
  }

  public parseAddress(data: NormalizedData, onInitCall: boolean, houseAndApartmentManipulations: HouseAndApartmentManipulations, firstDadataObject: any) {
    const needSkipStreet = !!data.address.elements.find(item => item.level === 4 && this.skipStreetFias.includes(item.fiasCode))
    data.address.elements.forEach((elem, index, arr) => {
      let level = elem.level;
      let strData = elem.data;

      if (elem.level === 65) {
        level = 6;
        if (this.sixthLevelData) {
          strData += this.sixthLevelData;
        }
      }

      if (level === 3 && elem.type === 'город') {
        const cityElem = arr.find(item => item.level === 4);
        if (!cityElem) {
          level = 4;
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

        if (firstDadataObject?.fiasCode === data.address.fiasCode) {
          const building1Control = this.getFormControlByName('building1');
          const building2Control = this.getFormControlByName('building2');
          const indexControl = this.getFormControlByName('index');
          if (!houseControl.value && firstDadataObject.house) {
            houseControl.setValue(firstDadataObject.house)
          }
          if (!apartmentControl.value && firstDadataObject.apartment) {
            apartmentControl.setValue(firstDadataObject.apartment)
          }
          if (!apartmentControl.value && firstDadataObject.apartment) {
            apartmentControl.setValue(firstDadataObject.apartment)
          }
          if (!building1Control.value && firstDadataObject.building1) {
            building1Control.setValue(firstDadataObject.building1)
          }
          if (!building2Control.value && firstDadataObject.building2) {
            building2Control.setValue(firstDadataObject.building2)
          }
          if (!indexControl.value && firstDadataObject.index) {
            this.setValueByLevel(100, firstDadataObject.index);
          }
        }

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
          if (!houseControl.value && !houseAndApartmentManipulations.hideHouseCheckbox) {
            houseCheckbox.setValue(true);
          }
          if (!apartmentControl.value && !houseAndApartmentManipulations.hideApartmentCheckbox) {
            apartmentCheckbox.setValue(true);
          }
        }

        if (houseAndApartmentManipulations.selectHouseCheckbox) {
          houseCheckbox.setValue(true);
        }
        if (houseAndApartmentManipulations.selectApartmentCheckbox) {
          apartmentCheckbox.setValue(true);
        }

        this.setErrorsByLevel(level, needSkipStreet);
        this.setValidByQcCompete(data.dadataQcComplete, data.unparsedParts);
      }
    });
    if (data.address.postIndex) {
      this.setValueByLevel(100, data.address.postIndex);
    } else {
      this.setErrorsByLevel(100, needSkipStreet);
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
      prefix.type = elem.type;
    } else {
      this.prefixes[this.levelMap[level]] = {
        shortType: elem.shortType + '.' || '',
        abbr: elem.shortType + '.' || '',
        type: elem.type || ''
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

  public setErrorsByLevel(level: number, needSkipStreet: boolean = false): void {
    const errorFields = this.errorDependencyFields[level];
    const patternValidator = `А-Яа-яёЁ${this.addLatinValidator ? 'A-Za-z' : ''}`
    if (errorFields && errorFields.length) {
      errorFields.forEach((key) => {
        const controlConfig = this.formConfig[this.levelMap[key]];
        const control = this.getFormControlByLevel(key);
        const isHiddenLvl = this.isElementHidden(this.levelMap[key]);
        controlConfig.regExpInvalid = !new RegExp(`(^([-${patternValidator}0-9IVXLCivxlc,.();№N\'_+<>\\\\/"\\s]+)$)|(^$)`).test(control.value ? control.value : '');
        let isInvalid = false;
        if (!controlConfig.regExpInvalid) {
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
            // Улица
            case 7: {
              if (needSkipStreet) {
                isInvalid = false;
              } else {
                isInvalid = isHiddenLvl ? false :
                  this.getFormControlByLevel(4).value ?
                    (this.getFormControlByLevel(6).value ? false : !control.value) : false;
              }
              break;
            }
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
        }
        controlConfig.isInvalid = controlConfig.regExpInvalid || isInvalid;
      });
    }
  }

  public resetForm(): void {
    this.unparsed = '';
    Object.keys(this.form.controls).forEach(control => {
      const formControl = this.form.get(control);
      if (['houseCheckbox', 'apartmentCheckbox', 'houseCheckboxClosed', 'apartmentCheckboxClosed', 'country'].indexOf(control) === -1) {
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

  public addTypesToCommitValue(commitValue: DadataResult): void {
    for (const key of Object.keys(commitValue)) {
      if (['geoLat', 'geoLon', 'index'].indexOf(key) === -1 && this.prefixes[key] && commitValue[key]) {
        commitValue[`${key}Type`] = this.prefixes[key].type;
        commitValue[`${key}ShortType`] = this.prefixes[key].shortType.replace('.', '');
      }
    }
  }

  public addAddressInfoToCommitValue(commitValue: DadataResult, normalizedElements: Array<NormalizedAddressElement>): void {
    normalizedElements.forEach(elem => {
      const elemName = this.levelMap[elem.level];
      commitValue[`${elemName}Kladr`] = elem.kladrCode;
      commitValue[`${elemName}Fias`] = elem.fiasCode;
    });
  }

}
