import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  hasKey(key: string): boolean {
    return !!this.get(key);
  }

  get<T>(key: string): T {
    const rawItem = this.getRaw(key);
    return JSON.parse(rawItem) as T;
  }

  getRaw(key: string): string {
    return localStorage.getItem(key);
  }

  set<T>(key: string, data: T): void {
    const rawItem = JSON.stringify(data);
    this.setRaw(key, rawItem);
  }

  setRaw(key: string, data: string): void {
    localStorage.setItem(key, data);
  }

  delete(key: string): void {
    localStorage.removeItem(key);
  }
}
