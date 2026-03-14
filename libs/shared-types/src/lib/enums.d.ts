export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    BARBER = "BARBER",
    SHOP_OWNER = "SHOP_OWNER",
    ADMIN = "ADMIN"
}
export declare enum BarberStatus {
    AVAILABLE = "AVAILABLE",
    BUSY = "BUSY",
    ON_BREAK = "ON_BREAK",
    OFFLINE = "OFFLINE"
}
export declare enum QueueStatus {
    WAITING = "WAITING",
    CALLED = "CALLED",
    SERVING = "SERVING",
    SERVED = "SERVED",
    NO_SHOW = "NO_SHOW",
    LEFT = "LEFT",
    REMOVED = "REMOVED"
}
export declare enum EntryType {
    WALK_IN = "WALK_IN",
    APPOINTMENT = "APPOINTMENT"
}
export declare enum QrCodeType {
    SHOP = "SHOP",
    BRANCH = "BRANCH",
    BARBER = "BARBER",
    CAMPAIGN = "CAMPAIGN"
}
export declare enum AppointmentStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    QUEUED = "QUEUED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    TRIALING = "TRIALING",
    PAST_DUE = "PAST_DUE",
    CANCELLED = "CANCELLED",
    PAUSED = "PAUSED"
}
export declare enum NotificationChannel {
    SMS = "SMS",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED"
}
export declare enum QueueUpdateType {
    ENTRY_ADDED = "ENTRY_ADDED",
    ENTRY_REMOVED = "ENTRY_REMOVED",
    STATUS_CHANGED = "STATUS_CHANGED",
    POSITION_SHIFT = "POSITION_SHIFT",
    QUEUE_PAUSED = "QUEUE_PAUSED",
    QUEUE_RESUMED = "QUEUE_RESUMED"
}
