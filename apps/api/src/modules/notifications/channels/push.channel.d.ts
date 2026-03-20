import { ConfigService } from '@nestjs/config';
import type { NotificationPayload } from '../types/notification.types';
/**
 * Push notification channel — currently a structured stub.
 *
 * To activate (Firebase Cloud Messaging):
 *   1. `npm install firebase-admin`
 *   2. Set FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_DATABASE_URL in .env
 *   3. Store FCM device tokens on the User model (fcmToken field)
 *   4. Uncomment the FCM block below
 */
export declare class PushChannel {
    private readonly config;
    private readonly logger;
    private readonly enabled;
    constructor(config: ConfigService);
    send(payload: NotificationPayload, fcmToken: string): Promise<void>;
}
