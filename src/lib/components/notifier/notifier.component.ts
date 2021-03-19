import { Component, OnInit, OnDestroy, Input, Inject, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notifier, NotifierSetting, NotifierType, NOTIFIER_DEFAULT_SETTING } from '../../models/notifier.model';
import { NotifierService } from '../../services/notifier/notifier.service';
import { AnimationBuilder, style, animate } from '@angular/animations';
import { HelperService } from '../../services/helper/helper.service';


const ANIMATION_TIME = 200;

@Component({
  selector: 'lib-notifier',
  templateUrl: 'notifier.component.html',
  styleUrls: ['./notifier.component.scss']
})
export class NotifierComponent implements OnInit, OnDestroy {
  @Input() public id: string;

  public notifiers: Notifier[] = [];
  public NotifierType = NotifierType;
  public containerTop = 0; // для анимации
  public animationQueue: Array<() => void> = [];
  public animationInProgress = false;

  @ViewChild('notifiersList', {static: false}) private notifiersList: ElementRef;
  private subscription: Subscription;

  constructor(
    @Inject('notifierSetting') public setting: NotifierSetting,
    private notifierService: NotifierService,
    private animationBuilder: AnimationBuilder,
    private renderer: Renderer2,
    private changeDetection: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.setting = Object.assign(NOTIFIER_DEFAULT_SETTING, this.setting);

    this.subscription = this.notifierService.onNotifier(this.id)
      .subscribe(notifier => {
        if (!notifier.message) {
          this.notifiers = [];
          return;
        }

        const handleDone = () => {
          const maxCount = this.setting.singleNotifier ? 1 : this.setting.maxNotificationsCount;
          if (this.notifiers.length > maxCount) {
            this.removeNotifier(this.notifiers[0], false);
            this.changeDetection.detectChanges();
          }
        };
        if (this.setting.animated) {
          const animation = () => {
            this.animationInProgress = true;
            this.notifiers.push(notifier);
            const containerTop = this.notifiersList.nativeElement.getBoundingClientRect().top;
            this.renderer.setStyle(this.notifiersList.nativeElement, 'top', containerTop + 'px');
            this.changeDetection.detectChanges();
            const notifications = this.notifiersList.nativeElement.children;
            const notificationHeight = notifications[notifications.length - 1].offsetHeight;
            const margin = HelperService.isMobile() || this.notifiers.length === 1 ? 0 : 8;
            const animationPlayer = this.animationBuilder.build([
              style({top: containerTop + 'px'}),
              animate(ANIMATION_TIME, style({top: containerTop - notificationHeight - margin + 'px'}))
            ]).create(this.notifiersList.nativeElement);
            animationPlayer.onDone(() => {
              this.animationInProgress = false;
              this.animationQueue = this.animationQueue.filter((animationInQueue) => animationInQueue !== animation);
              animationPlayer.destroy();
              this.renderer.setStyle(this.notifiersList.nativeElement, 'top', null);
              handleDone();
              if (this.animationQueue.length) {
                this.animationQueue.shift()();
              }
            });
            animationPlayer.play();
          };
          this.animationQueue.push(animation);
          if (!this.animationInProgress) {
            animation();
          }
        } else {
          this.notifiers.push(notifier);
          handleDone();
        }
        if (this.setting.removeDelay !== null && this.setting.removeDelay !== undefined) {
          setTimeout(() => {
            this.removeNotifier(notifier, false);
          }, this.setting.removeDelay + (this.setting.animated ? ANIMATION_TIME : 0));
        }
      });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public removeNotifier(notifierToRemove: Notifier, immediate = true): void {
    const index = this.notifiers.findIndex((notifier) => notifier === notifierToRemove);
    if (index === -1) {
      return;
    }
    const handleDone = () => {
      this.notifiers = this.notifiers.filter(notifier => notifier !== notifierToRemove);
      this.changeDetection.detectChanges();
    };
    if (!this.setting.animated || immediate) {
      handleDone();
    } else {
      const closeAllShown = this.setting.showCloseAllCount && this.notifiers.length >= this.setting.showCloseAllCount;
      const notificationPosition = closeAllShown ? index + 1 : index;
      const notification = this.notifiersList.nativeElement.children[notificationPosition];
      const animationPlayer = this.animationBuilder.build([
        style({opacity: 1}), animate(ANIMATION_TIME, style({opacity: 0}))
      ]).create(notification);
      animationPlayer.onDone(() => {
        animationPlayer.destroy();
        this.renderer.setStyle(notification, 'visibility', 'hidden');
        handleDone();
      });
      animationPlayer.play();
    }
  }

  public removeAll(): void {
    this.notifiers = [];
  }

  public cancelNotifier(notifier: Notifier) {
    notifier.onCancel();
    this.removeNotifier(notifier);
  }

  public actionNotifier(notifier: Notifier) {
    notifier.onAction();
    this.removeNotifier(notifier);
  }
}
