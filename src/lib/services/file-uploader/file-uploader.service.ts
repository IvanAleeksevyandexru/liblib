import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploaderService {

  constructor(
    private http: HttpClient
  ) { }

  public saveFileToStorage(url: string, formData: FormData): Observable<any> {
    return this.http.post(`${url}upload`, formData, {
      withCredentials: true
    });
  }

  public deleteFileFromStorage(url: string, orderId: string, objectType: string, mnemonic: string): Observable<any> {
    return this.http.delete(`${url}${orderId}/${objectType}?mnemonic=${mnemonic}`, {
      withCredentials: true
    })
  }
}
