import { Component, OnInit } from '@angular/core';
import { GosbarService } from '../../services/gosbar/gosbar.service';
import { LoadAsyncStaticService } from '../../services/load-async-static/load-async-static.service';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-gosbar',
  templateUrl: './gosbar.component.html',
  styleUrls: ['./gosbar.component.scss']
})
export class GosbarComponent implements OnInit {

  constructor(
    private loadService: LoadService,
    private loadAsyncStaticService: LoadAsyncStaticService,
    private gosbarService: GosbarService
  ) { }

  public ngOnInit() {
    this.initGosbar();
  }

  private initGosbar() {
    const gosbarUrl = this.loadService.config.gosbarUrl + '/widget.js?' + this.loadService.config.gosbarResourceVersion;
    (window as any)._govWidget = {
      manualInitMode: true
    };
    this.loadAsyncStaticService.loadScriptAsync(gosbarUrl, true, () => {
      this.gosbarService.initGosbar();
    });
  }
}
