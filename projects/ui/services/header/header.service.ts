import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HeaderService {
    
    public visible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor() {

    }

    public setVisible(val: boolean): void {
        this.visible.next(val);
    }

    public getVisible(): boolean {
        return this.visible.value;
    }
}
