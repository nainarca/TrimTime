import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  NotificationService,
  AppNotification,
  NotificationType,
} from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'tt-notification-toast',
  imports: [CommonModule, IonicModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationToastComponent {
  private readonly notifService = inject(NotificationService);

  /** Exposed so the template can subscribe with the async pipe */
  readonly toasts$ = this.notifService.toasts$;

  dismiss(id: string): void {
    this.notifService.dismiss(id);
  }

  iconFor(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      POSITION_UPDATE: 'arrow-up-circle-outline',
      NEXT_IN_LINE:    'alert-circle-outline',
      NOW_SERVING:     'cut-outline',
    };
    return map[type] ?? 'notifications-outline';
  }

  colorFor(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      POSITION_UPDATE: 'indigo',
      NEXT_IN_LINE:    'amber',
      NOW_SERVING:     'green',
    };
    return map[type] ?? 'indigo';
  }

  trackById(_: number, n: AppNotification): string {
    return n.id;
  }
}
