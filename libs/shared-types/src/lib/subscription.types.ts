import { SubscriptionStatus } from './enums';

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripePriceId?: string;
  priceMonthly: number;
  maxBarbers: number;
  maxDailyQueueEntries: number;
  analyticsRetentionDays: number;
  smsCreditsMonthly: number;
  hasAppointments: boolean;
  hasAnalytics: boolean;
  hasMultiBranch: boolean;
  hasApiAccess: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  shopId: string;
  planId: string;
  plan: SubscriptionPlan;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
