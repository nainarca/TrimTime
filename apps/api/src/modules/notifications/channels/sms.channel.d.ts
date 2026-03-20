import { ConfigService } from '@nestjs/config';
import type { NotificationPayload } from '../types/notification.types';
/**
 * SMS channel — currently a structured stub.
 *
 * To activate:
 *   1. `npm install twilio`
 *   2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env
 *   3. Uncomment the Twilio block below
 *   4. Pass `guestPhone` on the notification payload `data` field
 */
export declare class SmsChannel {
    private readonly config;
    private readonly logger;
    private readonly enabled;
    constructor(config: ConfigService);
    send(payload: NotificationPayload, phone: string): Promise<void>;
}
