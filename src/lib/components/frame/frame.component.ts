import { Component, Input, OnInit } from '@angular/core';
import { FrameType, SizeType } from '../../models/frame-type';

@Component({
  selector: 'lib-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  @Input() public noEffects = false;
  @Input() public bgType: FrameType = 'default';
  @Input() public sizeType: SizeType = 'normal';
  @Input() public disable?: boolean;
  constructor() { }

  public ngOnInit(): void {
  }

}
