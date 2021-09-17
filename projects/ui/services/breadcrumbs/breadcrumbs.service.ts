import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Link } from '@epgu/ui/models';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  private links: BehaviorSubject<Link[]> = new BehaviorSubject<Link[]>([]);
  public links$ = this.links.asObservable();

  constructor() { }

  public remove() {
    this.links.next([]);
  }

  public setLinks(data: Link[]) {
    this.links.next(data);
  }

  public getLinks(): Link[] {
    return this.links.getValue();
  }
}
