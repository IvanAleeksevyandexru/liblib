// tslint:disable
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { convertToParamMap, ParamMap, UrlSegment } from '@angular/router';

export class MockParams {
  constructor() { }
}

@Injectable()
export class ActivatedRouteStub {

  // ActivatedRoute.paramMap is Observable
  private subject = new BehaviorSubject(convertToParamMap(this.testParamMap));
  public paramMap = this.subject.asObservable();
  public queryParamMap = this.subject.asObservable();
  public data = this.subject.asObservable();

  // Test parameters
  private _testParamMap: ParamMap;
  private _testUrl: UrlSegment[];

  get testParamMap() {
    return this._testParamMap;
  }

  set testParamMap(params: {}) {
    this._testParamMap = convertToParamMap(params);
    this.subject.next(this._testParamMap);
  }

  get testUrl() {
    return this._testUrl;
  }

  set testUrl(url) {
    this._testUrl = url;
  }

  public url: BehaviorSubject<UrlSegment[]> = new BehaviorSubject<UrlSegment[]>([]);

  // ActivatedRoute.snapshot.paramMap
  get snapshot() {
    this.testParamMap = {};

    return {
      queryParamMap: this.testParamMap,
      paramMap: this.testParamMap,
      params: this.testParamMap,
      url: this.testUrl,
    };
  }

  public params: BehaviorSubject<MockParams> = new BehaviorSubject<MockParams>(new MockParams());
  public queryParams: BehaviorSubject<MockParams> = new BehaviorSubject<MockParams>(new MockParams());
  public fragment: BehaviorSubject<MockParams> = new BehaviorSubject<MockParams>(new MockParams());
}
// tslint:enable
