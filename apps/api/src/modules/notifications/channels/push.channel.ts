import { Injectable, Logger } from '@nestjs/common';
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
@Injectable()
export class PushChannel {
  private readonly logger = new Logger(PushChannel.name);
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = !!this.config.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!this.enabled) {
      this.logger.log('Push channel disabled — FIREBASE_SERVICE_ACCOUNT_JSON not set');
    }
  }

  async send(payload: NotificationPayload, fcmToken: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(
        `[PUSH-STUB] Token: ${fcmToken.slice(0, 12)}… | ${payload.type} | "${payload.title}"`,
      );
      return;
    }

    // ── Firebase Admin implementation (uncomment when ready) ─────────────────
    //
    // const app = admin.apps.length
    //   ? admin.app()
    //   : admin.initializeApp({
    //       credential: admin.credential.cert(
    //         JSON.parse(this.config.get('FIREBASE_SERVICE_ACCOUNT_JSON')!),
    //       ),
    //     });
    //
    // await app.messaging().send({
    //   token:        fcmToken,
    //   notification: { title: payload.title, body: payload.message },
    //   data:         { type: payload.type, entryId: payload.entryId },
    //   android:      { priority: payload.priority === 'high' ? 'high' : 'normal' },
    //   apns:         {
    //     payload: { aps: { sound: payload.priority === 'high' ? 'default' : '' } },
    //   },
    // });
    //
    // ─────────────────────────────────────────────────────────────────────────

    this.logger.log(`[PUSH] Sent to ${fcmToken.slice(0, 12)}…: "${payload.title}"`);
  }
}
