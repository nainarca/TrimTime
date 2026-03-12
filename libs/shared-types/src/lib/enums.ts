// ============================================================
// TrimTime — Shared Enums
// These mirror the Prisma enums for use across all apps
// ============================================================

export enum UserRole {
  CUSTOMER   = 'CUSTOMER',
  BARBER     = 'BARBER',
  SHOP_OWNER = 'SHOP_OWNER',
  ADMIN      = 'ADMIN',
}

export enum BarberStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY      = 'BUSY',
  ON_BREAK  = 'ON_BREAK',
  OFFLINE   = 'OFFLINE',
}

export enum QueueStatus {
  WAITING  = 'WAITING',
  CALLED   = 'CALLED',
  SERVING  = 'SERVING',
  SERVED   = 'SERVED',
  NO_SHOW  = 'NO_SHOW',
  LEFT     = 'LEFT',
  REMOVED  = 'REMOVED',
}

export enum EntryType {
  WALK_IN     = 'WALK_IN',
  APPOINTMENT = 'APPOINTMENT',
}

export enum QrCodeType {
  SHOP     = 'SHOP',
  BRANCH   = 'BRANCH',
  BARBER   = 'BARBER',
  CAMPAIGN = 'CAMPAIGN',
}

export enum AppointmentStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  QUEUED    = 'QUEUED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW   = 'NO_SHOW',
}

export enum SubscriptionStatus {
  ACTIVE    = 'ACTIVE',
  TRIALING  = 'TRIALING',
  PAST_DUE  = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  PAUSED    = 'PAUSED',
}

export enum NotificationChannel {
  SMS      = 'SMS',
  EMAIL    = 'EMAIL',
  PUSH     = 'PUSH',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationStatus {
  PENDING   = 'PENDING',
  SENT      = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED    = 'FAILED',
}

export enum QueueUpdateType {
  ENTRY_ADDED    = 'ENTRY_ADDED',
  ENTRY_REMOVED  = 'ENTRY_REMOVED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  POSITION_SHIFT = 'POSITION_SHIFT',
  QUEUE_PAUSED   = 'QUEUE_PAUSED',
  QUEUE_RESUMED  = 'QUEUE_RESUMED',
}
