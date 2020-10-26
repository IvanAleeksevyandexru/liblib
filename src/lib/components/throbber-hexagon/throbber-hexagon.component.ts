import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-throbber-hexagon',
  templateUrl: './throbber-hexagon.component.html',
  styleUrls: ['./throbber-hexagon.component.scss']
})
export class ThrobberHexagonComponent implements OnInit {

  @Input() public size = 'small'; // 'small' | 'medium' | 'big' | те же с префиксами | несколько через пробел

  public staticDomainLibAssetsPath = this.loadService.config.staticDomainLibAssetsPath;

  constructor(private loadService: LoadService) {
  }

  public ngOnInit() {
  }

}
