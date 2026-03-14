import { NotificationChannel, NotificationStatus } from './enums';
export interface NotificationLog {
    id: string;
    userId?: string;
    queueEntryId?: string;
    channel: NotificationChannel;
    eventType: string;
    recipient: string;
    content: string;
    status: NotificationStatus;
    sentAt?: Date;
    errorMessage?: string;
    createdAt: Date;
}
export type NotificationEventType = 'queue.entry_created' | 'queue.customer_called' | 'queue.position_2ahead' | 'queue.entry_served' | 'queue.entry_removed' | 'appointment.confirmed' | 'appointment.reminder_24h' | 'appointment.reminder_1h' | 'appointment.cancelled';
