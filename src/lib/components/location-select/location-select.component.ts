import { Component, OnInit } from '@angular/core';
import { GosbarService } from '../../services/gosbar/gosbar.service';

@Component({
  selector: 'lib-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss']
})
export class LocationSelectComponent implements OnInit {
  public regionName = '';
  public manager = {
    setLocationLabel: (label) => {
      this.regionName = label;
    }
  };


  constructor(
    private gosbarService: GosbarService
  ) { }

  public ngOnInit(): void {
    this.gosbarService.initLocation(this.manager);
  }

  public handleClick() {
    this.gosbarService.popupLocation();
  }
}
