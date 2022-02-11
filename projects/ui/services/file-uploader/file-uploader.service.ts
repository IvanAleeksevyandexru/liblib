import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileLink } from '@epgu/ui/models';

@Injectable({
  providedIn: 'root',
})
export class FileUploaderService {
  constructor(private http: HttpClient) {}

  public saveFileToStorage(url: string, formData: FormData): Observable<any> {
    return this.http.post(`${url}upload`, formData, {
      withCredentials: true,
    });
  }

  public deleteFileFromStorage(url: string, file: FileLink): Observable<any> {
    return this.http.delete(
      `${url}${file.objectId}/${file.objectTypeId}?mnemonic=${file.mnemonic}`,
      {
        withCredentials: true,
      },
    );
  }
}
