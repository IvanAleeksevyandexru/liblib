import { Injectable } from '@angular/core';
import { ConstantsService } from "../constants/constants.service";

@Injectable()
export class ConvertLangService {
  private initialized = false;
  private reverse = { }
  private full = { }

  constructor(private constants: ConstantsService) { }

  public init(lang: string): void {
    const convertLangElements = this.constants.CONVERT_LANG[lang];
    if (convertLangElements){
      this.initialized = true;

      for (const key of Object.keys(convertLangElements)) {
        this.full[key.toUpperCase()] = convertLangElements[key].toUpperCase()
        this.full[key] = convertLangElements[key]
      }

      for (const key of Object.keys(this.full)) {
        this.reverse[this.full[key]] = key;
      }
    }
  }

  public fromEng(str): string {
    if (!this.initialized) {
      return str;
    }
    return str.replace(/./g, (ch) => {
      return this.full[ch] || ch
    })
  }

  public toEng(str): string {
    if (!this.initialized) {
      return str;
    }
    return str.replace(/./g, (ch) => {
      return this.reverse[ch] || ch
    })
  }
}
