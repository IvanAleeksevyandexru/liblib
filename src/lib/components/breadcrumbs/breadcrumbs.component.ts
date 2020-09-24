import { Component, Input } from '@angular/core';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { Translation } from '../../models/common-enums';
import { filter } from 'rxjs/operators';
import { Link } from '../../models/link';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  public links$: Observable<Link[]> = this.breadcrumbsService.links$;

  constructor(private breadcrumbsService: BreadcrumbsService) { }

  @Input() public translation: Translation | string = Translation.APP;

  public Translation = Translation;

}
