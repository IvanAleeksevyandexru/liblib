import { Injectable } from '@angular/core';

@Injectable()
export class LocationStrategyStub {
  public path(includeHash: boolean = false) { }
  public isCurrentPathEqualTo(path: string, query: string = '') { }
  public normalize(url: string) { }
  public prepareExternalUrl(url: string) { }
  public go(path: string, query: string = '') { }
  public replaceState(path: string, query: string = '') { }
  public forward() { }
  public back() { }
  public subscribe(onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void) | null, onReturn?: (() => void) | null) { }
}
