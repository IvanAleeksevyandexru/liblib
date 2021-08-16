import { Component, Input } from '@angular/core';
import { BreadcrumbsService } from '@epgu/ui/services/breadcrumbs';
import { Link } from '@epgu/ui/models';
import { Observable } from 'rxjs';
import { Translation } from '@epgu/ui/models/common-enums';

@Component({
  selector: 'lib-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  public links$: Observable<Link[]> = this.breadcrumbsService.links$;

  constructor(private breadcrumbsService: BreadcrumbsService) {
  }

  @Input() public translation: Translation | string = Translation.APP;

  public Translation = Translation;

}
