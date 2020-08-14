import { BehaviorSubject } from 'rxjs';
import { Routes, UrlSerializer, UrlTree, NavigationExtras } from '@angular/router';
import { Compiler, Injector, NgModuleFactoryLoader, Type, Injectable } from '@angular/core';

@Injectable()
export class RouterStub {
  public url = '';
  public events: BehaviorSubject<any> = new BehaviorSubject<any>('');
  public params: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  public navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
    const promise: Promise<boolean> = new Promise((resolve: any) => {
      return resolve(true);
    });
    return promise;
  }

  public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    const promise: Promise<boolean> = new Promise((resolve: any) => {
      return resolve(true);
    });
    return promise;
  }

  public createUrlTree() {
    return new UrlTree();
  }

  public serializeUrl() {
    return '';
  }

  public parseUrl() {
    const parsed = new UrlTree();

    parsed.queryParams = {};
    return parsed;
  }

  public getCurrentNavigation() {
    return {
      extras: {}
    };
  }
}
