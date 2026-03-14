/**
 * Queue API types — GraphQL response shapes shared by admin-dashboard and queue-display.
 * Used by queue queries, subscriptions, and display.
 */

export interface QueueEntry {
  id: string;
  ticketDisplay: string;
  status: string;
  position: number;
  estimatedWaitMins: number | null;
  entryType: string;
  joinedAt: string;
  barberId?: string | null;
  customerId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
}

export interface QueueStats {
  waitingCount: number;
  servingCount: number;
  avgWaitMins: number | null;
  servedTodayCount: number;
}

export interface QueueUpdateEvent {
  shopId: string;
  barberId?: string | null;
  type: string;
  activeEntries: QueueEntry[];
}
