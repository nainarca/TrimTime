import { Injectable, Logger } from '@nestjs/common';
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
@Injectable()
export class SmsChannel {
  private readonly logger = new Logger(SmsChannel.name);
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled =
      !!this.config.get('TWILIO_ACCOUNT_SID') &&
      !!this.config.get('TWILIO_AUTH_TOKEN');

    if (!this.enabled) {
      this.logger.log('SMS channel disabled — TWILIO_ACCOUNT_SID not set');
    }
  }

  async send(payload: NotificationPayload, phone: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(
        `[SMS-STUB] To: ${phone} | ${payload.type} | "${payload.message}"`,
      );
      return;
    }

    // ── Twilio implementation (uncomment when ready) ──────────────────────────
    //
    // const client = twilio(
    //   this.config.get('TWILIO_ACCOUNT_SID'),
    //   this.config.get('TWILIO_AUTH_TOKEN'),
    // );
    //
    // await client.messages.create({
    //   from: this.config.get('TWILIO_FROM_NUMBER'),
    //   to:   phone,
    //   body: payload.message,
    // });
    //
    // ─────────────────────────────────────────────────────────────────────────

    this.logger.log(`[SMS] Sent to ${phone}: "${payload.message}"`);
  }
}
